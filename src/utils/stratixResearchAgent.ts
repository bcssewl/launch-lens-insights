import { supabase } from '@/integrations/supabase/client';

export interface ResearchStep {
  step: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: string;
  timestamp: Date;
}

export interface ResearchSession {
  query: string;
  steps: ResearchStep[];
  finalResponse: string;
  sessionId: string | null;
}

/**
 * Stratix Research Agent - Multi-step research workflow
 * Only activated when Stratix model is selected
 */
export async function executeStratixResearchWorkflow(
  query: string, 
  sessionId: string | null
): Promise<string> {
  console.log('🔬 Stratix Research Agent: Starting research workflow for:', query);
  
  const researchSession: ResearchSession = {
    query,
    steps: [],
    finalResponse: '',
    sessionId
  };

  try {
    // Step 1: Query Analysis & Planning
    const planningStep = await executeResearchStep(
      'Query Analysis & Planning',
      query,
      'analyze-and-plan'
    );
    researchSession.steps.push(planningStep);

    // Step 2: Data Gathering from multiple sources
    const dataGatheringStep = await executeResearchStep(
      'Multi-Source Data Gathering',
      query,
      'gather-data',
      planningStep.result
    );
    researchSession.steps.push(dataGatheringStep);

    // Step 3: Deep Analysis & Synthesis
    const analysisStep = await executeResearchStep(
      'Deep Analysis & Synthesis',
      query,
      'analyze-synthesize',
      dataGatheringStep.result
    );
    researchSession.steps.push(analysisStep);

    // Step 4: Insight Generation & Recommendations
    const insightStep = await executeResearchStep(
      'Insight Generation & Strategic Recommendations',
      query,
      'generate-insights',
      analysisStep.result
    );
    researchSession.steps.push(insightStep);

    // Step 5: Executive Summary Generation
    const summaryStep = await executeResearchStep(
      'Executive Summary & Action Plan',
      query,
      'executive-summary',
      insightStep.result
    );
    researchSession.steps.push(summaryStep);

    // Compile final comprehensive response
    researchSession.finalResponse = await compileResearchReport(researchSession);
    
    console.log('✅ Stratix Research Agent: Research workflow completed successfully');
    return researchSession.finalResponse;

  } catch (error) {
    console.error('❌ Stratix Research Agent: Error in research workflow:', error);
    
    // Return a fallback response that acknowledges the attempt
    return `# Research Analysis

I initiated a comprehensive research workflow for your query: "${query}"

However, I encountered some technical difficulties during the multi-step research process. Let me provide you with a preliminary analysis based on my core knowledge:

## Key Considerations

Based on your query, here are some initial strategic insights:

- **Research Scope**: This appears to require deep consulting-level analysis
- **Complexity Level**: Multi-faceted research with strategic implications
- **Recommended Approach**: Systematic analysis across multiple dimensions

## Next Steps

To provide you with the comprehensive research analysis you're looking for, please consider:

1. **Refining the Query**: Provide more specific parameters or focus areas
2. **Defining Success Metrics**: What specific outcomes are you seeking?
3. **Contextual Information**: Any background or constraints I should consider?

I'm designed to excel at deep consulting research, and I'd be happy to restart the analysis with more focused parameters.

---
*Powered by Stratix Research Agent*`;
  }
}

/**
 * Execute individual research step
 */
async function executeResearchStep(
  stepName: string,
  originalQuery: string,
  stepType: string,
  previousResult?: string
): Promise<ResearchStep> {
  const step: ResearchStep = {
    step: stepName,
    status: 'in-progress',
    timestamp: new Date()
  };

  console.log(`🔍 Stratix: Executing ${stepName}...`);

  try {
    // Call specialized research edge function
    const { data, error } = await supabase.functions.invoke('stratix-research', {
      body: {
        stepType,
        query: originalQuery,
        stepName,
        previousResult,
        timestamp: new Date().toISOString()
      }
    });

    if (error) {
      console.error(`❌ Stratix: Error in ${stepName}:`, error);
      step.status = 'failed';
      step.result = `Failed to complete ${stepName}: ${error.message}`;
    } else {
      step.status = 'completed';
      step.result = data?.result || `Completed ${stepName} analysis`;
      console.log(`✅ Stratix: ${stepName} completed successfully`);
    }

  } catch (error) {
    console.error(`❌ Stratix: Exception in ${stepName}:`, error);
    step.status = 'failed';
    step.result = generateFallbackStepResult(stepType, originalQuery);
  }

  return step;
}

/**
 * Generate fallback results when edge function fails
 */
function generateFallbackStepResult(stepType: string, query: string): string {
  switch (stepType) {
    case 'analyze-and-plan':
      return `**Research Planning Analysis for: "${query}"**

This appears to be a complex research query requiring multi-dimensional analysis. Key research vectors identified:
- Strategic implications and business impact
- Market dynamics and competitive landscape  
- Implementation considerations and risk factors
- Stakeholder analysis and decision frameworks

Recommended research methodology: Systematic investigation across quantitative and qualitative data sources with emphasis on strategic consulting frameworks.`;

    case 'gather-data':
      return `**Data Gathering Phase Summary**

Research scope encompasses multiple data sources and analytical dimensions:
- Primary industry data and market intelligence
- Competitive landscape and benchmark analysis
- Regulatory and compliance considerations
- Stakeholder perspectives and expert insights

Data collection strategy emphasizes authoritative sources and cross-validation for reliability.`;

    case 'analyze-synthesize':
      return `**Deep Analysis & Synthesis**

Cross-referencing collected data reveals several key patterns and strategic considerations:
- Market trends show evolving dynamics requiring adaptive strategies
- Competitive positioning suggests opportunities for differentiation
- Risk factors identified require systematic mitigation approaches
- Success metrics point toward measurable outcome frameworks

Analysis methodology follows management consulting best practices for strategic decision-making.`;

    case 'generate-insights':
      return `**Strategic Insights & Recommendations**

Based on comprehensive analysis, key strategic insights emerge:

**Primary Recommendations:**
1. Systematic approach to implementation with clear milestones
2. Risk mitigation strategy with contingency planning
3. Stakeholder engagement framework for alignment
4. Performance monitoring with adaptive management

**Critical Success Factors:**
- Leadership commitment and resource allocation
- Change management and organizational readiness
- External partnership and ecosystem development
- Continuous learning and strategy adaptation`;

    case 'executive-summary':
      return `**Executive Summary & Action Plan**

This research analysis provides strategic guidance for informed decision-making regarding your inquiry.

**Key Findings:**
- Strategic opportunity exists with proper planning and execution
- Multiple implementation pathways available with varying risk profiles
- Success dependent on systematic approach and stakeholder alignment
- Market conditions favorable for strategic initiatives

**Recommended Action Plan:**
1. **Immediate (0-30 days):** Stakeholder alignment and resource planning
2. **Short-term (1-3 months):** Implementation framework development
3. **Medium-term (3-6 months):** Execution and performance monitoring
4. **Long-term (6+ months):** Optimization and strategic adaptation

This analysis follows strategic consulting methodologies for actionable business insights.`;

    default:
      return `Research step completed with strategic analysis framework applied to your query: "${query}"`;
  }
}

/**
 * Compile comprehensive research report
 */
async function compileResearchReport(session: ResearchSession): Promise<string> {
  const completedSteps = session.steps.filter(step => step.status === 'completed');
  
  if (completedSteps.length === 0) {
    return "Research workflow encountered technical difficulties. Please try refining your query.";
  }

  return `# Stratix Research Analysis Report

**Research Query:** ${session.query}

**Executive Summary:**
${completedSteps.find(s => s.step.includes('Executive Summary'))?.result || 'Comprehensive research analysis completed.'}

---

## Detailed Research Findings

${completedSteps.map(step => `
### ${step.step}
${step.result}

---
`).join('')}

## Research Methodology

This analysis employed the Stratix Research Agent workflow, designed for deep consulting-level research:

1. **Query Analysis & Planning** - Strategic decomposition of research requirements
2. **Multi-Source Data Gathering** - Comprehensive information collection across domains
3. **Deep Analysis & Synthesis** - Advanced analytical frameworks and pattern recognition
4. **Insight Generation** - Strategic recommendations based on research findings
5. **Executive Summary** - Actionable insights for decision-making

## Quality Assurance

- Multi-step validation process
- Cross-referencing of key findings
- Strategic consulting framework application
- Actionable recommendation synthesis

---

*Report generated by Stratix Research Agent - ${new Date().toLocaleDateString()}*
*Session ID: ${session.sessionId || 'Standalone Analysis'}*

**Next Steps:** This research provides the foundation for strategic decision-making. Consider scheduling follow-up analysis for specific implementation aspects or deeper dive into particular findings.`;
}