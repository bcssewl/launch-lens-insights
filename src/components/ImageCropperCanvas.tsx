
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CropArea, getInitialCropArea, constrainCropArea, isPointInCropArea } from '@/utils/cropUtils';

interface ImageCropperCanvasProps {
  loadedImage: HTMLImageElement | null;
  isImageLoaded: boolean;
  onImageLoad: (canvas: HTMLCanvasElement) => void;
  onCropAreaChange: (cropArea: CropArea) => void;
  cropArea: CropArea;
}

type DragMode = 'none' | 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | 'resize-top' | 'resize-right' | 'resize-bottom' | 'resize-left';

const ImageCropperCanvas: React.FC<ImageCropperCanvasProps> = ({
  loadedImage,
  isImageLoaded,
  onImageLoad,
  onCropAreaChange,
  cropArea
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCropArea, setInitialCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });

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
      console.log('Setting initial crop area:', initialCropArea);
      onCropAreaChange(initialCropArea);
    }
  }, [isImageLoaded, cropArea.width, onCropAreaChange]);

  const getHandleAt = (x: number, y: number): DragMode => {
    const handleSize = 12;
    const edgeThreshold = 8;
    
    // Check corner handles first
    const corners = [
      { mode: 'resize-tl' as DragMode, x: cropArea.x, y: cropArea.y },
      { mode: 'resize-tr' as DragMode, x: cropArea.x + cropArea.width, y: cropArea.y },
      { mode: 'resize-bl' as DragMode, x: cropArea.x, y: cropArea.y + cropArea.height },
      { mode: 'resize-br' as DragMode, x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height }
    ];
    
    for (const corner of corners) {
      if (Math.abs(x - corner.x) <= handleSize/2 && Math.abs(y - corner.y) <= handleSize/2) {
        return corner.mode;
      }
    }
    
    // Check edge handles
    if (Math.abs(x - cropArea.x) <= edgeThreshold && y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      return 'resize-left';
    }
    if (Math.abs(x - (cropArea.x + cropArea.width)) <= edgeThreshold && y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      return 'resize-right';
    }
    if (Math.abs(y - cropArea.y) <= edgeThreshold && x >= cropArea.x && x <= cropArea.x + cropArea.width) {
      return 'resize-top';
    }
    if (Math.abs(y - (cropArea.y + cropArea.height)) <= edgeThreshold && x >= cropArea.x && x <= cropArea.x + cropArea.width) {
      return 'resize-bottom';
    }
    
    // Check if inside crop area for moving
    if (isPointInCropArea(x, y, cropArea)) {
      return 'move';
    }
    
    return 'none';
  };

  const getCursor = (mode: DragMode): string => {
    switch (mode) {
      case 'resize-tl':
      case 'resize-br':
        return 'nw-resize';
      case 'resize-tr':
      case 'resize-bl':
        return 'ne-resize';
      case 'resize-top':
      case 'resize-bottom':
        return 'n-resize';
      case 'resize-left':
      case 'resize-right':
        return 'e-resize';
      case 'move':
        return 'move';
      default:
        return 'default';
    }
  };

  const drawCropOverlay = useCallback(() => {
    if (!canvasRef.current || !isImageLoaded || !loadedImage || cropArea.width === 0) return;

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
    const sourceX = (cropArea.x / canvas.width) * loadedImage.naturalWidth;
    const sourceY = (cropArea.y / canvas.height) * loadedImage.naturalHeight;
    const sourceWidth = (cropArea.width / canvas.width) * loadedImage.naturalWidth;
    const sourceHeight = (cropArea.height / canvas.height) * loadedImage.naturalHeight;
    
    ctx.drawImage(
      loadedImage,
      sourceX, sourceY, sourceWidth, sourceHeight,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height
    );

    // Draw crop border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Draw corner handles
    const handleSize = 12;
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

    // Draw edge handles
    const edgeHandleSize = 8;
    const edgeHandles = [
      // Top edge
      [cropArea.x + cropArea.width/2 - edgeHandleSize/2, cropArea.y - edgeHandleSize/2],
      // Right edge
      [cropArea.x + cropArea.width - edgeHandleSize/2, cropArea.y + cropArea.height/2 - edgeHandleSize/2],
      // Bottom edge
      [cropArea.x + cropArea.width/2 - edgeHandleSize/2, cropArea.y + cropArea.height - edgeHandleSize/2],
      // Left edge
      [cropArea.x - edgeHandleSize/2, cropArea.y + cropArea.height/2 - edgeHandleSize/2]
    ];
    
    edgeHandles.forEach(([x, y]) => {
      ctx.fillRect(x, y, edgeHandleSize, edgeHandleSize);
      ctx.strokeRect(x, y, edgeHandleSize, edgeHandleSize);
    });
  }, [cropArea, loadedImage, isImageLoaded]);

  useEffect(() => {
    drawCropOverlay();
  }, [drawCropOverlay]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || cropArea.width === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const mode = getHandleAt(x, y);
    setDragMode(mode);
    setDragStart({ x, y });
    setInitialCropArea({ ...cropArea });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragMode === 'none') {
      // Update cursor based on hover position
      const mode = getHandleAt(x, y);
      canvas.style.cursor = getCursor(mode);
      return;
    }

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    let newCropArea = { ...cropArea };

    switch (dragMode) {
      case 'move':
        const newPos = constrainCropArea(
          initialCropArea.x + deltaX,
          initialCropArea.y + deltaY,
          cropArea,
          canvas.width,
          canvas.height
        );
        newCropArea = { ...cropArea, x: newPos.x, y: newPos.y };
        break;

      case 'resize-tl':
        newCropArea = {
          x: Math.min(initialCropArea.x + deltaX, initialCropArea.x + initialCropArea.width - 20),
          y: Math.min(initialCropArea.y + deltaY, initialCropArea.y + initialCropArea.height - 20),
          width: Math.max(20, initialCropArea.width - deltaX),
          height: Math.max(20, initialCropArea.height - deltaY)
        };
        break;

      case 'resize-tr':
        newCropArea = {
          x: initialCropArea.x,
          y: Math.min(initialCropArea.y + deltaY, initialCropArea.y + initialCropArea.height - 20),
          width: Math.max(20, initialCropArea.width + deltaX),
          height: Math.max(20, initialCropArea.height - deltaY)
        };
        break;

      case 'resize-bl':
        newCropArea = {
          x: Math.min(initialCropArea.x + deltaX, initialCropArea.x + initialCropArea.width - 20),
          y: initialCropArea.y,
          width: Math.max(20, initialCropArea.width - deltaX),
          height: Math.max(20, initialCropArea.height + deltaY)
        };
        break;

      case 'resize-br':
        newCropArea = {
          x: initialCropArea.x,
          y: initialCropArea.y,
          width: Math.max(20, initialCropArea.width + deltaX),
          height: Math.max(20, initialCropArea.height + deltaY)
        };
        break;

      case 'resize-top':
        newCropArea = {
          x: initialCropArea.x,
          y: Math.min(initialCropArea.y + deltaY, initialCropArea.y + initialCropArea.height - 20),
          width: initialCropArea.width,
          height: Math.max(20, initialCropArea.height - deltaY)
        };
        break;

      case 'resize-bottom':
        newCropArea = {
          x: initialCropArea.x,
          y: initialCropArea.y,
          width: initialCropArea.width,
          height: Math.max(20, initialCropArea.height + deltaY)
        };
        break;

      case 'resize-left':
        newCropArea = {
          x: Math.min(initialCropArea.x + deltaX, initialCropArea.x + initialCropArea.width - 20),
          y: initialCropArea.y,
          width: Math.max(20, initialCropArea.width - deltaX),
          height: initialCropArea.height
        };
        break;

      case 'resize-right':
        newCropArea = {
          x: initialCropArea.x,
          y: initialCropArea.y,
          width: Math.max(20, initialCropArea.width + deltaX),
          height: initialCropArea.height
        };
        break;
    }

    // Constrain to canvas bounds
    newCropArea.x = Math.max(0, Math.min(newCropArea.x, canvas.width - newCropArea.width));
    newCropArea.y = Math.max(0, Math.min(newCropArea.y, canvas.height - newCropArea.height));
    newCropArea.width = Math.min(newCropArea.width, canvas.width - newCropArea.x);
    newCropArea.height = Math.min(newCropArea.height, canvas.height - newCropArea.y);

    onCropAreaChange(newCropArea);
  };

  const handleMouseUp = () => {
    setDragMode('none');
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-border rounded-lg max-w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {!isImageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg min-h-[200px]">
          <p className="text-sm text-muted-foreground">Loading image...</p>
        </div>
      )}
    </div>
  );
};

export default ImageCropperCanvas;
