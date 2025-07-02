
export const isReportMessage = (content: string): boolean => {
  // Check for minimum word count (approximately 300 words)
  const wordCount = content.trim().split(/\s+/).length;
  return wordCount >= 300;
};

export const getReportPreview = (content: string, maxLength: number = 200): string => {
  // Find the first substantial paragraph after any initial headers
  const lines = content.split('\n');
  let preview = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    // Skip headers and empty lines
    if (trimmedLine.startsWith('#') || trimmedLine === '') continue;
    
    // Take the first substantial content
    if (trimmedLine.length > 0) {
      preview = trimmedLine;
      break;
    }
  }
  
  // Fallback to beginning of content if no suitable line found
  if (!preview) {
    preview = content.trim();
  }
  
  return preview.length > maxLength 
    ? preview.substring(0, maxLength) + '...' 
    : preview;
};
