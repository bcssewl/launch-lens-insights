
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, FolderOpen } from 'lucide-react';
import ActivityItem from '@/components/ActivityItem';
import { Card as ShadcnCard, CardContent as ShadcnCardContent, CardHeader as ShadcnCardHeader, CardTitle as ShadcnCardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import DashboardInsights from './DashboardInsights';

interface DashboardContentProps {
  recentActivities: Array<{
    id: string;
    ideaName: string;
    score: number;
    timestamp: string;
    statusText: string;
    statusColor: 'green' | 'yellow' | 'red';
    reportId?: string;
  }>;
  hasValidatedIdeas: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ recentActivities, hasValidatedIdeas }) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* My Business Ideas Section */}
      <ShadcnCard className="lg:col-span-2 apple-card border-0 shadow-lg">
        <ShadcnCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ShadcnCardTitle className="text-xl font-semibold">My Business Ideas</ShadcnCardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/ideas">
                <FolderOpen className="mr-2 h-4 w-4" />
                View All
              </Link>
            </Button>
          </div>
        </ShadcnCardHeader>
        <ShadcnCardContent className="space-y-2">
          {recentActivities.length > 0 ? (
            <>
              {recentActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  ideaName={activity.ideaName}
                  score={activity.score}
                  timestamp={activity.timestamp}
                  statusText={activity.statusText}
                  statusColor={activity.statusColor}
                  reportId={activity.reportId}
                  showDashboardLink={true}
                />
              ))}
              {recentActivities.length >= 5 && (
                <div className="pt-4 border-t border-border">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard/ideas">
                      View All Business Ideas
                    </Link>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm mb-4">No business ideas yet.</p>
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

      <DashboardInsights hasValidatedIdeas={hasValidatedIdeas} />
    </section>
  );
};

export default DashboardContent;
