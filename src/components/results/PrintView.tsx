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
      <div className="max-w-4xl mx-auto p-8 space-y-8 print:space-y-6">
        {/* Header - Keep together */}
        <div className="space-y-6 print:break-inside-avoid">
          <ResultsHeader 
            ideaName={ideaName}
            score={score}
            recommendationText={recommendation}
            analysisDate={analysisDate}
          />
        </div>

        {/* Overview Section */}
        <div className="space-y-4 print:break-before-page print:break-inside-avoid-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:break-after-avoid">
            Executive Overview
          </h2>
          <div className="print:break-inside-avoid">
            <OverviewTabContent 
              summary={executiveSummary}
              metrics={keyMetrics}
            />
          </div>
        </div>

        {/* Market Analysis Section */}
        <div className="space-y-4 print:break-before-page print:break-inside-avoid-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:break-after-avoid">
            Market Analysis
          </h2>
          <div className="print:break-inside-avoid">
            <MarketAnalysisTabContent data={marketAnalysis} />
          </div>
        </div>

        {/* Competition Section */}
        <div className="space-y-4 print:break-before-page print:break-inside-avoid-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:break-after-avoid">
            Competition Analysis
          </h2>
          <div className="print:break-inside-avoid">
            <CompetitionTabContent data={competition} />
          </div>
        </div>

        {/* Financial Analysis Section */}
        <div className="space-y-4 print:break-before-page print:break-inside-avoid-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:break-after-avoid">
            Financial Analysis
          </h2>
          <div className="print:break-inside-avoid">
            <FinancialAnalysisTabContent data={financialAnalysis} />
          </div>
        </div>

        {/* SWOT Analysis Section */}
        <div className="space-y-4 print:break-before-page print:break-inside-avoid-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:break-after-avoid">
            SWOT Analysis
          </h2>
          <div className="print:break-inside-avoid">
            <SWOTAnalysisTabContent data={swot} />
          </div>
        </div>

        {/* Detailed Scores Section */}
        <div className="space-y-4 print:break-before-page print:break-inside-avoid-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:break-after-avoid">
            Detailed Scores
          </h2>
          <div className="print:break-inside-avoid">
            <DetailedScoresTabContent scores={detailedScores} />
          </div>
        </div>

        {/* Action Items Section */}
        <div className="space-y-4 print:break-before-page print:break-inside-avoid-page">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:break-after-avoid">
            Recommended Actions
          </h2>
          <div className="print:break-inside-avoid">
            <ActionItemsTabContent items={actionItems} />
          </div>
        </div>
      </div>

      {/* Enhanced Print styles for A4 optimization */}
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm 2cm;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            font-size: 12pt;
            line-height: 1.4;
          }
          
          /* Page break controls */
          .print\\:break-before-page {
            break-before: page;
          }
          
          .print\\:break-after-page {
            break-after: page;
          }
          
          .print\\:break-after-avoid {
            break-after: avoid;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          
          .print\\:break-inside-avoid-page {
            break-inside: avoid-page;
          }
          
          /* Widow and orphan control */
          * {
            orphans: 3;
            widows: 3;
          }
          
          h1, h2, h3, h4, h5, h6 {
            break-after: avoid;
            orphans: 4;
            widows: 4;
          }
          
          p {
            orphans: 3;
            widows: 3;
          }
          
          /* Hide elements not needed for print */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Optimize spacing for print */
          .print\\:space-y-6 > * + * {
            margin-top: 1.5rem;
          }
          
          /* Ensure tables don't break poorly */
          table {
            break-inside: avoid;
          }
          
          /* Keep chart containers together */
          .recharts-wrapper {
            break-inside: avoid;
          }
          
          /* Optimize card layouts for print */
          .grid {
            break-inside: avoid;
          }
          
          /* Ensure action items stay together */
          .space-y-4 > div {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintView;
