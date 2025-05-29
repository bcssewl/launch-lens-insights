
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const getInitialCropArea = (canvasWidth: number, canvasHeight: number): CropArea => {
  // Set initial crop area to a smaller square in the center (30% of smallest dimension)
  const cropSize = Math.min(canvasWidth, canvasHeight) * 0.3;
  return {
    x: (canvasWidth - cropSize) / 2,
    y: (canvasHeight - cropSize) / 2,
    width: cropSize,
    height: cropSize
  };
};

export const constrainCropArea = (
  newX: number,
  newY: number,
  cropArea: CropArea,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } => {
  const constrainedX = Math.max(0, Math.min(newX, canvasWidth - cropArea.width));
  const constrainedY = Math.max(0, Math.min(newY, canvasHeight - cropArea.height));
  
  return { x: constrainedX, y: constrainedY };
};

export const isPointInCropArea = (x: number, y: number, cropArea: CropArea): boolean => {
  return x >= cropArea.x && x <= cropArea.x + cropArea.width &&
         y >= cropArea.y && y <= cropArea.y + cropArea.height;
};

export const cropImageToCanvas = async (
  loadedImage: HTMLImageElement,
  cropArea: CropArea,
  originalCanvasWidth: number,
  originalCanvasHeight: number,
  outputSize: number = 300
): Promise<Blob | null> => {
  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) return null;

  // Set crop canvas to square dimensions
  cropCanvas.width = outputSize;
  cropCanvas.height = outputSize;

  // Calculate the scale factor between displayed image and original image
  const scaleX = loadedImage.naturalWidth / originalCanvasWidth;
  const scaleY = loadedImage.naturalHeight / originalCanvasHeight;

  // Crop from original image coordinates
  cropCtx.drawImage(
    loadedImage,
    cropArea.x * scaleX,
    cropArea.y * scaleY,
    cropArea.width * scaleX,
    cropArea.height * scaleY,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve) => {
    cropCanvas.toBlob(resolve, 'image/jpeg', 0.9);
  });
};
