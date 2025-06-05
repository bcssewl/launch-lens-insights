
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import ResultsHeader from '@/components/results/ResultsHeader';
import OverviewTabContent from '@/components/results/OverviewTabContent';
import MarketAnalysisTabContent from '@/components/results/MarketAnalysisTabContent';
import CompetitionTabContent from '@/components/results/CompetitionTabContent';
import FinancialAnalysisTabContent from '@/components/results/FinancialAnalysisTabContent';
import SWOTAnalysisTabContent from '@/components/results/SWOTAnalysisTabContent';
import DetailedScoresTabContent from '@/components/results/DetailedScoresTabContent';
import ActionItemsTabContent from '@/components/results/ActionItemsTabContent';

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
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Print controls - hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
        <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
          <X className="h-4 w-4" />
          Close
        </Button>
      </div>

      {/* Print content */}
      <div className="max-w-4xl mx-auto p-8 space-y-12">
        {/* Header */}
        <div className="space-y-6">
          <ResultsHeader 
            ideaName={ideaName}
            score={score}
            recommendationText={recommendation}
            analysisDate={analysisDate}
          />
        </div>

        {/* Overview Section */}
        <div className="space-y-4 print:break-before-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Executive Overview
          </h2>
          <OverviewTabContent 
            summary={executiveSummary}
            metrics={keyMetrics}
          />
        </div>

        {/* Market Analysis Section */}
        <div className="space-y-4 print:break-before-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Market Analysis
          </h2>
          <MarketAnalysisTabContent data={marketAnalysis} />
        </div>

        {/* Competition Section */}
        <div className="space-y-4 print:break-before-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Competition Analysis
          </h2>
          <CompetitionTabContent data={competition} />
        </div>

        {/* Financial Analysis Section */}
        <div className="space-y-4 print:break-before-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Financial Analysis
          </h2>
          <FinancialAnalysisTabContent data={financialAnalysis} />
        </div>

        {/* SWOT Analysis Section */}
        <div className="space-y-4 print:break-before-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            SWOT Analysis
          </h2>
          <SWOTAnalysisTabContent data={swot} />
        </div>

        {/* Detailed Scores Section */}
        <div className="space-y-4 print:break-before-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Detailed Scores
          </h2>
          <DetailedScoresTabContent scores={detailedScores} />
        </div>

        {/* Action Items Section */}
        <div className="space-y-4 print:break-before-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Recommended Actions
          </h2>
          <ActionItemsTabContent items={actionItems} />
        </div>
      </div>

      {/* Print styles */}
      <style jsx>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .print\\:break-before-page {
            break-before: page;
          }
          
          .print\\:break-after-page {
            break-after: page;
          }
          
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintView;
