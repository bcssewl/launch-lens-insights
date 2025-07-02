
import React from 'react';
import { X, Download, Printer, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasHeaderProps {
  title: string;
  isEditing: boolean;
  onDownload?: () => void;
  onPrint?: () => void;
  onEdit: () => void;
  onClose: () => void;
}

const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  title,
  isEditing,
  onDownload,
  onPrint,
  onEdit,
  onClose
}) => {
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('CanvasHeader: Download clicked');
    onDownload?.();
  };

  const handlePrintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('CanvasHeader: Print clicked');
    onPrint?.();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('CanvasHeader: Close button clicked');
    onClose();
  };

  return (
    <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <h2 id="canvas-title" className="text-lg font-semibold text-foreground truncate max-w-md">
        {title} {isEditing && <span className="text-sm text-orange-500">(Editing)</span>}
      </h2>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditClick}
          disabled={isEditing}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
        {onDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadClick}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
        {onPrint && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintClick}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCloseClick}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Close
        </Button>
      </div>
    </div>
  );
};

export default CanvasHeader;
