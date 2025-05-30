
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import MetricCard from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { Lightbulb, BarChart3, FlaskConical, Target, PlayCircle, Briefcase, Users, DollarSign, RefreshCw } from 'lucide-react';
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
        <DashboardHeader />
        <div className="p-6 space-y-6">
          {/* Quick Action Section */}
          <section className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="w-full sm:w-auto gradient-button" asChild>
              <Link to="/dashboard/validate">
                <Lightbulb className="mr-2 h-5 w-5" />
                Validate New Idea
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <PlayCircle className="mr-2 h-5 w-5" />
              View Tutorial
            </Button>
          </section>

          {/* Loading skeletons */}
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </section>
          
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-64" />
            <Skeleton className="h-64" />
          </section>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader />
      <div className="p-6 space-y-6">
        {/* Quick Action Section */}
        <section className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button size="lg" className="w-full sm:w-auto gradient-button" asChild>
            <Link to="/dashboard/validate">
              <Lightbulb className="mr-2 h-5 w-5" />
              Validate New Idea
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <PlayCircle className="mr-2 h-5 w-5" />
            View Tutorial
          </Button>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </section>

        {/* Metrics Cards Grid */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Ideas Validated"
            value={stats.ideasValidated.toString()}
            subtitle={stats.ideasValidated > 0 ? "Keep going!" : "Start your first validation"}
            icon={Lightbulb}
          />
          <MetricCard
            title="Average Score"
            value={stats.averageScore > 0 ? `${stats.averageScore}/10` : "N/A"}
            subtitle={stats.averageScore > 0 ? (stats.averageScore >= 6 ? "↗ trending up" : "Room for improvement") : "No completed analyses yet"}
            icon={BarChart3}
            iconColor={stats.averageScore >= 6 ? "text-green-500" : "text-yellow-500"}
          />
          <MetricCard
            title="Experiments Running"
            value={stats.experimentsRunning.toString()}
            subtitle={stats.experimentsRunning > 0 ? "In progress..." : "No active experiments"}
            icon={FlaskConical}
            iconColor="text-blue-500"
          />
          <MetricCard
            title="Success Rate"
            value={stats.successRate > 0 ? `${stats.successRate}%` : "N/A"}
            subtitle={stats.successRate > 0 ? "vs 42% industry avg" : "Complete more validations"}
            icon={Target}
            iconColor="text-yellow-500"
          />
        </section>
        
        {/* Recent Activity Feed & Quick Insights Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed (takes 2 columns on large screens) */}
          <ShadcnCard className="lg:col-span-2">
            <ShadcnCardHeader>
              <ShadcnCardTitle className="text-xl">Recent Activity</ShadcnCardTitle>
            </ShadcnCardHeader>
            <ShadcnCardContent className="space-y-1">
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
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No recent activity yet.</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link to="/dashboard/validate">
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Validate Your First Idea
                    </Link>
                  </Button>
                </div>
              )}
            </ShadcnCardContent>
          </ShadcnCard>

          {/* Quick Insights Panel (takes 1 column on large screens) */}
          <div className="space-y-6">
            <ShadcnCard>
              <ShadcnCardHeader>
                <ShadcnCardTitle className="text-xl">Your Insights</ShadcnCardTitle>
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
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">Complete a few validations to see personalized insights.</p>
                  </div>
                )}
              </ShadcnCardContent>
            </ShadcnCard>

            {/* Quick Access to AI Assistant */}
            <ShadcnCard>
              <ShadcnCardHeader>
                <ShadcnCardTitle className="text-lg">AI Assistant</ShadcnCardTitle>
              </ShadcnCardHeader>
              <ShadcnCardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get personalized advice for your startup ideas
                </p>
                <Button className="w-full" asChild>
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
    </DashboardLayout>
  );
};

export default DashboardPage;
