
import React from 'react';
import TamSamSomChart from './charts/TamSamSomChart';
import MarketGrowthChart from './charts/MarketGrowthChart';
import CustomerSegmentsChart from './charts/CustomerSegmentsChart';
import GeographicOpportunityChart from './charts/GeographicOpportunityChart';

interface MarketAnalysisData {
  tamSamSom: { name: string; value: number; fill?: string }[];
  marketGrowth: { year: string; growth: number }[];
  customerSegments: { name: string; value: number; fill?: string }[];
  geographicOpportunity: { name: string; value: number }[];
}

interface MarketAnalysisTabContentProps {
  data: MarketAnalysisData;
}

const MarketAnalysisTabContent: React.FC<MarketAnalysisTabContentProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:gap-3">
      <TamSamSomChart data={data.tamSamSom} />
      <MarketGrowthChart data={data.marketGrowth} />
      <CustomerSegmentsChart data={data.customerSegments} />
      <GeographicOpportunityChart data={data.geographicOpportunity} />
    </div>
  );
};

export default MarketAnalysisTabContent;
