
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import MetricCard from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { Lightbulb, BarChart3, FlaskConical, Target, PlayCircle } from 'lucide-react';

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <div className="p-6 space-y-6">
        {/* Quick Action Section */}
        <section className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button size="lg" className="w-full sm:w-auto gradient-button">
            <Lightbulb className="mr-2 h-5 w-5" />
            Validate New Idea
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
        
        {/* Placeholder for Recent Activity Feed & Quick Insights Panel */}
        <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Activity</h2>
            <div className="bg-card p-6 rounded-lg shadow">
                <p className="text-muted-foreground">Recent activity feed will be displayed here.</p>
                 {/* Example items from prompt */}
                <ul className="mt-4 space-y-2">
                    <li className="text-sm">"SaaS for Pet Owners" - Scored 8.2/10 - 3 days ago</li>
                    <li className="text-sm">"AI Resume Builder" - Scored 4.1/10 - 1 week ago</li>
                    <li className="text-sm">"Local Food Delivery" - Scored 6.7/10 - 2 weeks ago</li>
                </ul>
            </div>
        </section>
        <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Insights</h2>
            <div className="bg-card p-6 rounded-lg shadow">
                <p className="text-muted-foreground">Quick insights panel will be displayed here.</p>
                 {/* Example items from prompt */}
                <ul className="mt-4 space-y-2">
                    <li className="text-sm">"Your strongest ideas target B2B markets"</li>
                    <li className="text-sm">"Consider smaller niches for better validation"</li>
                    <li className="text-sm">"Your monetization models need work"</li>
                </ul>
            </div>
        </section>

      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
