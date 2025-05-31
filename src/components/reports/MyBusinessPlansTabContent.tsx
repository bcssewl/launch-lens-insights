
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Lightbulb, Target, TrendingUp, Users, DollarSign, Sparkles } from 'lucide-react';

const MyBusinessPlansTabContent: React.FC = () => {
  // Mock data for preview cards
  const previewPlans = [
    {
      id: '1',
      title: 'AI Learning Platform',
      status: 'Draft',
      lastUpdated: 'Coming Soon',
      completion: 0,
    },
    {
      id: '2',
      title: 'Marketplace App',
      status: 'In Progress',
      lastUpdated: 'Coming Soon',
      completion: 0,
    },
    {
      id: '3',
      title: 'SaaS Tool',
      status: 'Review',
      lastUpdated: 'Coming Soon',
      completion: 0,
    },
  ];

  const features = [
    {
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      title: 'Comprehensive Business Plans',
      description: 'AI-generated business plans based on your validation results'
    },
    {
      icon: <Target className="h-5 w-5 text-green-500" />,
      title: 'Market Strategy',
      description: 'Detailed go-to-market strategies and competitive analysis'
    },
    {
      icon: <DollarSign className="h-5 w-5 text-yellow-500" />,
      title: 'Financial Projections',
      description: 'Revenue models, cost structures, and funding requirements'
    },
    {
      icon: <Users className="h-5 w-5 text-purple-500" />,
      title: 'Team & Operations',
      description: 'Organizational structure and operational workflows'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
            <Sparkles className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Business Plans Coming Soon</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform your validated ideas into comprehensive business plans. Our AI will generate detailed 
            strategies, financial projections, and implementation roadmaps based on your validation results.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="bg-muted/30 border-dashed">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {feature.icon}
                <div>
                  <h4 className="font-medium text-foreground mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-foreground">Preview: Your Future Business Plans</h4>
          <Button disabled variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Generate Plan
          </Button>
        </div>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {previewPlans.map((plan) => (
            <Card key={plan.id} className="bg-muted/20 border-dashed relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base text-muted-foreground">{plan.title}</CardTitle>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    Preview
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-muted-foreground">{plan.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="text-muted-foreground">{plan.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion:</span>
                    <span className="text-muted-foreground">{plan.completion}%</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-border/30">
                  <Button disabled size="sm" variant="ghost" className="w-full">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Plan
                  </Button>
                </div>
              </CardContent>
              
              {/* Overlay to show it's coming soon */}
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="text-center">
                  <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Build Your Business Plan?</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Complete your idea validation first, then we'll help you create a comprehensive business plan 
          tailored to your validated concept.
        </p>
        <Button disabled variant="default">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Business Plan (Coming Soon)
        </Button>
      </div>
    </div>
  );
};

export default MyBusinessPlansTabContent;
