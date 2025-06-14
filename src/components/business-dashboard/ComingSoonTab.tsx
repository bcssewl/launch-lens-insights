
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, Bell } from 'lucide-react';

interface ComingSoonTabProps {
  title: string;
  description: string;
  features: string[];
}

const ComingSoonTab: React.FC<ComingSoonTabProps> = ({ title, description, features }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="text-muted-foreground mt-2">{description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-4">What's Included:</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
            <h4 className="font-semibold text-foreground mb-2">Be the First to Know</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get notified when this feature becomes available and be among the first to use it for your business idea.
            </p>
            <Button className="w-full sm:w-auto">
              <Bell className="mr-2 h-4 w-4" />
              Notify Me When Available
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Expected release: Coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonTab;
