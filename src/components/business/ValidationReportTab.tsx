
import React, { useState } from 'react';
import ShareReportDialog from '@/components/results/ShareReportDialog';
import ManageSharesDialog from '@/components/results/ManageSharesDialog';
import PrintView from '@/components/results/PrintView';
import ValidationStatusHeader from './validation/ValidationStatusHeader';
import ValidationSummaryCard from './validation/ValidationSummaryCard';
import ReportActionsCard from './validation/ReportActionsCard';
import NextStepsTeaser from './validation/NextStepsTeaser';
import { preparePrintData } from '@/utils/pdfDataProcessor';

interface ValidationReportTabProps {
  report: any;
}

const ValidationReportTab: React.FC<ValidationReportTabProps> = ({ report }) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [manageSharesOpen, setManageSharesOpen] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  
  const score = report.overall_score || 0;
  const recommendation = report.recommendation || 'No recommendation available';
  const ideaName = report.idea_name || 'Untitled Idea';
  const description = report.one_line_description || 'No description available';

  const handleDownloadPDF = () => {
    setShowPrintView(true);
  };

  // If showing print view, use the shared utility for consistent data
  if (showPrintView) {
    const printData = preparePrintData(report);
    
    return (
      <PrintView
        ideaName={printData.ideaName}
        score={printData.score}
        recommendation={printData.recommendation}
        analysisDate={printData.analysisDate}
        executiveSummary={printData.executiveSummary}
        keyMetrics={printData.keyMetrics}
        marketAnalysis={printData.marketAnalysis}
        competition={printData.competition}
        financialAnalysis={printData.financialAnalysis}
        swot={printData.swot}
        detailedScores={printData.detailedScores}
        actionItems={printData.actionItems}
        onClose={() => setShowPrintView(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ValidationStatusHeader />

      <ValidationSummaryCard
        ideaName={ideaName}
        description={description}
        score={score}
        recommendation={recommendation}
      />

      <ReportActionsCard
        reportId={report.id}
        onDownloadPDF={handleDownloadPDF}
        onShare={() => setShareDialogOpen(true)}
        onManageShares={() => setManageSharesOpen(true)}
      />

      <NextStepsTeaser />

      <ShareReportDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        reportId={report.id}
        reportTitle={ideaName}
      />

      <ManageSharesDialog
        open={manageSharesOpen}
        onOpenChange={setManageSharesOpen}
        reportId={report.id}
      />
    </div>
  );
};

export default ValidationReportTab;
