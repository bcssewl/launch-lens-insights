
export interface CanvasDecision {
  needsCanvas: boolean;
  action: 'createDocument' | 'updateDocument' | 'none';
  documentId?: string;
  documentType: 'business_analysis' | 'market_research' | 'financial_analysis' | 'general_report';
}

export interface SessionState {
  priorCanvasOpen: boolean;
  priorCanvasId: string | null;
  lastMessageWasCanvasUpdate: boolean;
}

const REPORT_TRIGGER_KEYWORDS = [
  'analyze', 'report', 'analysis', 'research', 'study', 'overview',
  'summary', 'breakdown', 'evaluation', 'assessment', 'investigation',
  'review', 'examination', 'survey', 'comparison', 'benchmark',
  'forecast', 'projection', 'plan', 'strategy', 'roadmap',
  'business plan', 'market research', 'financial analysis',
  'competitive analysis', 'swot analysis', 'risk assessment'
];

const FOLLOW_UP_KEYWORDS = [
  'update', 'revise', 'modify', 'change', 'edit', 'tweak',
  'adjust', 'improve', 'enhance', 'refine', 'add to',
  'expand', 'extend', 'continue', 'build on'
];

const STRUCTURAL_PATTERNS = {
  heading: /^#{1,6}\s+.+$/m,
  table: /^\s*\|.+\|.+\|/m,
  codeBlock: /```[\s\S]*?```/,
  numberedList: /^\d+\.\s+/m,
  bulletList: /^[-*+]\s+/m,
  chartingCode: /(plt\.|chart|graph|visualization)/i
};

export function detectCanvasNeed(
  message: string, 
  responseDraft: string, 
  sessionState: SessionState
): boolean {
  // Check for report trigger keywords in message
  const hasReportKeywords = REPORT_TRIGGER_KEYWORDS.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );

  // Check token count (approximate) - increased threshold for better quality detection
  const tokenCount = responseDraft.split(/\s+/).length;
  const isLongResponse = tokenCount > 500;

  // Check for substantial structured content
  const hasStructuralContent = Object.values(STRUCTURAL_PATTERNS).some(pattern => 
    pattern.test(responseDraft)
  );

  // Check content quality - look for comprehensive reports with multiple sections
  const hasMultipleSections = (responseDraft.match(/^#{1,6}\s+/gm) || []).length >= 3;
  const hasSubstantialContent = responseDraft.length > 2000;

  // Check if this is a follow-up to existing canvas
  const isFollowUp = sessionState.priorCanvasOpen && 
    FOLLOW_UP_KEYWORDS.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

  return hasReportKeywords || (isLongResponse && hasStructuralContent) || 
         (hasMultipleSections && hasSubstantialContent) || isFollowUp;
}

export function determineCanvasAction(
  message: string,
  sessionState: SessionState
): CanvasDecision {
  const needsCanvas = true; // This function is called only when canvas is needed
  
  // Check if this is a follow-up to existing canvas with substantial prior content
  const isFollowUp = sessionState.priorCanvasOpen && 
    FOLLOW_UP_KEYWORDS.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

  // Determine document type based on keywords with better classification
  let documentType: CanvasDecision['documentType'] = 'general_report';
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('business') || lowerMessage.includes('company') || lowerMessage.includes('startup')) {
    documentType = 'business_analysis';
  } else if (lowerMessage.includes('market') || lowerMessage.includes('industry') || lowerMessage.includes('eu') || lowerMessage.includes('european')) {
    documentType = 'market_research';
  } else if (lowerMessage.includes('financial') || lowerMessage.includes('revenue') || lowerMessage.includes('budget') || lowerMessage.includes('investment')) {
    documentType = 'financial_analysis';
  }

  // Only update if we have a clear follow-up and existing canvas
  if (isFollowUp && sessionState.priorCanvasId && !sessionState.lastMessageWasCanvasUpdate) {
    return {
      needsCanvas,
      action: 'updateDocument',
      documentId: sessionState.priorCanvasId,
      documentType
    };
  }

  return {
    needsCanvas,
    action: 'createDocument',
    documentType
  };
}

export function extractDocumentTitle(content: string): string {
  // Try to extract title from first heading
  const headingMatch = content.match(/^#{1,6}\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  // Try to extract from first line if it looks like a title
  const firstLine = content.split('\n')[0].trim();
  if (firstLine && firstLine.length < 100 && !firstLine.includes('.') && !firstLine.toLowerCase().includes('comprehensive')) {
    return firstLine;
  }

  // Look for specific report patterns
  if (content.toLowerCase().includes('eu market') || content.toLowerCase().includes('european union')) {
    return 'EU Market-Entry Strategy';
  }

  // Generate a meaningful title based on content keywords
  const keywords = content.toLowerCase().match(/\b(strategy|analysis|report|plan|research|market|business|financial)\b/g);
  if (keywords && keywords.length > 0) {
    const uniqueKeywords = [...new Set(keywords)];
    return uniqueKeywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Report';
  }

  // Fallback to content-based title
  const words = content.split(/\s+/).slice(0, 8);
  return words.join(' ').substring(0, 50) + (words.length > 8 ? '...' : '');
}
