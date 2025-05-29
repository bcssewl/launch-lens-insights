
import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Crop, RotateCcw, Check, X } from 'lucide-react';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedFile: File) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  imageFile,
  onCropComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const loadImage = useCallback(() => {
    if (!imageFile) return;

    const img = new Image();
    img.onload = () => {
      if (imageRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to fit the image while maintaining aspect ratio
        const maxSize = 400;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);

        // Set initial crop area to a square in the center
        const cropSize = Math.min(width, height) * 0.8;
        setCropArea({
          x: (width - cropSize) / 2,
          y: (height - cropSize) / 2,
          width: cropSize,
          height: cropSize
        });

        setIsImageLoaded(true);
      }
    };
    img.src = URL.createObjectURL(imageFile);
  }, [imageFile]);

  React.useEffect(() => {
    if (isOpen && imageFile) {
      setIsImageLoaded(false);
      loadImage();
    }
  }, [isOpen, imageFile, loadImage]);

  const drawCropOverlay = useCallback(() => {
    if (!canvasRef.current || !isImageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redraw the original image
    if (imageFile) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Clear the crop area
        ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
        ctx.drawImage(img, 
          cropArea.x, cropArea.y, cropArea.width, cropArea.height,
          cropArea.x, cropArea.y, cropArea.width, cropArea.height
        );

        // Draw crop border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

        // Draw corner handles
        const handleSize = 8;
        ctx.fillStyle = '#fff';
        ctx.fillRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
        ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
        ctx.fillRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
        ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
      };
      img.src = URL.createObjectURL(imageFile);
    }
  }, [cropArea, imageFile, isImageLoaded]);

  React.useEffect(() => {
    drawCropOverlay();
  }, [drawCropOverlay]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is inside crop area
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newX = Math.max(0, Math.min(x - dragStart.x, canvas.width - cropArea.width));
    const newY = Math.max(0, Math.min(y - dragStart.y, canvas.height - cropArea.height));

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = async () => {
    if (!canvasRef.current || !imageFile) return;

    const canvas = canvasRef.current;
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    // Set crop canvas to square dimensions
    const size = 300; // Final size for profile picture
    cropCanvas.width = size;
    cropCanvas.height = size;

    // Load original image and crop it
    const img = new Image();
    img.onload = () => {
      // Calculate the scale factor between displayed image and original image
      const scaleX = img.width / canvas.width;
      const scaleY = img.height / canvas.height;

      // Crop from original image coordinates
      cropCtx.drawImage(
        img,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        size,
        size
      );

      // Convert to blob and create file
      cropCanvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], imageFile.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          onCropComplete(croppedFile);
        }
      }, 'image/jpeg', 0.9);
    };
    img.src = URL.createObjectURL(imageFile);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Crop Profile Picture
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {imageFile && (
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="border border-border rounded-lg cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Loading image...</p>
                </div>
              )}
            </div>
          )}
          
          <p className="text-sm text-muted-foreground text-center">
            Drag the crop area to position your photo. The image will be resized to 300x300 pixels.
          </p>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleCrop} disabled={!isImageLoaded}>
            <Check className="mr-2 h-4 w-4" />
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
