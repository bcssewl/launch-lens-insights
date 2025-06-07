
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

const IdeasTabNavigation: React.FC = () => {
  return (
    <TabsList className="grid w-full grid-cols-2 lg:w-auto">
      <TabsTrigger value="ideas" className="text-sm">
        Business Ideas
      </TabsTrigger>
      <TabsTrigger value="business-plans" className="text-sm">
        Business Plans
      </TabsTrigger>
    </TabsList>
  );
};

export default IdeasTabNavigation;
