
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

const ValidationStatusHeader: React.FC = () => {
  return (
    <Card className="enhanced-card border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <CardTitle className="text-lg">Validation Complete</CardTitle>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Your idea validation analysis has been completed. View the full detailed report or share it with others.
        </p>
      </CardContent>
    </Card>
  );
};

export default ValidationStatusHeader;
