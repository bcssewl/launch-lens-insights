import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X, FileText } from 'lucide-react';
import EnhancedPrintView from './EnhancedPrintView';
import ResultsHeader from './ResultsHeader';
import OverviewTabContent from './OverviewTabContent';
import MarketAnalysisTabContent from './MarketAnalysisTabContent';
import CompetitionTabContent from './CompetitionTabContent';
import FinancialAnalysisTabContent from './FinancialAnalysisTabContent';
import SWOTAnalysisTabContent from './SWOTAnalysisTabContent';
import DetailedScoresTabContent from './DetailedScoresTabContent';
import ActionItemsTabContent from './ActionItemsTabContent';

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
  const [useEnhancedView, setUseEnhancedView] = React.useState(true);

  const handlePrint = () => {
    window.print();
  };

  // Use the enhanced print view by default
  if (useEnhancedView) {
    return <EnhancedPrintView 
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
    />;
  }

  // Keep the original print view as fallback
  return (
    <div className="min-h-screen bg-white">
      {/* Print controls - hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <Button onClick={() => setUseEnhancedView(true)} variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Enhanced Layout
        </Button>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
        <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
          <X className="h-4 w-4" />
          Close
        </Button>
      </div>

      {/* Print content with proper pagination */}
      <div className="max-w-4xl mx-auto p-8 space-y-8 print:space-y-6">
        {/* Header - Keep together */}
        <div className="page-break-inside-avoid">
          <ResultsHeader 
            ideaName={ideaName}
            score={score}
            recommendationText={recommendation}
            analysisDate={analysisDate}
          />
        </div>

        {/* Overview Section */}
        <div className="page-break-before print-section">
          <h2 className="print-title-2">
            Executive Overview
          </h2>
          <div className="page-break-inside-avoid">
            <OverviewTabContent 
              summary={executiveSummary}
              metrics={keyMetrics}
            />
          </div>
        </div>

        {/* Market Analysis Section */}
        <div className="page-break-before print-section">
          <h2 className="print-title-2">
            Market Analysis
          </h2>
          <div className="page-break-inside-avoid">
            <MarketAnalysisTabContent data={marketAnalysis} />
          </div>
        </div>

        {/* Competition Section */}
        <div className="page-break-before print-section">
          <h2 className="print-title-2">
            Competition Analysis
          </h2>
          <div className="page-break-inside-avoid">
            <CompetitionTabContent data={competition} />
          </div>
        </div>

        {/* Financial Analysis Section */}
        <div className="page-break-before print-section">
          <h2 className="print-title-2">
            Financial Analysis
          </h2>
          <div className="page-break-inside-avoid">
            <FinancialAnalysisTabContent data={financialAnalysis} />
          </div>
        </div>

        {/* SWOT Analysis Section */}
        <div className="page-break-before print-section">
          <h2 className="print-title-2">
            SWOT Analysis
          </h2>
          <div className="page-break-inside-avoid">
            <SWOTAnalysisTabContent data={swot} />
          </div>
        </div>

        {/* Detailed Scores Section */}
        <div className="page-break-before print-section">
          <h2 className="print-title-2">
            Detailed Scores
          </h2>
          <div className="page-break-inside-avoid">
            <DetailedScoresTabContent scores={detailedScores} />
          </div>
        </div>

        {/* Action Items Section */}
        <div className="print-section">
          <h2 className="print-title-2">
            Recommended Actions
          </h2>
          <div className="page-break-inside-avoid">
            <ActionItemsTabContent items={actionItems} />
          </div>
        </div>
      </div>

      {/* Enhanced Print styles for A4 optimization with pagination */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm 2.5cm 3cm 2.5cm;
            
            @bottom-center {
              content: "Page " counter(page);
              font-family: 'Inter', sans-serif;
              font-size: 10pt;
              color: #6b7280;
            }
            
            @bottom-left {
              content: "Idea Validation Report";
              font-family: 'Inter', sans-serif;
              font-size: 10pt;
              color: #6b7280;
            }
            
            @bottom-right {
              content: "Generated " attr(data-date);
              font-family: 'Inter', sans-serif;
              font-size: 10pt;
              color: #6b7280;
            }
          }
          
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            font-size: 12pt;
            line-height: 1.4;
          }
          
          /* Page break controls */
          .page-break-before {
            break-before: page;
          }
          
          .page-break-after {
            break-after: page;
          }
          
          .page-break-inside-avoid {
            break-inside: avoid;
          }
          
          .print-section {
            break-inside: avoid;
            orphans: 3;
            widows: 3;
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
          
          /* Ensure content blocks stay together */
          .space-y-4 > div,
          .space-y-6 > div,
          .grid > div,
          [class*="Card"] {
            break-inside: avoid;
          }
          
          /* Keep chart containers together */
          .recharts-wrapper {
            break-inside: avoid;
          }
          
          /* Tables and data structures */
          table,
          .table-container {
            break-inside: avoid;
          }
          
          /* Action items and list items */
          .action-item,
          .list-item {
            break-inside: avoid;
          }
          
          /* Ensure metric cards and similar small components stay together */
          .metric-card,
          .score-item,
          .swot-item {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintView;
