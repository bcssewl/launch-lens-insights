
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const NextStepsTeaser: React.FC = () => {
  return (
    <Card className="enhanced-card border-dashed border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Ready for Next Steps?</span>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Coming Soon
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Based on your validation results, we'll help you create a comprehensive business plan, 
          marketing strategy, and financial projections.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <h5 className="font-semibold mb-1">Business Plan</h5>
            <p className="text-muted-foreground">Complete business strategy</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <h5 className="font-semibold mb-1">Marketing Strategy</h5>
            <p className="text-muted-foreground">Targeted campaigns</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <h5 className="font-semibold mb-1">Financial Model</h5>
            <p className="text-muted-foreground">Revenue projections</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextStepsTeaser;
