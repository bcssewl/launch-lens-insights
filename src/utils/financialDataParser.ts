
export interface MarketOpportunity {
  total_addressable_market: string;
  serviceable_market_segment: string;
  annual_growth_rate: string;
  market_drivers: string[];
}

export interface RevenueModelAnalysis {
  viability_score: number;
  model_fit: string;
  estimated_margins: string;
  scalability_potential: string;
}

export interface PricingTier {
  tier: string;
  price: string;
  target: string;
  features: string;
}

export interface PricingStrategy {
  recommended_tiers: PricingTier[];
  annual_discount: string;
  competitive_positioning: string;
}

export interface YearlyProjection {
  customers: string;
  revenue: string;
  expenses: string;
  net_income: string;
}

export interface FinancialProjections {
  year_1: YearlyProjection;
  year_2: YearlyProjection;
  year_3: YearlyProjection;
  break_even_point: string;
}

export interface FundingRequirements {
  seed_stage: string;
  series_a_potential: string;
  allocation: {
    product_development: string;
    sales_and_marketing: string;
    operations: string;
    reserve: string;
  };
  key_milestones: string[];
}

export interface ParsedFinancialAnalysis {
  market_opportunity: MarketOpportunity;
  revenue_model_analysis: RevenueModelAnalysis;
  pricing_strategy: PricingStrategy;
  financial_projections: FinancialProjections;
  funding_requirements: FundingRequirements;
}

export const parseFinancialAnalysis = (data: any): ParsedFinancialAnalysis | null => {
  try {
    // Check if data is an array with output containing JSON
    if (Array.isArray(data) && data.length > 0 && data[0].output) {
      const output = data[0].output;
      
      // Extract JSON from markdown text
      const jsonMatch = output.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        return jsonData.financial_analysis;
      }
    }
    
    // Check if data already has the parsed structure
    if (data && data.market_opportunity) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing financial analysis:', error);
    return null;
  }
};

export const formatCurrency = (value: string | number): string => {
  if (typeof value === 'string') {
    // Extract numbers from string like "$650,000-850,000" or "$2.75 billion"
    const match = value.match(/\$?([\d,]+(?:\.\d+)?)/);
    if (match) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (value.includes('billion')) {
        return `$${(num * 1000000000).toLocaleString()}`;
      } else if (value.includes('million')) {
        return `$${(num * 1000000).toLocaleString()}`;
      }
      return `$${num.toLocaleString()}`;
    }
    return value;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const extractNumericValue = (value: string): number => {
  const match = value.match(/([\d,]+(?:\.\d+)?)/);
  if (match) {
    const numStr = match[1].replace(/,/g, '');
    const num = parseFloat(numStr);
    if (value.includes('billion')) {
      return num * 1000000000;
    } else if (value.includes('million')) {
      return num * 1000000;
    }
    return num;
  }
  return 0;
};
