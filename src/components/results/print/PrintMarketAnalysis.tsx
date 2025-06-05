
import React from 'react';
import PrintIcon from './PrintIcon';

interface PrintMarketAnalysisProps {
  data: {
    tamSamSom: { name: string; value: number }[];
    marketGrowth: { year: string; growth: number }[];
    customerSegments: { name: string; value: number }[];
    geographicOpportunity: { name: string; value: number }[];
  };
}

const PrintMarketAnalysis: React.FC<PrintMarketAnalysisProps> = ({ data }) => {
  return (
    <div className="print-page-break print-section">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
          <PrintIcon name="market-analysis" size={24} color="white" />
        </div>
        <h2 className="print-title-2 text-slate-800">3.0 Market Analysis</h2>
      </div>
      
      {/* Market Size Overview */}
      <div className="print-avoid-break mb-8">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="key-insights" size={18} color="#475569" />
          Total Addressable Market (TAM/SAM/SOM)
        </h3>
        <div className="print-grid-3">
          {data.tamSamSom.map((item, index) => (
            <div key={index} className="print-card text-center">
              <div className="font-bold text-lg text-slate-600">
                ${item.value.toLocaleString()}M
              </div>
              <div className="text-sm text-gray-600 mt-1">{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Growth */}
      <div className="print-avoid-break mb-8">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="detailed-scores" size={18} color="#475569" />
          Market Growth Trend
        </h3>
        <div className="print-chart-container">
          <table className="print-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Growth Rate</th>
                <th>Market Outlook</th>
              </tr>
            </thead>
            <tbody>
              {data.marketGrowth.map((item, index) => (
                <tr key={index}>
                  <td>{item.year}</td>
                  <td>{item.growth}%</td>
                  <td>
                    <span className={item.growth > 15 ? 'print-status-high' : item.growth > 8 ? 'print-status-medium' : 'print-status-low'}>
                      {item.growth > 15 ? 'Rapid Growth' : item.growth > 8 ? 'Steady Growth' : 'Slow Growth'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="print-avoid-break mb-8">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="market-analysis" size={18} color="#475569" />
          Target Customer Segments
        </h3>
        <div className="space-y-3">
          {data.customerSegments.map((segment, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
              <span className="font-medium text-gray-800">{segment.name}</span>
              <span className="text-slate-600 font-semibold">{segment.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Market Saturation Level - Reformatted */}
      <div className="print-avoid-break">
        <h3 className="print-title-3 flex items-center gap-2 mb-4">
          <PrintIcon name="saturation" size={18} color="#475569" />
          Market Saturation Assessment
        </h3>
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <PrintIcon name="saturation" size={18} color="#64748b" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Market Saturation Level</div>
                <div className="text-sm text-gray-600">Current competitive density</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-700">Moderate</div>
              <div className="text-xs text-gray-500">65% saturated</div>
            </div>
          </div>
          
          {/* Saturation Indicator Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="w-3/5 bg-gradient-to-r from-emerald-400 to-amber-500 h-3 rounded-full"></div>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mt-4">
            The market shows moderate saturation with opportunities for differentiation through unique value propositions and niche targeting.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintMarketAnalysis;
