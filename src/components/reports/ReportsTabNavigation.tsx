
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

const ReportsTabNavigation: React.FC = () => {
  return (
    <TabsList className="grid w-full sm:w-auto grid-cols-3">
      <TabsTrigger value="reports">My Reports</TabsTrigger>
      <TabsTrigger value="business-plans">My Business Plans</TabsTrigger>
      <TabsTrigger value="projects">Projects</TabsTrigger>
    </TabsList>
  );
};

export default ReportsTabNavigation;
