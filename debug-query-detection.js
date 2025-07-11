// Debug function to test query detection
const testQuery = (query) => {
  const trimmedPrompt = query.trim().toLowerCase();
  
  // Simple conversations - never stream
  const simplePatterns = [
    /^(hello|hi|hey|good morning|good afternoon)[\s\?\.!]*$/,
    /^(how are you|how\'s it going|what\'s up)[\s\?\.!]*$/,
    /^(thanks|thank you|thx|ty)[\s\?\.!]*$/,
    /^(ok|okay|alright|good|great|cool)[\s\?\.!]*$/,
    /^(who are you|what are you|what can you do)[\s\?\.!]*$/,
    /^(bye|goodbye|see you|talk later)[\s\?\.!]*$/
  ];
  
  if (simplePatterns.some(pattern => pattern.test(trimmedPrompt))) {
    console.log('Simple query detected - should NOT stream');
    return false;
  }
  
  // Research indicators - use streaming
  const researchKeywords = [
    'analyze', 'research', 'competitive', 'market', 'strategy', 'trends',
    'industry', 'growth', 'opportunities', 'insights', 'report', 'study',
    'comparison', 'evaluation', 'assessment', 'forecast', 'outlook',
    'landscape', 'ecosystem', 'regulations', 'compliance'
  ];
  
  const hasResearchKeywords = researchKeywords.some(keyword => 
    trimmedPrompt.includes(keyword)
  );
  
  // Complex query indicators
  const isLongQuery = query.length > 30;
  const hasQuestionWords = /\b(what|how|why|when|where|which|should|could|would)\b/i.test(query);
  
  const shouldStream = hasResearchKeywords || (isLongQuery && hasQuestionWords);
  
  console.log('Query analysis:', {
    query,
    trimmedPrompt,
    hasResearchKeywords,
    isLongQuery,
    hasQuestionWords,
    shouldStream
  });
  
  return shouldStream;
};

// Test some queries
console.log('=== Query Detection Tests ===');
testQuery('Hello');
testQuery('Analyze the fintech market');
testQuery('What are the latest trends in AI?');
testQuery('Tell me about machine learning');
console.log('=== End Tests ===');
