
import React from 'react';

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
      <h2 className="print-title-2">Financial Analysis</h2>
      
      {/* Key Financial Metrics */}
      <div className="print-avoid-break mb-6">
        <h3 className="print-title-3">Key Financial Metrics</h3>
        <div className="print-grid-2">
          <div className="print-metric-card">
            <div className="print-metric-value text-blue-600">
              {formatCurrency(data.keyMetrics.totalStartupCost)}
            </div>
            <div className="print-metric-label">Total Startup Cost</div>
          </div>
          <div className="print-metric-card">
            <div className="print-metric-value text-red-600">
              {formatCurrency(data.keyMetrics.monthlyBurnRate)}
            </div>
            <div className="print-metric-label">Monthly Burn Rate</div>
          </div>
          <div className="print-metric-card">
            <div className="print-metric-value text-green-600">
              {data.keyMetrics.breakEvenMonth} months
            </div>
            <div className="print-metric-label">Break-even Timeline</div>
          </div>
          <div className="print-metric-card">
            <div className="print-metric-value text-purple-600">
              {formatCurrency(data.keyMetrics.fundingNeeded)}
            </div>
            <div className="print-metric-label">Funding Required</div>
          </div>
        </div>
      </div>

      {/* Financial Viability Assessment */}
      <div className="print-avoid-break mb-6">
        <h3 className="print-title-3">Financial Viability Assessment</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Capital Requirements</span>
            <span className="print-status-medium">Moderate</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Revenue Model Clarity</span>
            <span className="print-status-high">Clear</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Scalability Potential</span>
            <span className="print-status-high">High</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Profit Margin Potential</span>
            <span className="print-status-medium">Good</span>
          </div>
        </div>
      </div>

      {/* Investment Recommendation */}
      <div className="print-avoid-break">
        <h3 className="print-title-3">Investment Recommendation</h3>
        <div className="print-card">
          <div className="space-y-3">
            <div className="font-semibold text-green-600">✓ Recommended for Investment</div>
            <p className="text-sm text-gray-700">
              Financial projections show strong potential for profitability within {data.keyMetrics.breakEvenMonth} months.
              The required investment of {formatCurrency(data.keyMetrics.fundingNeeded)} is reasonable for the projected returns.
            </p>
            <div className="mt-3 p-3 bg-blue-50 rounded">
              <div className="font-medium text-blue-800">Key Financial Strengths:</div>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Clear revenue model with multiple income streams</li>
                <li>• Reasonable break-even timeline</li>
                <li>• Scalable business model</li>
                <li>• Manageable startup costs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintFinancialAnalysis;
