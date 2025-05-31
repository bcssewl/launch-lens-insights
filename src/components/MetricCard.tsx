
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
  showProgress?: boolean;
  progressValue?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = "text-primary",
  showProgress = false,
  progressValue = 0
}) => {
  const getProgressValue = () => {
    if (title === "Average Score" && value !== "N/A") {
      const score = parseFloat(value.split('/')[0]);
      return (score / 10) * 100;
    }
    if (title === "Success Rate" && value !== "N/A") {
      return parseFloat(value.replace('%', ''));
    }
    return progressValue;
  };

  const actualProgressValue = getProgressValue();
  const shouldShowProgress = showProgress || (title === "Average Score" && value !== "N/A") || (title === "Success Rate" && value !== "N/A");

  return (
    <Card className="premium-card hover-lift group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className="p-2.5 bg-primary/10 backdrop-blur-sm rounded-xl group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
          <Icon className={`h-5 w-5 ${iconColor} transition-all duration-300`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-1">
          <div className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
            {value}
          </div>
        </div>
        
        {shouldShowProgress && actualProgressValue > 0 && (
          <div className="space-y-3">
            <div className="progress-bar h-2">
              <div 
                className="progress-fill animate-slide-in"
                style={{ width: `${actualProgressValue}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(actualProgressValue)}% completion
            </p>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
