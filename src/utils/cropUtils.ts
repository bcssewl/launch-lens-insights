
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const getInitialCropArea = (canvasWidth: number, canvasHeight: number): CropArea => {
  // Create a square crop area that's 60% of the smaller dimension
  const cropSize = Math.min(canvasWidth, canvasHeight) * 0.6;
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
  canvasWidth: number,
  canvasHeight: number,
  outputSize: number = 300
): Promise<Blob | null> => {
  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) return null;

  // Set output canvas to square dimensions
  cropCanvas.width = outputSize;
  cropCanvas.height = outputSize;

  // Calculate the scale factors between displayed canvas and original image
  const scaleX = loadedImage.naturalWidth / canvasWidth;
  const scaleY = loadedImage.naturalHeight / canvasHeight;

  // Calculate source coordinates in original image
  const sourceX = cropArea.x * scaleX;
  const sourceY = cropArea.y * scaleY;
  const sourceWidth = cropArea.width * scaleX;
  const sourceHeight = cropArea.height * scaleY;

  // Draw the cropped portion to the output canvas
  cropCtx.drawImage(
    loadedImage,
    sourceX, sourceY, sourceWidth, sourceHeight,
    0, 0, outputSize, outputSize
  );

  return new Promise((resolve) => {
    cropCanvas.toBlob(resolve, 'image/jpeg', 0.9);
  });
};
