
export const isReportMessage = (content: string): boolean => {
  // Check for minimum length
  if (content.length < 1500) return false;
  
  // Count markdown headers
  const headerCount = (content.match(/^#{1,3}\s/gm) || []).length;
  
  // Look for common report sections
  const reportSections = [
    'executive summary',
    'market analysis',
    'financial analysis',
    'recommendations',
    'conclusion',
    'swot analysis',
    'competitive analysis',
    'strategy',
    'implementation'
  ];
  
  const contentLower = content.toLowerCase();
  const sectionMatches = reportSections.filter(section => 
    contentLower.includes(section)
  ).length;
  
  // Check for structured content indicators
  const hasStructure = content.includes('|') || // Tables
                      content.includes('- ') || // Lists
                      content.includes('1. ') || // Numbered lists
                      headerCount >= 3; // Multiple sections
  
  // Consider it a report if it has multiple sections and structure
  return sectionMatches >= 2 && hasStructure;
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
