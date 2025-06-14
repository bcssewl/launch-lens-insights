
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const BusinessDashboardLoading: React.FC = () => {
  return (
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
  );
};

export default BusinessDashboardLoading;
