
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, PlayCircle, Briefcase, Users, DollarSign } from 'lucide-react';
import { Card as ShadcnCard, CardContent as ShadcnCardContent, CardHeader as ShadcnCardHeader, CardTitle as ShadcnCardTitle } from '@/components/ui/card';
import InsightCard from '@/components/InsightCard';
import { Link } from 'react-router-dom';

interface DashboardInsightsProps {
  hasValidatedIdeas: boolean;
}

const quickInsights = [
  { id: 1, text: "Your strongest ideas target B2B markets", icon: Briefcase },
  { id: 2, text: "Consider smaller niches for better validation", icon: Users },
  { id: 3, text: "Your monetization models need refinement", icon: DollarSign },
];

const DashboardInsights: React.FC<DashboardInsightsProps> = ({ hasValidatedIdeas }) => {
  return (
    <div className="space-y-6">
      <ShadcnCard className="apple-card border-0 shadow-lg">
        <ShadcnCardHeader className="pb-4">
          <ShadcnCardTitle className="text-xl font-semibold">Your Insights</ShadcnCardTitle>
        </ShadcnCardHeader>
        <ShadcnCardContent className="space-y-4">
          {hasValidatedIdeas ? (
            quickInsights.map((insight) => (
              <InsightCard
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
        </ShadcnCardContent>
      </ShadcnCard>

      <ShadcnCard className="apple-card border-0 shadow-lg">
        <ShadcnCardHeader className="pb-4">
          <ShadcnCardTitle className="text-lg font-semibold">AI Assistant</ShadcnCardTitle>
        </ShadcnCardHeader>
        <ShadcnCardContent>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Get personalized advice for your startup ideas
          </p>
          <Button className="w-full apple-button shadow-lg hover:shadow-xl transition-all duration-300" asChild>
            <Link to="/dashboard/assistant">
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Chat
            </Link>
          </Button>
        </ShadcnCardContent>
      </ShadcnCard>
    </div>
  );
};

export default DashboardInsights;
