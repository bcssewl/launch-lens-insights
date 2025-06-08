
import React from 'react';
import PrintIcon from './PrintIcon';

interface PrintFinancialAnalysisProps {
  data: {
    keyMetrics: {
      totalStartupCost: number;
      monthlyBurnRate: number;
      breakEvenMonth: number;
      fundingNeeded: number;
    };
    startupCosts: any[];
    revenueProjections: any[];
  };
}

const PrintFinancialAnalysis: React.FC<PrintFinancialAnalysisProps> = ({ data }) => {
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
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
          <PrintIcon name="financial" size={24} color="white" />
        </div>
        <h2 className="print-title-2 text-slate-800">5.0 Financial Analysis</h2>
      </div>
      
      {/* Key Financial Metrics */}
      <div className="print-avoid-break mb-8">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="key-insights" size={18} color="#475569" />
          Key Financial Metrics
        </h3>
        <div className="print-grid-2">
          <div className="print-metric-card bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <div className="print-metric-value text-slate-600">
              {formatCurrency(data.keyMetrics.totalStartupCost)}
            </div>
            <div className="print-metric-label">Total Startup Cost</div>
          </div>
          <div className="print-metric-card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="print-metric-value text-red-600">
              {formatCurrency(data.keyMetrics.monthlyBurnRate)}
            </div>
            <div className="print-metric-label">Monthly Burn Rate</div>
          </div>
          <div className="print-metric-card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <div className="print-metric-value text-emerald-600">
              {data.keyMetrics.breakEvenMonth} months
            </div>
            <div className="print-metric-label">Break-even Timeline</div>
          </div>
          <div className="print-metric-card bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
            <div className="print-metric-value text-violet-600">
              {formatCurrency(data.keyMetrics.fundingNeeded)}
            </div>
            <div className="print-metric-label">Funding Required</div>
          </div>
        </div>
      </div>

      {/* Financial Viability Assessment */}
      <div className="print-avoid-break mb-8">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="detailed-scores" size={18} color="#475569" />
          Financial Viability Assessment
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <PrintIcon name="financial" size={16} color="#d97706" />
              <span className="font-medium text-gray-800">Capital Requirements</span>
            </div>
            <span className="print-status-medium">Moderate</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <PrintIcon name="strengths" size={16} color="#059669" />
              <span className="font-medium text-gray-800">Revenue Model Clarity</span>
            </div>
            <span className="print-status-high">Clear</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <PrintIcon name="opportunities" size={16} color="#059669" />
              <span className="font-medium text-gray-800">Scalability Potential</span>
            </div>
            <span className="print-status-high">High</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <PrintIcon name="detailed-scores" size={16} color="#d97706" />
              <span className="font-medium text-gray-800">Profit Margin Potential</span>
            </div>
            <span className="print-status-medium">Good</span>
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
            Financial projections show strong potential for profitability within {data.keyMetrics.breakEvenMonth} months.
            The required investment of {formatCurrency(data.keyMetrics.fundingNeeded)} is reasonable for the projected returns.
          </p>
          <div className="bg-white/70 rounded-lg p-4 border border-emerald-200/50">
            <div className="font-medium text-emerald-800 mb-2">Key Financial Strengths:</div>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li className="flex items-center gap-2">
                <PrintIcon name="strengths" size={12} color="#059669" />
                Clear revenue model with multiple income streams
              </li>
              <li className="flex items-center gap-2">
                <PrintIcon name="detailed-scores" size={12} color="#059669" />
                Reasonable break-even timeline
              </li>
              <li className="flex items-center gap-2">
                <PrintIcon name="opportunities" size={12} color="#059669" />
                Scalable business model
              </li>
              <li className="flex items-center gap-2">
                <PrintIcon name="financial" size={12} color="#059669" />
                Manageable startup costs
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintFinancialAnalysis;
