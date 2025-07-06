
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileText
} from 'lucide-react';
import { ClientFile } from '@/hooks/useClientFiles';
import { useContentExtraction } from '@/hooks/useContentExtraction';

interface BatchContentExtractionProps {
  files: ClientFile[];
  onComplete?: () => void;
}

const BatchContentExtraction: React.FC<BatchContentExtractionProps> = ({ 
  files, 
  onComplete 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { batchExtractContent } = useContentExtraction();

  const filesWithoutContent = files.filter(file => 
    !file.content_extracted_at || !file.file_content_text
  );

  const handleBatchExtraction = async () => {
    if (filesWithoutContent.length === 0) return;

    setIsProcessing(true);
    setResults([]);

    try {
      const fileIds = filesWithoutContent.map(f => f.id);
      const extractionResults = await batchExtractContent(fileIds);
      setResults(extractionResults);
      onComplete?.();
    } catch (error) {
      console.error('Batch extraction error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (filesWithoutContent.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-medium mb-2">All Files Processed</h3>
            <p className="text-sm text-muted-foreground">
              Content has been extracted from all uploaded files.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Extraction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {filesWithoutContent.length} files need content extraction
            </p>
            <p className="text-sm text-muted-foreground">
              Extract text content to enable Ask Nexus functionality
            </p>
          </div>
          <Button 
            onClick={handleBatchExtraction}
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isProcessing ? 'Processing...' : 'Extract All'}
          </Button>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing files...</span>
              <span>{Math.round((results.length / filesWithoutContent.length) * 100)}%</span>
            </div>
            <Progress value={(results.length / filesWithoutContent.length) * 100} />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Processing Results:</h4>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Success: {results.filter(r => r.success).length}
              </Badge>
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Failed: {results.filter(r => !r.success).length}
              </Badge>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>Files pending extraction:</p>
          <ul className="mt-1 space-y-1">
            {filesWithoutContent.slice(0, 5).map(file => (
              <li key={file.id} className="truncate">• {file.file_name}</li>
            ))}
            {filesWithoutContent.length > 5 && (
              <li>• ... and {filesWithoutContent.length - 5} more</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchContentExtraction;
