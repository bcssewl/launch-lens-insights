
import React from 'react';

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
      <h2 className="print-title-2">Market Analysis</h2>
      
      {/* Market Size Overview */}
      <div className="print-avoid-break mb-6">
        <h3 className="print-title-3">Total Addressable Market (TAM/SAM/SOM)</h3>
        <div className="print-grid-3">
          {data.tamSamSom.map((item, index) => (
            <div key={index} className="print-card text-center">
              <div className="font-bold text-lg text-blue-600">
                ${item.value.toLocaleString()}M
              </div>
              <div className="text-sm text-gray-600 mt-1">{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Growth */}
      <div className="print-avoid-break mb-6">
        <h3 className="print-title-3">Market Growth Trend</h3>
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
      <div className="print-avoid-break">
        <h3 className="print-title-3">Target Customer Segments</h3>
        <div className="space-y-3">
          {data.customerSegments.map((segment, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{segment.name}</span>
              <span className="text-blue-600 font-semibold">{segment.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrintMarketAnalysis;
