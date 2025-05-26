import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import MetricCard from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { Lightbulb, BarChart3, FlaskConical, Target, PlayCircle, Briefcase, Users, DollarSign } from 'lucide-react';
import ActivityItem from '@/components/ActivityItem';
import InsightCard from '@/components/InsightCard';
import { Card as ShadcnCard, CardContent as ShadcnCardContent, CardHeader as ShadcnCardHeader, CardTitle as ShadcnCardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const recentActivities = [
  { id: 1, ideaName: "SaaS for Pet Owners", score: 8.2, timestamp: "3 days ago", statusText: "High Potential", statusColor: 'green' as 'green' | 'yellow' | 'red' },
  { id: 2, ideaName: "AI Resume Builder", score: 4.1, timestamp: "1 week ago", statusText: "High Risk", statusColor: 'red' as 'green' | 'yellow' | 'red' },
  { id: 3, ideaName: "Local Food Delivery", score: 6.7, timestamp: "2 weeks ago", statusText: "Proceed with Caution", statusColor: 'yellow' as 'green' | 'yellow' | 'red' },
  { id: 4, ideaName: "Crypto Trading App", score: 3.8, timestamp: "3 weeks ago", statusText: "Not Recommended", statusColor: 'red' as 'green' | 'yellow' | 'red' },
  { id: 5, ideaName: "B2B Analytics Tool", score: 7.9, timestamp: "1 month ago", statusText: "Promising", statusColor: 'green' as 'green' | 'yellow' | 'red' },
];

const quickInsights = [
  { id: 1, text: "Your strongest ideas target B2B markets", icon: Briefcase },
  { id: 2, text: "Consider smaller niches for better validation", icon: Users },
  { id: 3, text: "Your monetization models need refinement", icon: DollarSign },
];

const DashboardPage: React.FC = () => {
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

        {/* Metrics Cards Grid */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Ideas Validated"
            value="7"
            subtitle="+2 this week"
            icon={Lightbulb}
          />
          <MetricCard
            title="Average Score"
            value="6.8/10"
            subtitle="↗ trending up"
            icon={BarChart3}
            iconColor="text-green-500"
          />
          <MetricCard
            title="Experiments Running"
            value="3"
            subtitle="view details →"
            icon={FlaskConical}
            iconColor="text-blue-500"
          />
          <MetricCard
            title="Success Rate"
            value="71%"
            subtitle="vs 42% industry avg"
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
              {recentActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  ideaName={activity.ideaName}
                  score={activity.score}
                  timestamp={activity.timestamp}
                  statusText={activity.statusText}
                  statusColor={activity.statusColor}
                />
              ))}
               {recentActivities.length === 0 && (
                <p className="text-muted-foreground text-sm p-4 text-center">No recent activity yet.</p>
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
                {quickInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    text={insight.text}
                    icon={insight.icon}
                  />
                ))}
                {quickInsights.length === 0 && (
                  <p className="text-muted-foreground text-sm p-4 text-center">No insights available yet.</p>
                )}
              </ShadcnCardContent>
            </ShadcnCard>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
