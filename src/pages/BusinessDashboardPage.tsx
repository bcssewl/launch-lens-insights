
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import BusinessDashboardTabs from '@/components/business-dashboard/BusinessDashboardTabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Calendar, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationReportData {
  id: string;
  validation_id: string;
  status: 'generating' | 'completed' | 'failed' | 'archived';
  overall_score?: number;
  recommendation?: string;
  completed_at?: string;
  created_at: string;
  report_data?: any;
  idea_name?: string;
  one_line_description?: string;
}

const BusinessDashboardPage: React.FC = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const isMobile = useIsMobile();
  const [report, setReport] = useState<ValidationReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ideaId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to find a report where validation_id matches ideaId
        const { data, error: fetchError } = await supabase
          .from('validation_reports')
          .select(`
            *,
            idea_validations!inner(
              id,
              idea_name,
              one_line_description
            )
          `)
          .eq('validation_id', ideaId)
          .eq('status', 'completed')
          .maybeSingle();

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          setError(fetchError.message);
          return;
        }

        if (!data) {
          setError('Business idea report not found');
          return;
        }

        // Transform the data to include idea details at the top level
        const transformedReport: ValidationReportData = {
          ...data,
          status: data.status as 'generating' | 'completed' | 'failed' | 'archived',
          idea_name: data.idea_validations?.idea_name,
          one_line_description: data.idea_validations?.one_line_description,
        };

        setReport(transformedReport);
      } catch (err) {
        console.error('Error fetching business dashboard data:', err);
        setError('Failed to fetch business idea data');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [ideaId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen apple-dashboard-bg overflow-x-hidden">
          {isMobile ? (
            <MobileDashboardHeader title="Business Dashboard" />
          ) : (
            <DashboardHeader>Business Dashboard</DashboardHeader>
          )}
          <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="apple-card p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
            <div className="apple-card p-6">
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="apple-card p-6">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout>
        <div className="min-h-screen apple-dashboard-bg overflow-x-hidden">
          {isMobile ? (
            <MobileDashboardHeader title="Business Dashboard" />
          ) : (
            <DashboardHeader>Business Dashboard</DashboardHeader>
          )}
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="apple-card p-12 text-center">
              <p className="text-red-600 mb-6 text-lg">
                {error || 'Business idea not found'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline" className="apple-button-outline">
                  <Link to="/dashboard/ideas">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Ideas
                  </Link>
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="apple-button-outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
    <DashboardLayout>
      <div className="min-h-screen apple-dashboard-bg overflow-x-hidden">
        {isMobile ? (
          <MobileDashboardHeader title="Business Dashboard" showBackButton />
        ) : (
          <DashboardHeader>Business Dashboard</DashboardHeader>
        )}
        
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
          {/* Back Button for Desktop */}
          {!isMobile && (
            <div className="mb-6">
              <Button asChild variant="ghost" size="sm" className="hover-lift">
                <Link to="/dashboard/ideas">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to My Ideas
                </Link>
              </Button>
            </div>
          )}

          {/* Enhanced Business Idea Header */}
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

          {/* Enhanced Progress Indicator */}
          <div className="apple-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Development Progress</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">1 of 5</span>
                <span className="text-sm text-muted-foreground">sections complete</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-1/5 transition-all duration-500"></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Validation Complete</span>
                <span>20% Complete</span>
              </div>
            </div>
          </div>

          {/* Enhanced Tabbed Dashboard Content */}
          <div className="apple-card shadow-soft">
            <BusinessDashboardTabs report={report} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessDashboardPage;
