
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share, Eye, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReportActionsCardProps {
  reportId: string;
  onDownloadPDF: () => void;
  onShare: () => void;
  onManageShares: () => void;
}

const ReportActionsCard: React.FC<ReportActionsCardProps> = ({
  reportId,
  onDownloadPDF,
  onShare,
  onManageShares
}) => {
  return (
    <Card className="enhanced-card">
      <CardHeader>
        <CardTitle>Report Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to={`/results/${reportId}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Full Report
            </Link>
          </Button>
          <Button variant="outline" onClick={onDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Print / Save as PDF
          </Button>
          <Button variant="outline" onClick={onShare}>
            <Share className="mr-2 h-4 w-4" />
            Share Report
          </Button>
          <Button variant="outline" onClick={onManageShares}>
            <Settings className="mr-2 h-4 w-4" />
            Manage Shares
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportActionsCard;
