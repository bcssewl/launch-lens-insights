
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Download, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ValidationReportTabProps {
  report: any;
}

const ValidationReportTab: React.FC<ValidationReportTabProps> = ({ report }) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 dark:text-green-400';
    if (score >= 4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 7) return 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-700';
    if (score >= 4) return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
    return 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 border-red-300 dark:border-red-700';
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Validation Report Overview
              <Badge className={`${getScoreBadgeColor(report.overall_score || 0)}`}>
                {(report.overall_score || 0).toFixed(1)}/10
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/results/${report.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Full Report
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Recommendation</h3>
            <p className="text-muted-foreground">
              {report.recommendation || 'Analysis completed successfully.'}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-2">Analysis Date</h3>
            <p className="text-muted-foreground">
              {report.completed_at 
                ? new Date(report.completed_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : new Date(report.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
              }
            </p>
          </div>

          {report.report_data && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Key Insights</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  View the complete analysis including market analysis, competition research, 
                  SWOT analysis, and detailed scoring in the full report.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full justify-start" variant="outline">
            <Link to={`/results/${report.id}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Detailed Analysis
            </Link>
          </Button>
          <Button asChild className="w-full justify-start" variant="outline">
            <Link to={`/dashboard/validate?duplicateId=${report.id}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Duplicate & Refine Analysis
            </Link>
          </Button>
          <Button className="w-full justify-start" variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Generate Business Plan (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidationReportTab;
