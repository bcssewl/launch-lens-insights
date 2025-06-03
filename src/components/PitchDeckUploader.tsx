
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PitchDeckUploaderProps {
  onComplete: (file: File) => void;
  onBack: () => void;
}

const PitchDeckUploader: React.FC<PitchDeckUploaderProps> = ({ onComplete, onBack }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const handleFileSelect = (file: File) => {
    if (!acceptedTypes.includes(file.type)) {
      alert('Please upload a PDF, PowerPoint, or Word document');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processDocument = () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate processing with progress
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(uploadedFile), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('presentation')) return '📊';
    if (fileType.includes('powerpoint')) return '📊';
    if (fileType.includes('word')) return '📝';
    return '📄';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Upload Your Pitch Deck</CardTitle>
        <p className="text-muted-foreground">
          Share your existing presentation or business plan document
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drop your file here</h3>
            <p className="text-muted-foreground mb-4">
              or click to browse your files
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Choose File
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Supported formats: PDF, PowerPoint, Word • Max size: 10MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(uploadedFile.type)}</span>
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                </div>
                {!isProcessing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    className="p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing document...</span>
                  <span className="text-sm text-muted-foreground">{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="w-full" />
              </div>
            )}

            {!isProcessing && processingProgress === 0 && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">What we'll extract:</h4>
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                        <li>• Business concept and problem statement</li>
                        <li>• Target market and customer segments</li>
                        <li>• Revenue model and pricing strategy</li>
                        <li>• Competitive landscape analysis</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={processDocument} 
                  className="w-full gradient-button"
                  size="lg"
                >
                  Process Document
                </Button>
              </div>
            )}

            {processingProgress === 100 && (
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="font-medium text-green-600">Document processed successfully!</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back to Options
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.ppt,.pptx,.doc,.docx"
          onChange={handleFileInputChange}
        />
      </CardContent>
    </Card>
  );
};

export default PitchDeckUploader;
