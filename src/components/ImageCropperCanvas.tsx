
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CropArea, getInitialCropArea, constrainCropArea, isPointInCropArea } from '@/utils/cropUtils';

interface ImageCropperCanvasProps {
  loadedImage: HTMLImageElement | null;
  isImageLoaded: boolean;
  onImageLoad: (canvas: HTMLCanvasElement) => void;
  onCropAreaChange: (cropArea: CropArea) => void;
  cropArea: CropArea;
}

const ImageCropperCanvas: React.FC<ImageCropperCanvasProps> = ({
  loadedImage,
  isImageLoaded,
  onImageLoad,
  onCropAreaChange,
  cropArea
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image when component mounts or image changes
  useEffect(() => {
    if (canvasRef.current) {
      onImageLoad(canvasRef.current);
    }
  }, [onImageLoad]);

  // Set initial crop area when image is loaded
  useEffect(() => {
    if (isImageLoaded && canvasRef.current && cropArea.width === 0) {
      const canvas = canvasRef.current;
      const initialCropArea = getInitialCropArea(canvas.width, canvas.height);
      onCropAreaChange(initialCropArea);
    }
  }, [isImageLoaded, cropArea.width, onCropAreaChange]);

  const drawCropOverlay = useCallback(() => {
    if (!canvasRef.current || !isImageLoaded || !loadedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw the original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);

    // Draw dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear the crop area to show the original image
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    
    // Reset composite operation and redraw the crop area with original image
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(loadedImage, 
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height
    );

    // Draw crop border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Draw corner handles
    const handleSize = 10;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    const handles = [
      [cropArea.x - handleSize/2, cropArea.y - handleSize/2],
      [cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2],
      [cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2],
      [cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2]
    ];
    
    handles.forEach(([x, y]) => {
      ctx.fillRect(x, y, handleSize, handleSize);
      ctx.strokeRect(x, y, handleSize, handleSize);
    });
  }, [cropArea, loadedImage, isImageLoaded]);

  useEffect(() => {
    if (isImageLoaded && loadedImage && cropArea.width > 0) {
      drawCropOverlay();
    }
  }, [drawCropOverlay, isImageLoaded, loadedImage, cropArea]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is inside crop area
    if (isPointInCropArea(x, y, cropArea)) {
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

    const newPos = constrainCropArea(
      x - dragStart.x,
      y - dragStart.y,
      cropArea,
      canvas.width,
      canvas.height
    );

    onCropAreaChange({ ...cropArea, x: newPos.x, y: newPos.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-border rounded-lg cursor-move max-w-full"
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
  );
};

export default ImageCropperCanvas;
