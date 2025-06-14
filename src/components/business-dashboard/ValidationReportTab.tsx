
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Download, Share2, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
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
    <div className="p-6 space-y-6">
      {/* Enhanced Overview Card */}
      <Card className="apple-card shadow-soft hover-lift">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              Validation Report Overview
              <Badge className={`${getScoreBadgeColor(report.overall_score || 0)} px-3 py-1`}>
                {(report.overall_score || 0).toFixed(1)}/10
              </Badge>
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="apple-button-outline hover-lift">
                <Link to={`/results/${report.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Full Report
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="apple-button-outline hover-lift">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" className="apple-button-outline hover-lift">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Key Recommendation
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <p className="text-muted-foreground leading-relaxed">
                    {report.recommendation || 'Analysis completed successfully. Your idea shows potential in the current market landscape.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Analysis Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-muted">
                    <span className="text-sm text-muted-foreground">Analysis Date</span>
                    <span className="text-sm font-medium">
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
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-muted">
                    <span className="text-sm text-muted-foreground">Report Status</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Complete
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Sections Analyzed</span>
                    <span className="text-sm font-medium">5 of 5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {report.report_data && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Analysis Highlights</h3>
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-lg border border-primary/10">
                <p className="text-sm text-muted-foreground mb-3">
                  Your comprehensive validation includes:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Market size and opportunity analysis</li>
                  <li>Competitive landscape evaluation</li>
                  <li>SWOT analysis with actionable insights</li>
                  <li>Financial viability assessment</li>
                  <li>Risk factors and mitigation strategies</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="apple-card shadow-soft hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start apple-button" variant="default">
              <Link to={`/results/${report.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Complete Report
              </Link>
            </Button>
            <Button asChild className="w-full justify-start apple-button-outline" variant="outline">
              <Link to={`/dashboard/validate?duplicateId=${report.id}`}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Refine Analysis
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="apple-card shadow-soft hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start apple-button-outline" variant="outline" disabled>
              <BarChart3 className="mr-2 h-4 w-4" />
              Business Plan (Coming Soon)
            </Button>
            <Button className="w-full justify-start apple-button-outline" variant="outline" disabled>
              <Download className="mr-2 h-4 w-4" />
              Financial Projections (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValidationReportTab;
