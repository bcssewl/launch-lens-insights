
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import { TrendingUp } from 'lucide-react';

const BenchmarkingPage: React.FC = () => {
  return (
    <DashboardLayout>
      <DashboardHeader>Benchmarking</DashboardHeader>
      <div className="p-4 md:p-6">
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <TrendingUp className="mx-auto h-20 w-20 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold text-foreground">Benchmarking Coming Soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Compare your ideas against industry benchmarks and similar projects.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BenchmarkingPage;
