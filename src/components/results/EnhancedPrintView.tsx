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

      {/* Professional Report Container with Pagination */}
      <div 
        className="professional-report-container light"
        data-report-title={ideaName}
        data-generated-date={new Date().toLocaleDateString()}
        data-confidentiality="CONFIDENTIAL"
      >
        {/* Cover Page - Page 1 */}
        <div className="professional-cover-page">
          <PrintCoverPage 
            ideaName={ideaName}
            score={score}
            analysisDate={analysisDate}
          />
        </div>

        {/* Table of Contents - Page 2 */}
        <div className="page-break-before enhanced-toc-page">
          <PrintTableOfContents />
        </div>

        {/* Executive Summary - Page 3 */}
        <div className="page-break-before print-section">
          <PrintExecutiveSummary 
            summary={executiveSummary}
            recommendation={recommendation}
            score={score}
          />
        </div>

        {/* Key Insights - New Page if needed */}
        <div className="print-section">
          <PrintKeyInsights metrics={keyMetrics} />
        </div>

        {/* Market Analysis - New Page */}
        <div className="page-break-before print-section">
          <PrintMarketAnalysis data={marketAnalysis} />
        </div>

        {/* Competition Analysis - New Page */}
        <div className="page-break-before print-section">
          <PrintCompetitionAnalysis data={competition} />
        </div>

        {/* Financial Analysis - New Page */}
        <div className="page-break-before print-section">
          <PrintFinancialAnalysis data={financialAnalysis} />
        </div>

        {/* SWOT Analysis - New Page if space allows */}
        <div className="print-section">
          <PrintSWOTAnalysis data={swot} />
        </div>

        {/* Detailed Scores - New Page */}        
        <div className="page-break-before print-section">
          <PrintDetailedScores scores={detailedScores} />
        </div>

        {/* Action Items - Final section */}
        <div className="print-section">
          <PrintActionItems items={actionItems} />
        </div>
      </div>

      {/* Enhanced Print Styles with Pagination Support */}
      <style>{`
        @media print {
          /* Override any conflicting styles */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Ensure proper page setup */
          @page {
            size: A4;
            margin: 2cm 2.5cm 3cm 2.5cm;
            
            @top-left {
              content: "Idea Validation Report";
              font-family: 'Inter', sans-serif;
              font-size: 10pt;
              color: #6b7280;
            }
            
            @top-right {
              content: attr(data-report-title);
              font-family: 'Inter', sans-serif;
              font-size: 10pt;
              color: #6b7280;
              text-align: right;
            }
            
            @bottom-center {
              content: "Page " counter(page);
              font-family: 'Inter', sans-serif;
              font-size: 10pt;
              color: #6b7280;
            }
            
            @bottom-left {
              content: "Generated " attr(data-generated-date);
              font-family: 'Inter', sans-serif;
              font-size: 9pt;
              color: #9ca3af;
            }
            
            @bottom-right {
              content: attr(data-confidentiality);
              font-family: 'Inter', sans-serif;
              font-size: 9pt;
              color: #dc2626;
              font-weight: 600;
            }
          }
          
          /* Cover page without headers/footers */
          @page :first {
            @top-left { content: none; }
            @top-right { content: none; }
            @bottom-center { content: none; }
            @bottom-left { content: none; }
            @bottom-right { content: none; }
          }
          
          /* Force light theme colors for print */
          * {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            background-color: white !important;
            color: #1f2937 !important;
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
            margin-bottom: 24pt;
          }
          
          /* Typography with proper breaks */
          h1, h2, h3, h4, h5, h6 {
            break-after: avoid;
            orphans: 4;
            widows: 4;
          }
          
          p {
            orphans: 2;
            widows: 2;
          }
          
          /* Tables and charts */
          .recharts-wrapper,
          .print-chart-container {
            break-inside: avoid;
            margin: 12pt 0;
            background: white !important;
          }
          
          .print-table {
            break-inside: auto;
          }
          
          .print-table thead {
            break-inside: avoid;
            break-after: auto;
          }
          
          .print-table tbody tr {
            break-inside: avoid;
          }
          
          /* Cards and containers */
          .print-card,
          .print-metric-card {
            break-inside: avoid;
            background: #f8fafc !important;
            border: 1pt solid #e2e8f0 !important;
          }
          
          /* Grid layouts */
          .print-grid-2,
          .print-grid-3 {
            break-inside: avoid;
          }
          
          /* Status indicators */
          .print-status-high {
            background: #dcfce7 !important;
            color: #166534 !important;
          }
          
          .print-status-medium {
            background: #fef3c7 !important;
            color: #92400e !important;
          }
          
          .print-status-low {
            background: #fee2e2 !important;
            color: #991b1b !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedPrintView;
