
import React from 'react';
import { Lightbulb } from 'lucide-react';

const BusinessIdeasPageHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
        <Lightbulb className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Business Ideas</h1>
        <p className="text-muted-foreground">
          Manage and track progress on all your validated business concepts
        </p>
      </div>
    </div>
  );
};

export default BusinessIdeasPageHeader;
