
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Crop, Check, X } from 'lucide-react';
import { useImageLoader } from '@/hooks/useImageLoader';
import { CropArea, cropImageToCanvas } from '@/utils/cropUtils';
import ImageCropperCanvas from './ImageCropperCanvas';

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
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  
  const {
    loadedImage,
    isImageLoaded,
    loadImage
  } = useImageLoader({ imageFile, isOpen });

  const handleCrop = async () => {
    if (!imageFile || !loadedImage) {
      console.error('Missing required data for cropping:', { imageFile: !!imageFile, loadedImage: !!loadedImage });
      return;
    }

    console.log('Starting crop with area:', cropArea);
    
    // Get canvas dimensions for scaling calculation
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    const blob = await cropImageToCanvas(
      loadedImage,
      cropArea,
      canvas.width,
      canvas.height
    );

    if (blob) {
      const croppedFile = new File([blob], imageFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      console.log('Crop completed, file size:', croppedFile.size);
      onCropComplete(croppedFile);
    } else {
      console.error('Failed to create blob from crop');
    }
  };

  // Reset crop area when dialog closes
  const handleClose = () => {
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    onClose();
  };

  console.log('ImageCropper render - isOpen:', isOpen, 'imageFile:', !!imageFile, 'isImageLoaded:', isImageLoaded);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Crop Profile Picture
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {imageFile && (
            <ImageCropperCanvas
              loadedImage={loadedImage}
              isImageLoaded={isImageLoaded}
              onImageLoad={loadImage}
              onCropAreaChange={setCropArea}
              cropArea={cropArea}
            />
          )}
          
          <p className="text-sm text-muted-foreground text-center">
            {isImageLoaded ? 
              "Drag the crop area to position your photo. The image will be resized to 300x300 pixels." :
              "Loading image..."
            }
          </p>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleCrop} disabled={!isImageLoaded || cropArea.width === 0}>
            <Check className="mr-2 h-4 w-4" />
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
