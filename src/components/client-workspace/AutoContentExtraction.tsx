
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useContentExtraction } from '@/hooks/useContentExtraction';
import ExtractionProgressBar from './ExtractionProgressBar';

interface AutoContentExtractionProps {
  fileId: string;
  fileName: string;
  hasContent: boolean;
  onExtractionComplete?: () => void;
}

const AutoContentExtraction: React.FC<AutoContentExtractionProps> = ({
  fileId,
  fileName,
  hasContent,
  onExtractionComplete
}) => {
  const { extractContent, getExtractionStatus } = useContentExtraction();
  const [showProgress, setShowProgress] = useState(false);
  const [hasStartedExtraction, setHasStartedExtraction] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const extractionAttemptedRef = useRef(false);

  // Memoized extraction handler to prevent recreation on every render
  const handleExtraction = useCallback(async () => {
    // Prevent multiple extraction attempts for the same file
    if (extractionAttemptedRef.current || hasContent || hasStartedExtraction) {
      return;
    }

    console.log('Starting auto-extraction for:', fileName, 'fileId:', fileId);
    extractionAttemptedRef.current = true;
    setHasStartedExtraction(true);
    setShowProgress(true);
    
    try {
      await extractContent(fileId, fileName);
    } catch (error) {
      console.error('Auto-extraction failed:', error);
      // Reset flags on error to allow retry after some time
      setTimeout(() => {
        extractionAttemptedRef.current = false;
        setHasStartedExtraction(false);
      }, 30000); // 30 second cooldown before allowing retry
    }
  }, [fileId, fileName, hasContent, hasStartedExtraction, extractContent]);

  // Initial extraction trigger - only runs once per file
  useEffect(() => {
    if (!hasContent && !extractionAttemptedRef.current) {
      handleExtraction();
    }
  }, [fileId, hasContent, handleExtraction]);

  // Status monitoring
  useEffect(() => {
    if (!showProgress) return;

    intervalRef.current = setInterval(() => {
      const status = getExtractionStatus(fileId);
      
      if (status) {
        if (status.status === 'completed') {
          setShowProgress(false);
          onExtractionComplete?.();
          // Clear the interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        } else if (status.status === 'failed') {
          // Hide progress after showing error for a bit
          setTimeout(() => {
            setShowProgress(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          }, 5000);
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fileId, showProgress, getExtractionStatus, onExtractionComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!showProgress) {
    return null;
  }

  return (
    <div className="mb-4">
      <ExtractionProgressBar
        fileId={fileId}
        fileName={fileName}
        onComplete={() => {
          onExtractionComplete?.();
          setShowProgress(false);
        }}
      />
    </div>
  );
};

export default AutoContentExtraction;
