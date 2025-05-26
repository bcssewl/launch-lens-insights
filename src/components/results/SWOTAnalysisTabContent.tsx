
import React from 'react';
import SWOTCard from './SWOTCard';

interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface SWOTAnalysisTabContentProps {
  data: SWOTData;
}

const SWOTAnalysisTabContent: React.FC<SWOTAnalysisTabContentProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SWOTCard title="Strengths" items={data.strengths} className="bg-green-500/10 border-green-500/30" titleClassName="text-green-700 dark:text-green-400" />
      <SWOTCard title="Weaknesses" items={data.weaknesses} className="bg-red-500/10 border-red-500/30" titleClassName="text-red-700 dark:text-red-400" />
      <SWOTCard title="Opportunities" items={data.opportunities} className="bg-blue-500/10 border-blue-500/30" titleClassName="text-blue-700 dark:text-blue-400" />
      <SWOTCard title="Threats" items={data.threats} className="bg-yellow-500/10 border-yellow-500/30" titleClassName="text-yellow-700 dark:text-yellow-400" />
    </div>
  );
};

export default SWOTAnalysisTabContent;
