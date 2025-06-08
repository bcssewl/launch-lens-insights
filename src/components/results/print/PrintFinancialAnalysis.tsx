import React from 'react';
import PrintIcon from './PrintIcon';
import { parseFinancialAnalysis, formatCurrency, extractNumericValue, type ParsedFinancialAnalysis } from '@/utils/financialDataParser';

interface PrintFinancialAnalysisProps {
  data: any;
}

const PrintFinancialAnalysis: React.FC<PrintFinancialAnalysisProps> = ({ data }) => {
  const parsedData = parseFinancialAnalysis(data);

  // Fallback to legacy format if new format is not available
  if (!parsedData) {
    return <LegacyPrintFinancialAnalysis data={data} />;
  }

  const { market_opportunity, revenue_model_analysis, pricing_strategy, financial_projections, funding_requirements } = parsedData;

  return (
    <div className="print-page-break print-section">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
          <PrintIcon name="financial" size={24} color="white" />
        </div>
        <h2 className="print-title-2 text-slate-800">5.0 Financial Analysis</h2>
      </div>
      
      {/* Market Opportunity */}
      <div className="print-avoid-break mb-8">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="market" size={18} color="#475569" />
          Market Opportunity
        </h3>
        <div className="print-grid-2">
          <div className="print-metric-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="print-metric-value text-blue-600">
              {market_opportunity.total_addressable_market}
            </div>
            <div className="print-metric-label">Total Addressable Market</div>
          </div>
          <div className="print-metric-card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <div className="print-metric-value text-emerald-600">
              {market_opportunity.serviceable_market_segment}
            </div>
            <div className="print-metric-label">Serviceable Market</div>
          </div>
          <div className="print-metric-card bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
            <div className="print-metric-value text-violet-600">
              {market_opportunity.annual_growth_rate}
            </div>
            <div className="print-metric-label">Annual Growth Rate</div>
          </div>
          <div className="print-metric-card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <div className="print-metric-value text-amber-600">
              {revenue_model_analysis.viability_score}/10
            </div>
            <div className="print-metric-label">Viability Score</div>
          </div>
        </div>
      </div>

      {/* Revenue Model Analysis */}
      <div className="print-avoid-break mb-8">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="detailed-scores" size={18} color="#475569" />
          Revenue Model Analysis
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <PrintIcon name="strengths" size={16} color="#059669" />
              <span className="font-medium text-gray-800">Model Fit</span>
            </div>
            <span className="print-status-high">{revenue_model_analysis.model_fit.split('-')[0].trim()}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <PrintIcon name="financial" size={16} color="#d97706" />
              <span className="font-medium text-gray-800">Estimated Margins</span>
            </div>
            <span className="print-status-medium">{revenue_model_analysis.estimated_margins}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <PrintIcon name="opportunities" size={16} color="#059669" />
              <span className="font-medium text-gray-800">Scalability</span>
            </div>
            <span className="print-status-high">{revenue_model_analysis.scalability_potential}</span>
          </div>
        </div>
      </div>

      {/* Pricing Strategy */}
      <div className="print-avoid-break mb-8">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="financial" size={18} color="#475569" />
          Pricing Strategy
        </h3>
        <div className="print-grid-3">
          {pricing_strategy.recommended_tiers.map((tier, index) => (
            <div key={index} className="print-card border-2">
              <div className="text-center mb-3">
                <div className="font-bold text-lg text-slate-700">{tier.tier}</div>
                <div className="text-2xl font-bold text-primary mb-1">{tier.price}</div>
                <div className="text-sm text-gray-600">{tier.target}</div>
              </div>
              <div className="text-sm text-gray-700">{tier.features}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Annual Discount: </span>
              {pricing_strategy.annual_discount}
            </div>
            <div>
              <span className="font-medium">Competitive Position: </span>
              {pricing_strategy.competitive_positioning}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Projections */}
      <div className="print-avoid-break mb-8">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="detailed-scores" size={18} color="#475569" />
          3-Year Financial Projections
        </h3>
        <table className="print-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Customers</th>
              <th>Revenue</th>
              <th>Expenses</th>
              <th>Net Income</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-medium">Year 1</td>
              <td>{financial_projections.year_1.customers}</td>
              <td>{financial_projections.year_1.revenue}</td>
              <td>{financial_projections.year_1.expenses}</td>
              <td className={financial_projections.year_1.net_income.includes('(') ? 'text-red-600' : 'text-green-600'}>
                {financial_projections.year_1.net_income}
              </td>
            </tr>
            <tr>
              <td className="font-medium">Year 2</td>
              <td>{financial_projections.year_2.customers}</td>
              <td>{financial_projections.year_2.revenue}</td>
              <td>{financial_projections.year_2.expenses}</td>
              <td className="text-green-600">{financial_projections.year_2.net_income}</td>
            </tr>
            <tr>
              <td className="font-medium">Year 3</td>
              <td>{financial_projections.year_3.customers}</td>
              <td>{financial_projections.year_3.revenue}</td>
              <td>{financial_projections.year_3.expenses}</td>
              <td className="text-green-600">{financial_projections.year_3.net_income}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="font-medium text-emerald-800">
            Break-even Point: {financial_projections.break_even_point}
          </div>
        </div>
      </div>

      {/* Funding Requirements */}
      <div className="print-avoid-break mb-8">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="actions" size={18} color="#475569" />
          Funding Requirements
        </h3>
        <div className="print-grid-2 mb-4">
          <div className="print-metric-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="print-metric-value text-purple-600">
              {funding_requirements.seed_stage}
            </div>
            <div className="print-metric-label">Seed Stage</div>
          </div>
          <div className="print-metric-card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <div className="print-metric-value text-indigo-600">
              {funding_requirements.series_a_potential}
            </div>
            <div className="print-metric-label">Series A Potential</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Funding Allocation</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Product Development:</span>
                <span className="font-medium">{funding_requirements.allocation.product_development}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales & Marketing:</span>
                <span className="font-medium">{funding_requirements.allocation.sales_and_marketing}</span>
              </div>
              <div className="flex justify-between">
                <span>Operations:</span>
                <span className="font-medium">{funding_requirements.allocation.operations}</span>
              </div>
              <div className="flex justify-between">
                <span>Reserve:</span>
                <span className="font-medium">{funding_requirements.allocation.reserve}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Key Milestones</h4>
            <ul className="space-y-1 text-sm">
              {funding_requirements.key_milestones.map((milestone, index) => (
                <li key={index} className="flex items-start gap-2">
                  <PrintIcon name="strengths" size={12} color="#059669" />
                  {milestone}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Investment Recommendation */}
      <div className="print-avoid-break">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="actions" size={18} color="#475569" />
          Investment Recommendation
        </h3>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <PrintIcon name="strengths" size={16} color="white" />
            </div>
            <div className="font-semibold text-emerald-800">✓ Recommended for Investment</div>
          </div>
          <p className="text-sm text-emerald-700 mb-4">
            Financial analysis shows strong market opportunity with {market_opportunity.annual_growth_rate} growth 
            and high viability score of {revenue_model_analysis.viability_score}/10. 
            Break-even expected in {financial_projections.break_even_point}.
          </p>
          <div className="bg-white/70 rounded-lg p-4 border border-emerald-200/50">
            <div className="font-medium text-emerald-800 mb-2">Key Financial Strengths:</div>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li className="flex items-center gap-2">
                <PrintIcon name="strengths" size={12} color="#059669" />
                {revenue_model_analysis.scalability_potential.toLowerCase()} scalability potential
              </li>
              <li className="flex items-center gap-2">
                <PrintIcon name="detailed-scores" size={12} color="#059669" />
                Strong gross margins ({revenue_model_analysis.estimated_margins})
              </li>
              <li className="flex items-center gap-2">
                <PrintIcon name="opportunities" size={12} color="#059669" />
                Growing market with {market_opportunity.annual_growth_rate} annual growth
              </li>
              <li className="flex items-center gap-2">
                <PrintIcon name="financial" size={12} color="#059669" />
                Clear path to profitability in {financial_projections.break_even_point}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Legacy component for backward compatibility
const LegacyPrintFinancialAnalysis: React.FC<{ data: any }> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="print-page-break print-section">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
          <PrintIcon name="financial" size={24} color="white" />
        </div>
        <h2 className="print-title-2 text-slate-800">5.0 Financial Analysis</h2>
      </div>
      
      <div className="print-avoid-break">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
              <PrintIcon name="financial" size={16} color="white" />
            </div>
            <div className="font-semibold text-amber-800">Legacy Financial Data</div>
          </div>
          <p className="text-sm text-amber-700">
            This report uses an older financial data format. For comprehensive analysis including 
            market opportunity, pricing strategy, and detailed projections, please regenerate the report.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintFinancialAnalysis;
