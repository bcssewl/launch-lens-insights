export interface ParsedFinancialData {
  marketOpportunity?: {
    totalAddressableMarket: string;
    serviceableMarketSegment: string;
    annualGrowthRate: string;
    marketDrivers: string[];
  };
  revenueModelAnalysis?: {
    viabilityScore: number;
    modelFit: string;
    estimatedMargins: string;
    scalabilityPotential: string;
  };
  pricingStrategy?: {
    recommendedTiers: Array<{
      tier: string;
      price: string;
      target: string;
      features: string;
    }>;
    annualDiscount?: string;
    competitivePositioning?: string;
  };
  financialProjections?: {
    year_1?: any;
    year_2?: any;
    year_3?: any;
    breakEvenPoint?: string;
  };
  fundingRequirements?: {
    seedStage?: string;
    seriesAPotential?: string;
    allocation?: Record<string, string>;
    keyMilestones?: string[];
  };
  // Keep existing structure for backward compatibility
  keyMetrics?: {
    totalStartupCost: number;
    monthlyBurnRate: number;
    breakEvenMonth: number;
    fundingNeeded: number;
  };
  startupCosts?: any[];
  operatingCosts?: any[];
  revenueProjections?: any[];
  breakEvenAnalysis?: any[];
}

export const parseFinancialData = (financialAnalysis: any): ParsedFinancialData => {
  // If it's already in the expected format, return it
  if (financialAnalysis && typeof financialAnalysis === 'object' && !Array.isArray(financialAnalysis)) {
    return financialAnalysis;
  }

  // Handle array format from AI response
  if (Array.isArray(financialAnalysis) && financialAnalysis.length > 0) {
    const firstItem = financialAnalysis[0];
    
    // Check if it has an 'output' field with markdown content
    if (firstItem.output && typeof firstItem.output === 'string') {
      try {
        // Extract JSON from markdown
        const jsonMatch = firstItem.output.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          const jsonContent = JSON.parse(jsonMatch[1]);
          const financialData = jsonContent.financial_analysis;
          
          if (financialData) {
            return {
              marketOpportunity: financialData.market_opportunity ? {
                totalAddressableMarket: financialData.market_opportunity.total_addressable_market || '',
                serviceableMarketSegment: financialData.market_opportunity.serviceable_market_segment || '',
                annualGrowthRate: financialData.market_opportunity.annual_growth_rate || '',
                marketDrivers: financialData.market_opportunity.market_drivers || []
              } : undefined,
              revenueModelAnalysis: financialData.revenue_model_analysis ? {
                viabilityScore: financialData.revenue_model_analysis.viability_score || 0,
                modelFit: financialData.revenue_model_analysis.model_fit || '',
                estimatedMargins: financialData.revenue_model_analysis.estimated_margins || '',
                scalabilityPotential: financialData.revenue_model_analysis.scalability_potential || ''
              } : undefined,
              pricingStrategy: financialData.pricing_strategy ? {
                recommendedTiers: financialData.pricing_strategy.recommended_tiers || [],
                annualDiscount: financialData.pricing_strategy.annual_discount,
                competitivePositioning: financialData.pricing_strategy.competitive_positioning
              } : undefined,
              financialProjections: financialData.financial_projections || undefined,
              fundingRequirements: financialData.funding_requirements ? {
                seedStage: financialData.funding_requirements.seed_stage,
                seriesAPotential: financialData.funding_requirements.series_a_potential,
                allocation: financialData.funding_requirements.allocation,
                keyMilestones: financialData.funding_requirements.key_milestones
              } : undefined,
              // Provide fallback values for legacy components
              keyMetrics: {
                totalStartupCost: 100000,
                monthlyBurnRate: 15000,
                breakEvenMonth: 18,
                fundingNeeded: 1000000
              },
              startupCosts: [],
              operatingCosts: [],
              revenueProjections: [],
              breakEvenAnalysis: []
            };
          }
        }
      } catch (error) {
        console.error('Error parsing financial JSON:', error);
      }
    }
  }

  // Return default structure if parsing fails
  return {
    keyMetrics: {
      totalStartupCost: 50000,
      monthlyBurnRate: 8000,
      breakEvenMonth: 8,
      fundingNeeded: 100000
    },
    startupCosts: [],
    operatingCosts: [],
    revenueProjections: [],
    breakEvenAnalysis: []
  };
};
