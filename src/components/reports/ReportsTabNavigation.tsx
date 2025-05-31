
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

const ReportsTabNavigation: React.FC = () => {
  return (
    <TabsList className="grid w-full sm:w-auto grid-cols-2">
      <TabsTrigger value="reports">My Reports</TabsTrigger>
      <TabsTrigger value="business-plans">My Business Plans</TabsTrigger>
    </TabsList>
  );
};

export default ReportsTabNavigation;
