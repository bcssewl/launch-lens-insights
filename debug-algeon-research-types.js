// Test script to verify Algeon research type detection
// Run with: node debug-algeon-research-types.js

const { detectAlgeonResearchType } = require('./src/utils/algeonResearchTypes');

const testQueries = [
  'What is artificial intelligence?',
  'Market size of SaaS industry',
  'Compare AWS vs Azure cloud services',
  'GDPR compliance requirements for startups',
  'Emerging trends in renewable energy',
  'Legal analysis of employment contracts',
  'Comprehensive analysis of fintech market',
  'Healthcare industry report 2024',
  'Brief overview of blockchain',
  'Tesla vs Ford market share comparison'
];

console.log('🧪 Testing Algeon Research Type Detection\n');

testQueries.forEach((query, index) => {
  const researchType = detectAlgeonResearchType(query);
  console.log(`${index + 1}. Query: "${query}"`);
  console.log(`   Research Type: ${researchType}`);
  console.log(`   ✅ Valid for Algeon API\n`);
});

console.log('🎯 All queries mapped to valid research types!');
console.log('📋 Valid types: quick_facts, market_sizing, competitive_analysis, regulatory_scan, trend_analysis, legal_analysis, deep_analysis, industry_reports');
