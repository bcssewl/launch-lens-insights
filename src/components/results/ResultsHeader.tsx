import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, TrendingUp, CheckCircle, Settings } from 'lucide-react';
import ScoreDisplay from './ScoreDisplay';
import ShareReportDialog from './ShareReportDialog';
import ManageSharesDialog from './ManageSharesDialog';

interface ResultsHeaderProps {
  ideaName: string;
  score: number;
  recommendationText: string;
  analysisDate: string;
  reportId?: string;
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  ideaName,
  score,
  recommendationText,
  analysisDate,
  reportId,
}) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [manageSharesOpen, setManageSharesOpen] = useState(false);

  // Parse recommendation to create better content
  const getRecommendationContent = (recommendation: string) => {
    const lowerRec = recommendation.toLowerCase();
    
    if (lowerRec.includes("proceed")) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        status: "🟢 Ready to Proceed",
        content: "Proceed with platform development focusing on AI-driven differentiation and strategic expansion through market validation."
      };
    } else if (lowerRec.includes("high risk")) {
      return {
        icon: <TrendingUp className="h-5 w-5 text-red-500" />,
        status: "🔴 High Risk Detected",
        content: "Consider pivoting strategy or addressing critical market challenges before proceeding with development."
      };
    } else if (lowerRec.includes("mixed signals")) {
      return {
        icon: <TrendingUp className="h-5 w-5 text-yellow-500" />,
        status: "🟡 Mixed Signals",
        content: "Further market research recommended to validate assumptions and reduce uncertainty before major investment."
      };
    }
    
    // Default fallback
    return {
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      status: "📊 Analysis Complete",
      content: recommendation
    };
  };

  const recommendation = getRecommendationContent(recommendationText);

  return (
    <div className="w-full p-4 bg-card rounded-lg shadow space-y-4">
      <div className="w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-primary break-words">{ideaName}</h1>
        <p className="text-sm text-muted-foreground mt-1">Analysis Date: {analysisDate}</p>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-start gap-4">
          <ScoreDisplay score={score} maxScore={10} />
          
          {/* Modern Recommendation Card */}
          <div className="w-full lg:flex-1 bg-gradient-to-br from-card via-card to-muted/20 border border-border/50 rounded-xl p-6 shadow-sm backdrop-blur-sm">
            <div className="space-y-4">
              {/* Header with Icon */}
              <div className="flex items-center gap-3">
                {recommendation.icon}
                <h3 className="text-lg font-semibold text-foreground">Strategic Recommendation</h3>
              </div>
              
              {/* Main Content */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {recommendation.content}
              </p>
              
              {/* Footer with Status and Score */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border/30">
                <span className="text-sm font-medium text-foreground">
                  {recommendation.status}
                </span>
                <span className="text-sm text-muted-foreground">
                  Score: {score.toFixed(1)}/10
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-fit"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Report
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-fit"
            onClick={() => setManageSharesOpen(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Manage Shares
          </Button>
        </div>
      </div>

      {reportId && (
        <>
          <ShareReportDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            reportId={reportId}
            reportTitle={ideaName}
          />
          <ManageSharesDialog
            open={manageSharesOpen}
            onOpenChange={setManageSharesOpen}
            reportId={reportId}
          />
        </>
      )}
    </div>
  );
};

export default ResultsHeader;
