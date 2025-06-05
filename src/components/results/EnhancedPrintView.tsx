
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
        <Button onClick={handlePrint} className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800">
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

      {/* Enhanced Print Styles with Modern Typography and Consistent Design */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        @media print {
          @page {
            size: A4;
            margin: 1.5cm 2cm 2cm 2cm;
            @bottom-center {
              content: "Page " counter(page);
              font-family: 'Inter', sans-serif;
              font-size: 10pt;
              color: #64748b;
              font-weight: 500;
            }
            @bottom-left {
              content: "Validator • Idea Validation Report";
              font-family: 'Inter', sans-serif;
              font-size: 9pt;
              color: #64748b;
              font-weight: 400;
            }
            @bottom-right {
              content: "Confidential";
              font-family: 'Inter', sans-serif;
              font-size: 9pt;
              color: #dc2626;
              font-weight: 600;
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
            line-height: 1.6;
            color: #1f2937;
            background: white;
            margin: 0;
            padding: 0;
            font-weight: 400;
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
          
          /* Enhanced Typography hierarchy with consistent colors */
          .print-title-1 {
            font-size: 28pt;
            font-weight: 900;
            line-height: 1.1;
            color: #111827;
            margin-bottom: 24pt;
            letter-spacing: -0.02em;
          }
          
          .print-title-2 {
            font-size: 20pt;
            font-weight: 700;
            line-height: 1.2;
            color: #334155;
            margin-top: 24pt;
            margin-bottom: 16pt;
            border-bottom: 3pt solid #e2e8f0;
            padding-bottom: 8pt;
            letter-spacing: -0.01em;
          }
          
          .print-title-3 {
            font-size: 16pt;
            font-weight: 600;
            line-height: 1.3;
            color: #475569;
            margin-top: 20pt;
            margin-bottom: 12pt;
            letter-spacing: -0.005em;
          }
          
          .print-body {
            font-size: 11pt;
            line-height: 1.7;
            color: #4b5563;
            margin-bottom: 14pt;
            font-weight: 400;
          }
          
          .print-caption {
            font-size: 9pt;
            color: #6b7280;
            font-style: italic;
            margin-top: 6pt;
            font-weight: 400;
          }
          
          /* Enhanced Layout components */
          .print-section {
            margin-bottom: 32pt;
            break-inside: avoid;
          }
          
          .print-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20pt;
            break-inside: avoid;
          }
          
          .print-grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16pt;
            break-inside: avoid;
          }
          
          .print-card {
            border: 1pt solid #e2e8f0;
            border-radius: 8pt;
            padding: 16pt;
            background: #f8fafc;
            break-inside: avoid;
            margin-bottom: 16pt;
            box-shadow: 0 1pt 3pt rgba(0, 0, 0, 0.1);
          }
          
          .print-metric-card {
            text-align: center;
            padding: 20pt 16pt;
            border: 1pt solid #d1d5db;
            border-radius: 12pt;
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            break-inside: avoid;
            box-shadow: 0 2pt 4pt rgba(0, 0, 0, 0.05);
          }
          
          .print-metric-value {
            font-size: 24pt;
            font-weight: 800;
            color: #475569;
            display: block;
            margin-bottom: 6pt;
            letter-spacing: -0.02em;
          }
          
          .print-metric-label {
            font-size: 9pt;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          /* Enhanced Visual elements */
          .recharts-wrapper {
            break-inside: avoid;
            margin: 16pt 0;
          }
          
          .print-chart-container {
            background: white;
            border: 1pt solid #e2e8f0;
            border-radius: 8pt;
            padding: 16pt;
            break-inside: avoid;
            box-shadow: 0 1pt 3pt rgba(0, 0, 0, 0.05);
          }
          
          /* Enhanced Tables */
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin: 16pt 0;
            break-inside: avoid;
            font-size: 10pt;
          }
          
          .print-table th {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            font-weight: 600;
            padding: 12pt 16pt;
            border: 1pt solid #cbd5e1;
            text-align: left;
            color: #334155;
          }
          
          .print-table td {
            padding: 10pt 16pt;
            border: 1pt solid #cbd5e1;
            background: white;
          }
          
          /* Enhanced Status indicators with consistent colors */
          .print-status-high {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            color: #166534;
            padding: 4pt 8pt;
            border-radius: 6pt;
            font-size: 9pt;
            font-weight: 600;
            border: 1pt solid #22c55e;
          }
          
          .print-status-medium {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            color: #92400e;
            padding: 4pt 8pt;
            border-radius: 6pt;
            font-size: 9pt;
            font-weight: 600;
            border: 1pt solid #f59e0b;
          }
          
          .print-status-low {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            color: #991b1b;
            padding: 4pt 8pt;
            border-radius: 6pt;
            font-size: 9pt;
            font-weight: 600;
            border: 1pt solid #ef4444;
          }
          
          /* Enhanced Branding elements */
          .print-watermark {
            position: fixed;
            bottom: 30pt;
            right: 30pt;
            opacity: 0.05;
            font-size: 64pt;
            font-weight: 900;
            color: #64748b;
            transform: rotate(-45deg);
            pointer-events: none;
            z-index: -1;
            font-family: 'Inter', sans-serif;
          }
          
          .print-header {
            border-bottom: 2pt solid #e2e8f0;
            padding-bottom: 16pt;
            margin-bottom: 32pt;
          }
          
          .print-footer {
            border-top: 1pt solid #e2e8f0;
            padding-top: 16pt;
            margin-top: 32pt;
            font-size: 9pt;
            color: #64748b;
            text-align: center;
          }
          
          /* Glassmorphism effects (simplified for print) */
          .backdrop-blur-sm,
          .backdrop-blur-xl {
            background: rgba(255, 255, 255, 0.9);
          }
          
          /* Gradient text fallback */
          .bg-clip-text {
            background: linear-gradient(135deg, #334155 0%, #475569 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          
          /* Enhanced spacing and readability */
          h1, h2, h3, h4, h5, h6 {
            break-after: avoid;
            orphans: 4;
            widows: 4;
          }
          
          p, li {
            orphans: 3;
            widows: 3;
          }
          
          /* List styling */
          ul, ol {
            margin: 12pt 0;
            padding-left: 20pt;
          }
          
          li {
            margin-bottom: 6pt;
            line-height: 1.6;
          }
          
          /* Link styling for digital viewing */
          a {
            color: #475569;
            text-decoration: none;
            font-weight: 500;
          }
          
          /* Code and monospace */
          code, .font-mono {
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 9pt;
            background: #f1f5f9;
            padding: 2pt 4pt;
            border-radius: 3pt;
          }
        }
      `}</style>
      
      {/* Enhanced Watermark */}
      <div className="print-watermark">VALIDATOR</div>
    </>
  );
};

export default EnhancedPrintView;
