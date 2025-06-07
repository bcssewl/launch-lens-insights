
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Target, Lightbulb } from 'lucide-react';

const PortfolioAnalyticsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <DashboardHeader>Portfolio Analytics</DashboardHeader>
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
              <p className="text-sm text-green-600">+2 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg. Success Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">7.8</div>
              <p className="text-sm text-green-600">+0.3 from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Launched
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">3</div>
              <p className="text-sm text-muted-foreground">25% success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                In Development
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">5</div>
              <p className="text-sm text-blue-600">Active pipeline</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <BarChart3 className="mx-auto h-20 w-20 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold text-foreground">Portfolio Analytics Coming Soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Advanced cross-project analytics and insights will be available here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PortfolioAnalyticsPage;
