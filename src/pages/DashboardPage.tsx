
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import MetricCard from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { Lightbulb, BarChart3, FileText, Target, PlayCircle, Briefcase, Users, DollarSign, RefreshCw } from 'lucide-react';
import ActivityItem from '@/components/ActivityItem';
import InsightCard from '@/components/InsightCard';
import { Card as ShadcnCard, CardContent as ShadcnCardContent, CardHeader as ShadcnCardHeader, CardTitle as ShadcnCardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';

const quickInsights = [
  { id: 1, text: "Your strongest ideas target B2B markets", icon: Briefcase },
  { id: 2, text: "Consider smaller niches for better validation", icon: Users },
  { id: 3, text: "Your monetization models need refinement", icon: DollarSign },
];

const DashboardPage: React.FC = () => {
  const { stats, recentActivities, loading, refreshData } = useDashboardData();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
          <DashboardHeader />
          <div className="p-6 lg:p-8 space-y-8">
            {/* Quick Action Section */}
            <section className="flex flex-col sm:flex-row items-center gap-4">
              <Button size="lg" className="w-full sm:w-auto apple-button shadow-lg" asChild>
                <Link to="/dashboard/validate">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Validate New Idea
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto apple-button-outline">
                <PlayCircle className="mr-2 h-5 w-5" />
                View Tutorial
              </Button>
            </section>

            {/* Loading skeletons */}
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-3xl" />
              ))}
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="lg:col-span-2 h-80 rounded-3xl" />
              <Skeleton className="h-80 rounded-3xl" />
            </section>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <DashboardHeader />
        <div className="p-6 lg:p-8 space-y-8">
          {/* Quick Action Section */}
          <section className="flex flex-col sm:flex-row items-center gap-4">
            <Button size="lg" className="w-full sm:w-auto apple-button shadow-lg hover:shadow-xl transition-all duration-300" asChild>
              <Link to="/dashboard/validate">
                <Lightbulb className="mr-2 h-5 w-5" />
                Validate New Idea
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto apple-button-outline">
              <PlayCircle className="mr-2 h-5 w-5" />
              View Tutorial
            </Button>
            <Button variant="outline" size="sm" onClick={refreshData} className="apple-button-outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </section>

          {/* Metrics Cards Grid */}
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Ideas Validated"
              value={stats.ideasValidated.toString()}
              subtitle={stats.ideasValidated > 0 ? "Keep the momentum going!" : "Start your validation journey"}
              icon={Lightbulb}
            />
            <MetricCard
              title="Average Score"
              value={stats.averageScore > 0 ? `${stats.averageScore}/10` : "N/A"}
              subtitle={stats.averageScore > 0 ? (stats.averageScore >= 6 ? "↗ Trending upward" : "Room for improvement") : "No completed analyses yet"}
              icon={BarChart3}
              iconColor={stats.averageScore >= 6 ? "text-green-500" : "text-yellow-500"}
            />
            <MetricCard
              title="Business Plans"
              value={stats.businessPlans.toString()}
              subtitle={stats.businessPlans > 0 ? "Plans generated" : "Feature coming soon"}
              icon={FileText}
              iconColor="text-blue-500"
            />
            <MetricCard
              title="Success Rate"
              value={stats.successRate > 0 ? `${stats.successRate}%` : "N/A"}
              subtitle={stats.successRate > 0 ? "vs 42% industry average" : "Complete more validations"}
              icon={Target}
              iconColor="text-yellow-500"
            />
          </section>
          
          {/* Recent Activity Feed & Quick Insights Panel */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity Feed */}
            <ShadcnCard className="lg:col-span-2 apple-card border-0 shadow-lg">
              <ShadcnCardHeader className="pb-4">
                <ShadcnCardTitle className="text-xl font-semibold">Recent Activity</ShadcnCardTitle>
              </ShadcnCardHeader>
              <ShadcnCardContent className="space-y-2">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      ideaName={activity.ideaName}
                      score={activity.score}
                      timestamp={activity.timestamp}
                      statusText={activity.statusText}
                      statusColor={activity.statusColor}
                      reportId={activity.reportId}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Lightbulb className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">No recent activity yet.</p>
                    <Button variant="outline" className="apple-button-outline" asChild>
                      <Link to="/dashboard/validate">
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Validate Your First Idea
                      </Link>
                    </Button>
                  </div>
                )}
              </ShadcnCardContent>
            </ShadcnCard>

            {/* Quick Insights Panel */}
            <div className="space-y-6">
              <ShadcnCard className="apple-card border-0 shadow-lg">
                <ShadcnCardHeader className="pb-4">
                  <ShadcnCardTitle className="text-xl font-semibold">Your Insights</ShadcnCardTitle>
                </ShadcnCardHeader>
                <ShadcnCardContent className="space-y-4">
                  {stats.ideasValidated > 0 ? (
                    quickInsights.map((insight) => (
                      <InsightCard
                        key={insight.id}
                        text={insight.text}
                        icon={insight.icon}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-muted-foreground text-sm">Complete a few validations to see personalized insights.</p>
                    </div>
                  )}
                </ShadcnCardContent>
              </ShadcnCard>

              {/* Quick Access to AI Assistant */}
              <ShadcnCard className="apple-card border-0 shadow-lg">
                <ShadcnCardHeader className="pb-4">
                  <ShadcnCardTitle className="text-lg font-semibold">AI Assistant</ShadcnCardTitle>
                </ShadcnCardHeader>
                <ShadcnCardContent>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Get personalized advice for your startup ideas
                  </p>
                  <Button className="w-full apple-button shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                    <Link to="/dashboard/assistant">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start Chat
                    </Link>
                  </Button>
                </ShadcnCardContent>
              </ShadcnCard>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
