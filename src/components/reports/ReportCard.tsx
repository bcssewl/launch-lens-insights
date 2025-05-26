
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Copy, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Report {
  id: string;
  ideaName: string;
  score: number;
  maxScore: number;
  date: string;
  status: "Validated" | "High Risk" | "Caution" | "Not Recommended" | "Promising" | "Archived";
  preview: string;
}

interface ReportCardProps {
  report: Report;
}

const getScoreColor = (score: number, maxScore: number): string => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 70) return 'bg-green-500';
  if (percentage >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getStatusBadgeVariant = (status: Report['status']): { variant: "default" | "destructive" | "secondary" | "outline", className: string } => {
  switch (status) {
    case "Validated":
    case "Promising":
      return { variant: "default", className: "bg-green-500 hover:bg-green-600 border-green-500 text-primary-foreground" };
    case "Caution":
      return { variant: "secondary", className: "bg-yellow-500 hover:bg-yellow-600 border-yellow-500 text-secondary-foreground" };
    case "High Risk":
    case "Not Recommended":
      return { variant: "destructive", className: "bg-red-500 hover:bg-red-600 border-red-500 text-destructive-foreground" };
    case "Archived":
      return { variant: "outline", className: "bg-gray-500 hover:bg-gray-600 border-gray-500 text-white" };
    default:
      return { variant: "secondary", className: "" };
  }
};

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const scoreColor = getScoreColor(report.score, report.maxScore);
  const statusBadge = getStatusBadgeVariant(report.status);

  return (
    <Card className="group relative flex flex-col overflow-hidden min-h-[260px] h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg mb-1 line-clamp-2">{report.ideaName}</CardTitle>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
          <div className={`h-3 w-3 rounded-full ${scoreColor}`}></div>
          <span>{report.score.toFixed(1)}/{report.maxScore}</span>
          <span>&bull;</span>
          <span>{report.date}</span>
        </div>
        <Badge variant={statusBadge.variant} className={`${statusBadge.className} text-xs`}>{report.status}</Badge>
      </CardHeader>
      <CardContent className="flex-grow pt-0 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{report.preview}</p>
      </CardContent>
      
      <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 space-y-2">
        <Button size="sm" className="w-full" asChild>
          <Link to={`/results?id=${report.id}`}> {/* Assuming /results can take an ID */}
            <FileText className="mr-2 h-4 w-4" />View Report
          </Link>
        </Button>
        <Button size="sm" variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />Download PDF
        </Button>
        <Button size="sm" variant="outline" className="w-full">
          <Copy className="mr-2 h-4 w-4" />Duplicate Analysis
        </Button>
        <Button size="sm" variant="destructive" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />Delete
        </Button>
      </div>
    </Card>
  );
};

export default ReportCard;
