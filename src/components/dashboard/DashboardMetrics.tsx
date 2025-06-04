
import React from 'react';
import MetricCard from '@/components/MetricCard';
import { Lightbulb, BarChart3, FileText, Target } from 'lucide-react';

interface DashboardMetricsProps {
  stats: {
    ideasValidated: number;
    averageScore: number;
    businessPlans: number;
    successRate: number;
  };
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ stats }) => {
  return (
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
  );
};

export default DashboardMetrics;
