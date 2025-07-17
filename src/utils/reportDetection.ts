
export const isReportMessage = (content: string, metadata?: { isCompleted?: boolean; messageType?: string; streamedBy?: string }): boolean => {
  // If we have metadata indicating this is a completed report, check for that first
  if (metadata?.isCompleted === true || metadata?.messageType === 'completed_report') {
    return true;
  }
  
  // If it's explicitly marked as progress update, don't treat as report
  if (metadata?.messageType === 'progress_update') {
    return false;
  }
  
  // NEW: If content was streamed by Algeon, don't immediately show as canvas report
  // Let users read the full streamed content first
  if (metadata?.streamedBy === 'algeon') {
    return false;
  }
  
  // For Stratix reports, only consider them reports if they contain completion indicators
  if (content.includes('📊 Stratix Research Report') || content.includes('Research Report')) {
    // Check if this is a completed research report (not progress)
    const hasCompletionIndicators = 
      content.includes('Research Details') || // Final formatted report
      content.includes('## Research Complete') || // Completion section
      (content.includes('Research Report') && !content.includes('⚡') && !content.includes('📊 **Preliminary')); // Not progress updates
    
    return hasCompletionIndicators;
  }
  
  // For other types of reports (business validation, etc.), use word count as before
  // but exclude obvious progress indicators and Algeon streamed content
  const wordCount = content.trim().split(/\s+/).length;
  const hasProgressIndicators = content.includes('⚡') || content.includes('📊 **Preliminary') || content.includes('**Agent Update:**');
  
  return wordCount >= 300 && !hasProgressIndicators;
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
