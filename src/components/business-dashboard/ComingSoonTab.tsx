
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, Rocket, Calendar } from 'lucide-react';

interface ComingSoonTabProps {
  title: string;
  description: string;
  features: string[];
}

const ComingSoonTab: React.FC<ComingSoonTabProps> = ({ title, description, features }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Coming Soon Header */}
      <Card className="apple-card shadow-soft hover-lift">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-3">
              <Rocket className="w-6 h-6 text-primary" />
              {title}
              <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 border-blue-200">
                <Clock className="w-3 h-3" />
                Coming Soon
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-lg border border-primary/10">
            <p className="text-muted-foreground leading-relaxed mb-4">
              {description}
            </p>
            <Button disabled className="apple-button-outline w-full sm:w-auto">
              <Clock className="mr-2 h-4 w-4" />
              Available Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Features Preview */}
      <Card className="apple-card shadow-soft hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            What's Included
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-foreground font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Progress Card */}
      <Card className="apple-card shadow-soft hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Development Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-sm font-medium text-foreground">Feature Development</span>
                <p className="text-xs text-muted-foreground">Currently in planning phase</p>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                In Planning
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full w-1/4 transition-all duration-500"></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Planning</span>
                <span>25% Complete</span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              🚀 We're actively working on this feature! Our development team is committed to delivering 
              high-quality tools that will accelerate your business success. Stay tuned for updates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonTab;
