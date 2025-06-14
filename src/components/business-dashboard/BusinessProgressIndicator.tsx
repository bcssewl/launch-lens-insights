
import React from 'react';

const BusinessProgressIndicator: React.FC = () => {
  return (
    <div className="apple-card p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Development Progress</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">1 of 5</span>
          <span className="text-sm text-muted-foreground">sections complete</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-1/5 transition-all duration-500"></div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Validation Complete</span>
          <span>20% Complete</span>
        </div>
      </div>
    </div>
  );
};

export default BusinessProgressIndicator;
