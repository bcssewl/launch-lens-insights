
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, FileText, AlertCircle } from 'lucide-react';
import { useContentExtraction, ExtractionStatus } from '@/hooks/useContentExtraction';

interface ExtractionProgressBarProps {
  fileId: string;
  fileName: string;
  onComplete?: () => void;
}

const ExtractionProgressBar: React.FC<ExtractionProgressBarProps> = ({
  fileId,
  fileName,
  onComplete
}) => {
  const { getExtractionStatus } = useContentExtraction();
  const [status, setStatus] = useState<ExtractionStatus | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentStatus = getExtractionStatus(fileId);
      setStatus(currentStatus);
      
      if (currentStatus?.status === 'completed' && !showCompleted) {
        setShowCompleted(true);
        onComplete?.();
        
        // Hide after 5 seconds
        setTimeout(() => {
          setShowCompleted(false);
        }, 5000);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [fileId, getExtractionStatus, showCompleted, onComplete]);

  if (!status) {
    return null;
  }

  if (status.status === 'completed' && showCompleted) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
        <CheckCircle className="h-5 w-5 text-green-600 animate-scale-in" />
        <div className="flex-1">
          <div className="font-medium text-green-800">Content Extracted Successfully!</div>
          <div className="text-sm text-green-600">
            {fileName} processed with Gemini AI • {status.extractedLength} characters extracted
          </div>
        </div>
      </div>
    );
  }

  if (status.status === 'failed') {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <div className="flex-1">
          <div className="font-medium text-red-800">Extraction Failed</div>
          <div className="text-sm text-red-600">{status.error}</div>
        </div>
      </div>
    );
  }

  if (status.status === 'processing') {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium text-blue-800">Processing with Gemini AI...</div>
            <Badge variant="secondary" className="text-xs">
              {status.progress || 0}%
            </Badge>
          </div>
          <div className="text-sm text-blue-600 mb-2">
            <FileText className="h-3 w-3 inline mr-1" />
            Extracting content from {fileName}
          </div>
          <Progress 
            value={status.progress || 0} 
            className="h-2 bg-blue-100" 
          />
        </div>
      </div>
    );
  }

  return null;
};

export default ExtractionProgressBar;
