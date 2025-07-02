
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

  // Check token count (approximate)
  const tokenCount = responseDraft.split(/\s+/).length;
  const isLongResponse = tokenCount > 300;

  // Check for structural markers in response
  const hasStructuralContent = Object.values(STRUCTURAL_PATTERNS).some(pattern => 
    pattern.test(responseDraft)
  );

  // Check if this is a follow-up to existing canvas
  const isFollowUp = sessionState.priorCanvasOpen && 
    FOLLOW_UP_KEYWORDS.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

  return hasReportKeywords || isLongResponse || hasStructuralContent || isFollowUp;
}

export function determineCanvasAction(
  message: string,
  sessionState: SessionState
): CanvasDecision {
  const needsCanvas = true; // This function is called only when canvas is needed
  
  // Check if this is a follow-up to existing canvas
  const isFollowUp = sessionState.priorCanvasOpen && 
    FOLLOW_UP_KEYWORDS.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

  // Determine document type based on keywords
  let documentType: CanvasDecision['documentType'] = 'general_report';
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('business') || lowerMessage.includes('company')) {
    documentType = 'business_analysis';
  } else if (lowerMessage.includes('market') || lowerMessage.includes('industry')) {
    documentType = 'market_research';
  } else if (lowerMessage.includes('financial') || lowerMessage.includes('revenue') || lowerMessage.includes('budget')) {
    documentType = 'financial_analysis';
  }

  if (isFollowUp && sessionState.priorCanvasId) {
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
  if (firstLine && firstLine.length < 100 && !firstLine.includes('.')) {
    return firstLine;
  }

  // Generate a default title based on content
  const words = content.split(/\s+/).slice(0, 10);
  return words.join(' ').substring(0, 50) + '...';
}
