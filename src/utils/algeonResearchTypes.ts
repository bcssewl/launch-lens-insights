
// Valid research types for Algeon API
export type AlgeonResearchType = 
  | 'best'
  | 'quick_facts'
  | 'market_sizing'
  | 'competitive_analysis'
  | 'regulatory_scan'
  | 'trend_analysis'
  | 'legal_analysis'
  | 'deep_analysis'
  | 'industry_reports';

// Map of research types to their corresponding AI models
const RESEARCH_TYPE_MODELS: Record<AlgeonResearchType, string> = {
  'best': 'Sonar Reasoning Pro', // Default for best mode, can be overridden by detection
  'quick_facts': 'Sonar',
  'market_sizing': 'Sonar Pro',
  'competitive_analysis': 'Sonar Reasoning Pro',
  'regulatory_scan': 'Sonar Pro',
  'trend_analysis': 'Sonar Deep Research',
  'legal_analysis': 'R1-1776',
  'deep_analysis': 'Sonar Deep Research',
  'industry_reports': 'Sonar Deep Research'
};

// Keywords that help identify the research type
const RESEARCH_TYPE_KEYWORDS: Record<AlgeonResearchType, string[]> = {
  'best': [], // No specific keywords for best mode
  'quick_facts': ['what is', 'define', 'explain', 'overview', 'summary', 'brief'],
  'market_sizing': ['market size', 'tam', 'sam', 'som', 'market value', 'market worth', 'revenue potential'],
  'competitive_analysis': ['competitors', 'competition', 'competitive landscape', 'market players', 'rivals'],
  'regulatory_scan': ['regulations', 'compliance', 'legal requirements', 'regulatory', 'laws', 'policies'],
  'trend_analysis': ['trends', 'future', 'emerging', 'developments', 'outlook', 'forecast'],
  'legal_analysis': ['legal', 'lawsuit', 'litigation', 'patent', 'intellectual property', 'copyright'],
  'deep_analysis': ['comprehensive', 'detailed', 'in-depth', 'thorough', 'deep dive', 'analyze'],
  'industry_reports': ['industry report', 'sector analysis', 'industry overview', 'market report']
};

/**
 * Detects the appropriate research type based on the query content
 */
export function detectAlgeonResearchType(query: string): AlgeonResearchType {
  const lowerQuery = query.toLowerCase();
  
  // Check for specific research type keywords
  for (const [type, keywords] of Object.entries(RESEARCH_TYPE_KEYWORDS)) {
    if (type === 'best') continue; // Skip best mode in detection
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      return type as AlgeonResearchType;
    }
  }
  
  // Default fallback based on query complexity
  if (lowerQuery.length < 50) {
    return 'quick_facts';
  } else if (lowerQuery.includes('market') || lowerQuery.includes('industry')) {
    return 'market_sizing';
  } else {
    return 'deep_analysis';
  }
}

/**
 * Gets the AI model name for a given research type
 */
export function getModelForResearchType(type: AlgeonResearchType): string {
  return RESEARCH_TYPE_MODELS[type];
}

/**
 * Automatically determines the best research type and model for a query
 * Used when research type is set to "best"
 */
export function getBestResearchTypeForQuery(query: string): {
  researchType: AlgeonResearchType;
  model: string;
} {
  const detectedType = detectAlgeonResearchType(query);
  return {
    researchType: detectedType,
    model: getModelForResearchType(detectedType)
  };
}
