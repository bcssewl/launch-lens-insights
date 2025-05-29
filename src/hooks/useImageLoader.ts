
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
      console.log('Image loaded successfully');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to fit the image while maintaining aspect ratio
      const maxSize = 600;
      let { naturalWidth: width, naturalHeight: height } = img;
      
      // Calculate scale factor to fit image in canvas while maintaining aspect ratio
      const scale = Math.min(maxSize / width, maxSize / height);
      width = width * scale;
      height = height * scale;

      canvas.width = width;
      canvas.height = height;
      
      // Clear canvas and draw image
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      setLoadedImage(img);
      setIsImageLoaded(true);
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
    loadImage,
    setIsImageLoaded,
    setLoadedImage
  };
};
