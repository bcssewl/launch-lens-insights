import React, { useEffect, useState } from 'react';
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
  const { autoExtractOnUpload, getExtractionStatus } = useContentExtraction();
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    // Only auto-extract if the file doesn't have content yet
    if (!hasContent) {
      console.log('Auto-extracting content with Gemini for:', fileName);
      setShowProgress(true);
      autoExtractOnUpload(fileId, fileName);
    }
  }, [fileId, fileName, hasContent, autoExtractOnUpload]);

  useEffect(() => {
    // Monitor extraction status to show/hide progress bar
    const interval = setInterval(() => {
      const status = getExtractionStatus(fileId);
      if (status) {
        setShowProgress(true);
        
        if (status.status === 'completed' || status.status === 'failed') {
          // Keep showing for a bit after completion
          setTimeout(() => {
            if (status.status === 'completed') {
              setShowProgress(false);
            }
          }, 6000);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [fileId, getExtractionStatus]);

  const handleExtractionComplete = () => {
    onExtractionComplete?.();
    setTimeout(() => {
      setShowProgress(false);
    }, 5000);
  };

  if (!showProgress) {
    return null;
  }

  return (
    <div className="mb-4">
      <ExtractionProgressBar
        fileId={fileId}
        fileName={fileName}
        onComplete={handleExtractionComplete}
      />
    </div>
  );
};

export default AutoContentExtraction;
