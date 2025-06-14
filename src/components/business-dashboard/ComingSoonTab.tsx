
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2 } from 'lucide-react';

interface ComingSoonTabProps {
  title: string;
  description: string;
  features: string[];
}

const ComingSoonTab: React.FC<ComingSoonTabProps> = ({ title, description, features }) => {
  return (
    <div className="space-y-6">
      {/* Coming Soon Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {title}
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Coming Soon
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {description}
          </p>
          <Button disabled className="w-full sm:w-auto">
            <Clock className="mr-2 h-4 w-4" />
            Available Soon
          </Button>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <Card>
        <CardHeader>
          <CardTitle>What's Included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Development Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Feature Development</span>
              <Badge variant="outline">In Planning</Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-1/4"></div>
            </div>
            <p className="text-xs text-muted-foreground">
              We're actively working on this feature. Stay tuned for updates!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonTab;
