
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

      {/* Force light theme for print content */}
      <div className="light">
        {/* Print content container with explicit light theme styling */}
        <div className="bg-white text-gray-900 min-h-screen">
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
        </div>
      </div>

      {/* Enhanced Print Styles - Force Light Mode */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        /* Force light theme for entire print view */
        .light {
          color-scheme: light !important;
        }
        
        /* Override any dark mode classes that might be inherited */
        .light *,
        .light .dark\\:* {
          color-scheme: light !important;
        }
        
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
          
          /* Force light mode colors for print */
          * {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            box-sizing: border-box;
            background-color: white !important;
            color: #1f2937 !important;
          }
          
          /* Override any dark mode styles for print */
          .dark *,
          [data-theme="dark"] *,
          .dark\\:bg-gray-800,
          .dark\\:text-white,
          .dark\\:border-gray-700 {
            background-color: white !important;
            color: #1f2937 !important;
            border-color: #e5e7eb !important;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1f2937 !important;
            background: white !important;
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
            background: white !important;
            color: #1f2937 !important;
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
          
          /* Typography hierarchy - Force light colors */
          .print-title-1 {
            font-size: 24pt;
            font-weight: 700;
            line-height: 1.2;
            color: #111827 !important;
            margin-bottom: 24pt;
          }
          
          .print-title-2 {
            font-size: 18pt;
            font-weight: 600;
            line-height: 1.3;
            color: #1f2937 !important;
            margin-top: 20pt;
            margin-bottom: 12pt;
            border-bottom: 2pt solid #e5e7eb;
            padding-bottom: 6pt;
          }
          
          .print-title-3 {
            font-size: 14pt;
            font-weight: 600;
            line-height: 1.4;
            color: #374151 !important;
            margin-top: 16pt;
            margin-bottom: 8pt;
          }
          
          .print-body {
            font-size: 11pt;
            line-height: 1.6;
            color: #4b5563 !important;
            margin-bottom: 12pt;
          }
          
          .print-caption {
            font-size: 9pt;
            color: #6b7280 !important;
            font-style: italic;
            margin-top: 4pt;
          }
          
          /* Layout components - Force light backgrounds */
          .print-section {
            margin-bottom: 24pt;
            break-inside: avoid;
            background: white !important;
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
            background: #fafafa !important;
            break-inside: avoid;
            margin-bottom: 12pt;
            color: #1f2937 !important;
          }
          
          .print-metric-card {
            text-align: center;
            padding: 16pt 12pt;
            border: 1pt solid #d1d5db;
            border-radius: 8pt;
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%) !important;
            break-inside: avoid;
            color: #1f2937 !important;
          }
          
          .print-metric-value {
            font-size: 20pt;
            font-weight: 700;
            color: #059669 !important;
            display: block;
            margin-bottom: 4pt;
          }
          
          .print-metric-label {
            font-size: 9pt;
            color: #6b7280 !important;
            font-weight: 500;
          }
          
          /* Charts and visual elements */
          .recharts-wrapper {
            break-inside: avoid;
            margin: 12pt 0;
            background: white !important;
          }
          
          .print-chart-container {
            background: white !important;
            border: 1pt solid #e5e7eb;
            border-radius: 6pt;
            padding: 12pt;
            break-inside: avoid;
          }
          
          /* Tables - Force light styling */
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12pt 0;
            break-inside: avoid;
            background: white !important;
          }
          
          .print-table th {
            background: #f3f4f6 !important;
            font-weight: 600;
            padding: 8pt 12pt;
            border: 1pt solid #d1d5db;
            text-align: left;
            color: #1f2937 !important;
          }
          
          .print-table td {
            padding: 8pt 12pt;
            border: 1pt solid #d1d5db;
            background: white !important;
            color: #1f2937 !important;
          }
          
          /* Status indicators - Force light theme colors */
          .print-status-high {
            background: #dcfce7 !important;
            color: #166534 !important;
            padding: 2pt 6pt;
            border-radius: 4pt;
            font-size: 9pt;
            font-weight: 500;
          }
          
          .print-status-medium {
            background: #fef3c7 !important;
            color: #92400e !important;
            padding: 2pt 6pt;
            border-radius: 4pt;
            font-size: 9pt;
            font-weight: 500;
          }
          
          .print-status-low {
            background: #fee2e2 !important;
            color: #991b1b !important;
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
            color: #6b7280 !important;
            transform: rotate(-45deg);
            pointer-events: none;
            z-index: -1;
          }
          
          .print-header {
            border-bottom: 2pt solid #e5e7eb;
            padding-bottom: 12pt;
            margin-bottom: 24pt;
            background: white !important;
            color: #1f2937 !important;
          }
          
          .print-footer {
            border-top: 1pt solid #e5e7eb;
            padding-top: 12pt;
            margin-top: 24pt;
            font-size: 9pt;
            color: #6b7280 !important;
            text-align: center;
            background: white !important;
          }
        }
      `}</style>
      
      {/* Watermark */}
      <div className="print-watermark">CONFIDENTIAL</div>
    </div>
  );
};

export default EnhancedPrintView;
