
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon, Lightbulb, BarChart3, Target } from 'lucide-react';

interface MobileStatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
  progressValue?: number;
}

const MobileStatCard: React.FC<MobileStatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = "text-primary",
  progressValue
}) => {
  const getProgressValue = () => {
    if (title === "Average Score" && value !== "N/A") {
      const score = parseFloat(value.split('/')[0]);
      return (score / 10) * 100;
    }
    if (title === "Success Rate" && value !== "N/A") {
      return parseFloat(value.replace('%', ''));
    }
    return progressValue || 0;
  };

  const actualProgressValue = getProgressValue();
  const shouldShowProgress = actualProgressValue > 0;

  return (
    <Card className="mobile-stat-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3 mobile-card-spacing">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="touch-target bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="mobile-subheading text-muted-foreground">{title}</CardTitle>
              <div className="mobile-heading text-foreground mt-1">{value}</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 mobile-card-spacing">
        {shouldShowProgress && (
          <div className="space-y-2">
            <div className="mobile-progress-container">
              <div 
                className="mobile-progress-bar"
                style={{ width: `${actualProgressValue}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">{Math.round(actualProgressValue)}% completion</span>
              <span className="text-primary font-medium">{actualProgressValue >= 70 ? 'Excellent' : actualProgressValue >= 40 ? 'Good' : 'Getting Started'}</span>
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>
      </CardContent>
    </Card>
  );
};

interface MobileStatsCardsProps {
  stats: {
    ideasValidated: number;
    averageScore: number;
    businessPlans: number;
    successRate: number;
  };
}

const MobileStatsCards: React.FC<MobileStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 mobile-spacing md:hidden">
      <MobileStatCard
        title="Ideas Validated"
        value={stats.ideasValidated.toString()}
        subtitle={stats.ideasValidated > 0 ? "Keep the momentum going!" : "Start your validation journey"}
        icon={Lightbulb}
      />
      <MobileStatCard
        title="Average Score"
        value={stats.averageScore > 0 ? `${stats.averageScore}/10` : "N/A"}
        subtitle={stats.averageScore > 0 ? (stats.averageScore >= 6 ? "↗ Trending upward" : "Room for improvement") : "No completed analyses yet"}
        icon={BarChart3}
        iconColor={stats.averageScore >= 6 ? "text-green-500" : "text-yellow-500"}
      />
      <MobileStatCard
        title="Success Rate"
        value={stats.successRate > 0 ? `${stats.successRate}%` : "N/A"}
        subtitle={stats.successRate > 0 ? "vs 42% industry average" : "Complete more validations"}
        icon={Target}
        iconColor="text-yellow-500"
      />
    </div>
  );
};

export default MobileStatsCards;
