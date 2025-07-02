
export const isReportMessage = (content: string): boolean => {
  // Check for minimum length (reduced from 1500 to handle shorter reports)
  if (content.length < 300) return false;
  
  // Count words (approximate)
  const wordCount = content.trim().split(/\s+/).length;
  const isLongContent = wordCount >= 300;
  
  // Count markdown headers
  const headerCount = (content.match(/^#{1,3}\s/gm) || []).length;
  
  // Count tables and code fences
  const tableCount = (content.match(/\|.*\|/g) || []).length;
  const codeFenceCount = (content.match(/```/g) || []).length / 2; // Pairs of fences
  
  // Look for explicit requests
  const contentLower = content.toLowerCase();
  const explicitRequests = [
    'create a report',
    'create an analysis',
    'create a proposal',
    'generate a report',
    'generate an analysis',
    'generate a proposal'
  ];
  const hasExplicitRequest = explicitRequests.some(request => 
    contentLower.includes(request)
  );
  
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
  
  const sectionMatches = reportSections.filter(section => 
    contentLower.includes(section)
  ).length;
  
  // Check for structured content indicators
  const hasStructure = tableCount >= 2 || // Multiple tables
                      codeFenceCount >= 1 || // Code blocks
                      headerCount >= 3; // Multiple sections
  
  // Trigger canvas if:
  // 1. Long content (300+ words) OR
  // 2. Multiple structured elements OR
  // 3. Explicit request OR
  // 4. Multiple report sections with some structure
  return isLongContent || 
         (headerCount >= 2 && (tableCount >= 1 || codeFenceCount >= 1)) ||
         hasExplicitRequest ||
         (sectionMatches >= 2 && hasStructure);
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

export const generateCanvasAcknowledgment = (content: string): string => {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('market analysis')) {
    return "I've prepared a comprehensive market analysis report for you.";
  } else if (contentLower.includes('financial analysis')) {
    return "Here's your detailed financial analysis breakdown.";
  } else if (contentLower.includes('swot analysis')) {
    return "I've created a SWOT analysis document for your review.";
  } else if (contentLower.includes('business plan')) {
    return "Your business plan document is ready for review.";
  } else if (contentLower.includes('strategy')) {
    return "I've developed a strategic analysis for your consideration.";
  } else {
    return "I've prepared a detailed report for your review.";
  }
};
