
import { useState, useEffect, useCallback } from 'react';

interface UseImageLoaderProps {
  imageFile: File | null;
  isOpen: boolean;
}

export const useImageLoader = ({ imageFile, isOpen }: UseImageLoaderProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Create and manage image URL
  useEffect(() => {
    if (imageFile && isOpen) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
        setImageUrl(null);
      };
    } else {
      setImageUrl(null);
    }
  }, [imageFile, isOpen]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsImageLoaded(false);
      setLoadedImage(null);
    }
  }, [isOpen]);

  const loadImage = useCallback((canvas: HTMLCanvasElement) => {
    if (!imageUrl || !canvas) return;

    console.log('Loading image:', imageUrl);
    const img = new Image();
    
    img.onload = () => {
      console.log('Image loaded successfully, dimensions:', img.naturalWidth, 'x', img.naturalHeight);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate display size while maintaining aspect ratio
      const maxDisplaySize = 400;
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      
      let displayWidth, displayHeight;
      if (aspectRatio > 1) {
        // Landscape
        displayWidth = Math.min(maxDisplaySize, img.naturalWidth);
        displayHeight = displayWidth / aspectRatio;
      } else {
        // Portrait or square
        displayHeight = Math.min(maxDisplaySize, img.naturalHeight);
        displayWidth = displayHeight * aspectRatio;
      }

      // Set canvas size
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      // Draw image
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      setLoadedImage(img);
      setIsImageLoaded(true);
      console.log('Image loaded and drawn to canvas');
    };

    img.onerror = (error) => {
      console.error('Failed to load image:', error);
      setIsImageLoaded(false);
      setLoadedImage(null);
    };

    img.src = imageUrl;
  }, [imageUrl]);

  return {
    imageUrl,
    loadedImage,
    isImageLoaded,
    loadImage
  };
};
