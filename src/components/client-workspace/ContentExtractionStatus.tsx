
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { ClientFile } from '@/hooks/useClientFiles';
import { useContentExtraction } from '@/hooks/useContentExtraction';

interface ContentExtractionStatusProps {
  file: ClientFile;
  size?: 'sm' | 'md';
}

const ContentExtractionStatus: React.FC<ContentExtractionStatusProps> = ({ 
  file, 
  size = 'md' 
}) => {
  const { extractContent, getExtractionStatus } = useContentExtraction();
  const extractionStatus = getExtractionStatus(file.id);

  console.log('ContentExtractionStatus for file:', file.file_name, {
    content_extracted_at: file.content_extracted_at,
    file_content_text: file.file_content_text ? 'Present' : 'Not present',
    extractionStatus: extractionStatus?.status
  });

  // Check if content has been extracted
  const hasExtractedContent = Boolean(file.content_extracted_at && file.file_content_text);
  const isExtracting = extractionStatus?.status === 'processing';
  const hasFailed = extractionStatus?.status === 'failed';

  const handleExtractContent = async () => {
    console.log('Triggering content extraction for file:', file.file_name);
    await extractContent(file.id, file.file_name);
  };

  const getStatusBadge = () => {
    if (isExtracting) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Extracting...
        </Badge>
      );
    }

    if (hasFailed) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    }

    if (hasExtractedContent) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Content Ready
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="gap-1">
        <FileText className="h-3 w-3" />
        Not Extracted
      </Badge>
    );
  };

  const getActionButton = () => {
    if (isExtracting) {
      return null;
    }

    if (!hasExtractedContent || hasFailed) {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={handleExtractContent}
          className="gap-1"
        >
          <Download className="h-3 w-3" />
          Extract Content
        </Button>
      );
    }

    return null;
  };

  if (size === 'sm') {
    return getStatusBadge();
  }

  return (
    <div className="flex items-center gap-2">
      {getStatusBadge()}
      {getActionButton()}
    </div>
  );
};

export default ContentExtractionStatus;
