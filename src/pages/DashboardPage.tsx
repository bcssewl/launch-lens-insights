
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
        <div className="min-h-screen relative overflow-hidden">
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="relative z-10">
            <DashboardHeader />
            <div className="p-8 space-y-8">
              {/* Quick Action Section */}
              <section className="flex flex-col sm:flex-row items-center gap-4">
                <Button size="lg" className="w-full sm:w-auto gradient-button shadow-soft" asChild>
                  <Link to="/dashboard/validate">
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Validate New Idea
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto hover-lift glassmorphism-card border-white/10">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  View Tutorial
                </Button>
              </section>

              {/* Loading skeletons */}
              <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="glassmorphism-card p-6 rounded-2xl">
                    <Skeleton className="h-32 w-full bg-white/10" />
                  </div>
                ))}
              </section>
              
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glassmorphism-card p-6 rounded-2xl">
                  <Skeleton className="h-72 w-full bg-white/10" />
                </div>
                <div className="glassmorphism-card p-6 rounded-2xl">
                  <Skeleton className="h-72 w-full bg-white/10" />
                </div>
              </section>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full filter blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="relative z-10">
          <DashboardHeader />
          <div className="p-8 space-y-8">
            {/* Quick Action Section */}
            <section className="flex flex-col sm:flex-row items-center gap-4">
              <Button size="lg" className="w-full sm:w-auto gradient-button shadow-soft hover-lift backdrop-blur-sm" asChild>
                <Link to="/dashboard/validate">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Validate New Idea
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto hover-lift glassmorphism-card border-white/10 text-white hover:bg-white/5">
                <PlayCircle className="mr-2 h-5 w-5" />
                View Tutorial
              </Button>
              <Button variant="outline" size="sm" onClick={refreshData} className="hover-lift glassmorphism-card border-white/10 text-white hover:bg-white/5">
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
                iconColor={stats.averageScore >= 6 ? "text-green-400" : "text-yellow-400"}
              />
              <MetricCard
                title="Business Plans"
                value={stats.businessPlans.toString()}
                subtitle={stats.businessPlans > 0 ? "Plans generated" : "Feature coming soon"}
                icon={FileText}
                iconColor="text-blue-400"
              />
              <MetricCard
                title="Success Rate"
                value={stats.successRate > 0 ? `${stats.successRate}%` : "N/A"}
                subtitle={stats.successRate > 0 ? "vs 42% industry average" : "Complete more validations"}
                icon={Target}
                iconColor="text-yellow-400"
              />
            </section>
            
            {/* Recent Activity Feed & Quick Insights Panel */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity Feed */}
              <ShadcnCard className="lg:col-span-2 glassmorphism-card border-white/10">
                <ShadcnCardHeader className="pb-4">
                  <ShadcnCardTitle className="text-xl font-semibold text-white">Recent Activity</ShadcnCardTitle>
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
                      <div className="w-16 h-16 mx-auto mb-4 glassmorphism-card rounded-full flex items-center justify-center">
                        <Lightbulb className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-white/70 text-sm mb-4">No recent activity yet.</p>
                      <Button variant="outline" className="hover-lift glassmorphism-card border-white/10 text-white hover:bg-white/5" asChild>
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
                <ShadcnCard className="glassmorphism-card border-white/10">
                  <ShadcnCardHeader className="pb-4">
                    <ShadcnCardTitle className="text-xl font-semibold text-white">Your Insights</ShadcnCardTitle>
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
                        <div className="w-12 h-12 mx-auto mb-3 glassmorphism-card rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-white/70 text-sm">Complete a few validations to see personalized insights.</p>
                      </div>
                    )}
                  </ShadcnCardContent>
                </ShadcnCard>

                {/* Quick Access to AI Assistant */}
                <ShadcnCard className="glassmorphism-card border-white/10">
                  <ShadcnCardHeader className="pb-4">
                    <ShadcnCardTitle className="text-lg font-semibold text-white">AI Assistant</ShadcnCardTitle>
                  </ShadcnCardHeader>
                  <ShadcnCardContent>
                    <p className="text-sm text-white/70 mb-4 leading-relaxed">
                      Get personalized advice for your startup ideas
                    </p>
                    <Button className="w-full gradient-button shadow-soft hover-lift backdrop-blur-sm" asChild>
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
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
