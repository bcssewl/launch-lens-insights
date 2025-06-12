
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import PrintCoverPage from './print/PrintCoverPage';
import PrintTableOfContents from './print/PrintTableOfContents';
import PrintExecutiveSummary from './print/PrintExecutiveSummary';
import PrintKeyInsights from './print/PrintKeyInsights';
import PrintMarketAnalysis from './print/PrintMarketAnalysis';
import PrintCompetitionAnalysis from './print/PrintCompetitionAnalysis';
import PrintFinancialAnalysis from './print/PrintFinancialAnalysis';
import PrintSWOTAnalysis from './print/PrintSWOTAnalysis';
import PrintDetailedScores from './print/PrintDetailedScores';
import PrintActionItems from './print/PrintActionItems';

interface EnhancedPrintViewProps {
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

const EnhancedPrintView: React.FC<EnhancedPrintViewProps> = ({
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
    <>
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

      {/* Print content - remove extra wrapper to prevent empty pages */}
      <PrintCoverPage 
        ideaName={ideaName}
        score={score}
        analysisDate={analysisDate}
      />

      <PrintTableOfContents />

      <PrintExecutiveSummary 
        summary={executiveSummary}
        recommendation={recommendation}
        score={score}
      />

      <PrintKeyInsights metrics={keyMetrics} />

      <PrintMarketAnalysis data={marketAnalysis} />

      <PrintCompetitionAnalysis data={competition} />

      <PrintFinancialAnalysis data={financialAnalysis} />

      <PrintSWOTAnalysis data={swot} />

      <PrintDetailedScores scores={detailedScores} />

      <PrintActionItems items={actionItems} />

      {/* Enhanced Print Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        @media print {
          @page {
            size: A4;
            margin: 1.5cm 2cm 2cm 2cm;
            @bottom-center {
              content: counter(page);
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
          
          * {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1f2937;
            background: white;
            margin: 0;
            padding: 0;
          }
          
          /* Hide non-print elements */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Cover page styling - no page break before, should be page 1 */
          .print-cover-page {
            min-height: 100vh;
            break-after: page;
          }
          
          /* Page breaks */
          .print-page-break {
            break-before: page;
          }
          
          .print-avoid-break {
            break-inside: avoid;
          }
          
          .print-keep-together {
            break-inside: avoid;
            orphans: 3;
            widows: 3;
          }
          
          /* Typography hierarchy */
          .print-title-1 {
            font-size: 24pt;
            font-weight: 700;
            line-height: 1.2;
            color: #111827;
            margin-bottom: 24pt;
          }
          
          .print-title-2 {
            font-size: 18pt;
            font-weight: 600;
            line-height: 1.3;
            color: #1f2937;
            margin-top: 20pt;
            margin-bottom: 12pt;
            border-bottom: 2pt solid #e5e7eb;
            padding-bottom: 6pt;
          }
          
          .print-title-3 {
            font-size: 14pt;
            font-weight: 600;
            line-height: 1.4;
            color: #374151;
            margin-top: 16pt;
            margin-bottom: 8pt;
          }
          
          .print-body {
            font-size: 11pt;
            line-height: 1.6;
            color: #4b5563;
            margin-bottom: 12pt;
          }
          
          .print-caption {
            font-size: 9pt;
            color: #6b7280;
            font-style: italic;
            margin-top: 4pt;
          }
          
          /* Layout components */
          .print-section {
            margin-bottom: 24pt;
            break-inside: avoid;
          }
          
          .print-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16pt;
            break-inside: avoid;
          }
          
          .print-grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12pt;
            break-inside: avoid;
          }
          
          .print-card {
            border: 1pt solid #e5e7eb;
            border-radius: 6pt;
            padding: 12pt;
            background: #fafafa;
            break-inside: avoid;
            margin-bottom: 12pt;
          }
          
          .print-metric-card {
            text-align: center;
            padding: 16pt 12pt;
            border: 1pt solid #d1d5db;
            border-radius: 8pt;
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            break-inside: avoid;
          }
          
          .print-metric-value {
            font-size: 20pt;
            font-weight: 700;
            color: #059669;
            display: block;
            margin-bottom: 4pt;
          }
          
          .print-metric-label {
            font-size: 9pt;
            color: #6b7280;
            font-weight: 500;
          }
          
          /* Charts and visual elements */
          .recharts-wrapper {
            break-inside: avoid;
            margin: 12pt 0;
          }
          
          .print-chart-container {
            background: white;
            border: 1pt solid #e5e7eb;
            border-radius: 6pt;
            padding: 12pt;
            break-inside: avoid;
          }
          
          /* Tables */
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12pt 0;
            break-inside: avoid;
          }
          
          .print-table th {
            background: #f3f4f6;
            font-weight: 600;
            padding: 8pt 12pt;
            border: 1pt solid #d1d5db;
            text-align: left;
          }
          
          .print-table td {
            padding: 8pt 12pt;
            border: 1pt solid #d1d5db;
          }
          
          /* Status indicators */
          .print-status-high {
            background: #dcfce7;
            color: #166534;
            padding: 2pt 6pt;
            border-radius: 4pt;
            font-size: 9pt;
            font-weight: 500;
          }
          
          .print-status-medium {
            background: #fef3c7;
            color: #92400e;
            padding: 2pt 6pt;
            border-radius: 4pt;
            font-size: 9pt;
            font-weight: 500;
          }
          
          .print-status-low {
            background: #fee2e2;
            color: #991b1b;
            padding: 2pt 6pt;
            border-radius: 4pt;
            font-size: 9pt;
            font-weight: 500;
          }
          
          /* Branding elements */
          .print-watermark {
            position: fixed;
            bottom: 20pt;
            right: 20pt;
            opacity: 0.1;
            font-size: 48pt;
            font-weight: 700;
            color: #6b7280;
            transform: rotate(-45deg);
            pointer-events: none;
            z-index: -1;
          }
          
          .print-header {
            border-bottom: 2pt solid #e5e7eb;
            padding-bottom: 12pt;
            margin-bottom: 24pt;
          }
          
          .print-footer {
            border-top: 1pt solid #e5e7eb;
            padding-top: 12pt;
            margin-top: 24pt;
            font-size: 9pt;
            color: #6b7280;
            text-align: center;
          }
        }
      `}</style>
      
      {/* Watermark */}
      <div className="print-watermark">CONFIDENTIAL</div>
    </>
  );
};

export default EnhancedPrintView;
