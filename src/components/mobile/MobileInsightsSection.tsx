
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon, BarChart3, PlayCircle, Briefcase, Users, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MobileInsightItemProps {
  text: string;
  icon: LucideIcon;
}

const MobileInsightItem: React.FC<MobileInsightItemProps> = ({ text, icon: Icon }) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/30 transition-colors duration-200">
      <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="text-sm text-foreground leading-relaxed flex-1">{text}</p>
    </div>
  );
};

interface MobileInsightsSectionProps {
  hasValidatedIdeas: boolean;
}

const quickInsights = [
  { id: 1, text: "Your strongest ideas target B2B markets", icon: Briefcase },
  { id: 2, text: "Consider smaller niches for better validation", icon: Users },
  { id: 3, text: "Your monetization models need refinement", icon: DollarSign },
];

const MobileInsightsSection: React.FC<MobileInsightsSectionProps> = ({ hasValidatedIdeas }) => {
  return (
    <div className="space-y-4 md:hidden">
      {/* Your Insights Card */}
      <Card className="mobile-insights-card border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Your Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {hasValidatedIdeas ? (
            quickInsights.map((insight) => (
              <MobileInsightItem
                key={insight.id}
                text={insight.text}
                icon={insight.icon}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm">Complete a few validations to see personalized insights.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Assistant Card */}
      <Card className="mobile-assistant-card border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Get personalized advice for your startup ideas
          </p>
          <Button className="w-full mobile-gradient-button shadow-lg hover:shadow-xl transition-all duration-300" asChild>
            <Link to="/dashboard/assistant">
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Chat
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileInsightsSection;
