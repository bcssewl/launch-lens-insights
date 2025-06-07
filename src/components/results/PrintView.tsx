
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import EnhancedPrintView from './EnhancedPrintView';

interface PrintViewProps {
  ideaName: string;
  score: number;
  recommendation: string;
  analysisDate: string;
  executiveSummary: string;
  keyMetrics: any;
  marketAnalysis: any;
  competition: any;
  financialAnalysis: any;
  swot: any;
  detailedScores: any[];
  actionItems: any[];
  onClose: () => void;
}

const PrintView: React.FC<PrintViewProps> = ({
  ideaName,
  score,
  recommendation,
  analysisDate,
  executiveSummary,
  keyMetrics,
  marketAnalysis,
  competition,
  financialAnalysis,
  swot,
  detailedScores,
  actionItems,
  onClose
}) => {
  // Always use the enhanced print view for consistent comprehensive reports
  return (
    <EnhancedPrintView 
      ideaName={ideaName}
      score={score}
      recommendation={recommendation}
      analysisDate={analysisDate}
      executiveSummary={executiveSummary}
      keyMetrics={keyMetrics}
      marketAnalysis={marketAnalysis}
      competition={competition}
      financialAnalysis={financialAnalysis}
      swot={swot}
      detailedScores={detailedScores}
      actionItems={actionItems}
      onClose={onClose}
    />
  );
};

export default PrintView;
