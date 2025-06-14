
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star } from 'lucide-react';

interface BusinessDashboardHeaderProps {
  report: {
    idea_name?: string;
    one_line_description?: string;
    overall_score?: number;
    completed_at?: string;
    created_at: string;
  };
}

const BusinessDashboardHeader: React.FC<BusinessDashboardHeaderProps> = ({ report }) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 dark:text-green-400';
    if (score >= 4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 7) return { text: 'Strong Potential', variant: 'default' as const };
    if (score >= 4) return { text: 'Moderate Potential', variant: 'secondary' as const };
    return { text: 'Needs Improvement', variant: 'destructive' as const };
  };

  const scoreBadge = getScoreBadge(report.overall_score || 0);

  return (
    <div className="apple-card p-8 shadow-soft hover-lift">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {report.idea_name || 'Untitled Business Idea'}
            </h1>
            <Badge variant={scoreBadge.variant} className="px-3 py-1">
              {scoreBadge.text}
            </Badge>
          </div>
          
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            {report.one_line_description || 'No description available'}
          </p>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className={`text-3xl font-bold ${getScoreColor(report.overall_score || 0)}`}>
                  {(report.overall_score || 0).toFixed(1)}
                </span>
                <span className="text-lg text-muted-foreground">/10</span>
              </div>
              <span className="text-sm text-muted-foreground">Validation Score</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Last updated {report.completed_at 
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboardHeader;
