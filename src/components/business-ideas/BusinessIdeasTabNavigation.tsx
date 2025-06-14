
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderOpen, Archive } from 'lucide-react';

const BusinessIdeasTabNavigation: React.FC = () => {
  return (
    <TabsList className="grid w-full grid-cols-2 sm:w-auto">
      <TabsTrigger value="ideas" className="flex items-center gap-2">
        <FolderOpen className="w-4 h-4" />
        <span className="hidden sm:inline">Active Ideas</span>
        <span className="sm:hidden">Active</span>
      </TabsTrigger>
      <TabsTrigger value="archived" className="flex items-center gap-2">
        <Archive className="w-4 h-4" />
        <span className="hidden sm:inline">Archived</span>
        <span className="sm:hidden">Archive</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default BusinessIdeasTabNavigation;
