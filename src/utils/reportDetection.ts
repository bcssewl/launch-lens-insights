// This utility is now deprecated as report detection is handled in the backend
// Keeping minimal functions for backwards compatibility

export const isReportMessage = (content: string): boolean => {
  // Always return false since reports are now handled via dual response system
  return false;
};

export const getReportPreview = (content: string, maxLength: number = 200): string => {
  // Simple preview function for any content
  const lines = content.split('\n');
  let preview = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('#') || trimmedLine === '') continue;
    
    if (trimmedLine.length > 0) {
      preview = trimmedLine;
      break;
    }
  }
  
  if (!preview) {
    preview = content.trim();
  }
  
  return preview.length > maxLength 
    ? preview.substring(0, maxLength) + '...' 
    : preview;
};
