
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { usePitchDeckUpload } from '@/hooks/usePitchDeckUpload';

interface PitchDeckUploaderProps {
  onComplete: (uploadId: string, transcriptionText?: string) => void;
  onBack: () => void;
}

const PitchDeckUploader: React.FC<PitchDeckUploaderProps> = ({ onComplete, onBack }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadPitchDeck, isUploading, uploadProgress } = usePitchDeckUpload();

  const acceptedTypes = [
    'application/pdf'
  ];

  const handleFileSelect = (file: File) => {
    if (!acceptedTypes.includes(file.type)) {
      alert('Please upload a PDF document only');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setUploadCompleted(false);
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
    setUploadCompleted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processDocument = async () => {
    if (!uploadedFile) return;

    const result = await uploadPitchDeck(uploadedFile);
    
    if (result) {
      setUploadCompleted(true);
      // Wait a moment to show the success state, then proceed
      setTimeout(() => {
        onComplete(result.uploadId, result.transcriptionText);
      }, 1000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    return '📄'; // PDF icon for all files since we only accept PDF
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Upload Your Pitch Deck</CardTitle>
        <p className="text-muted-foreground">
          Share your existing presentation or business plan document (PDF only)
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
            <h3 className="text-lg font-semibold mb-2">Drop your PDF file here</h3>
            <p className="text-muted-foreground mb-4">
              or click to browse your files
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Choose PDF File
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Supported format: PDF • Max size: 10MB
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
                {!isUploading && !uploadCompleted && (
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

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {uploadProgress < 50 ? 'Uploading PDF...' : 
                     uploadProgress < 75 ? 'Processing upload...' : 
                     'Analyzing PDF content...'}
                  </span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground text-center">
                  This may take up to 30 seconds to process your PDF
                </p>
              </div>
            )}

            {uploadCompleted && (
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="font-medium text-green-600">PDF processed successfully!</p>
                <p className="text-sm text-muted-foreground">Proceeding to form...</p>
              </div>
            )}

            {!isUploading && !uploadCompleted && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">What we'll extract from your PDF:</h4>
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
                  disabled={isUploading}
                >
                  Upload & Process PDF
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} disabled={isUploading}>
            Back to Options
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleFileInputChange}
        />
      </CardContent>
    </Card>
  );
};

export default PitchDeckUploader;
