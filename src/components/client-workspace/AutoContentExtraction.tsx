
import React, { useEffect } from 'react';
import { useContentExtraction } from '@/hooks/useContentExtraction';

interface AutoContentExtractionProps {
  fileId: string;
  fileName: string;
  hasContent: boolean;
}

const AutoContentExtraction: React.FC<AutoContentExtractionProps> = ({
  fileId,
  fileName,
  hasContent
}) => {
  const { autoExtractOnUpload } = useContentExtraction();

  useEffect(() => {
    // Only auto-extract if the file doesn't have content yet
    if (!hasContent) {
      console.log('Auto-extracting content for:', fileName);
      autoExtractOnUpload(fileId, fileName);
    }
  }, [fileId, fileName, hasContent, autoExtractOnUpload]);

  return null; // This is a headless component
};

export default AutoContentExtraction;
