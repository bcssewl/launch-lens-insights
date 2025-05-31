
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
    <Card className="glassmorphism-card border-white/10 hover-lift hover-glow group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
          {title}
        </CardTitle>
        <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg group-hover:bg-white/20 transition-colors">
          <Icon className={`h-5 w-5 ${iconColor} opacity-80 group-hover:opacity-100 transition-opacity`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-1">
          <div className="text-3xl font-bold text-white">{value}</div>
        </div>
        
        {shouldShowProgress && actualProgressValue > 0 && (
          <div className="space-y-2">
            <Progress 
              value={actualProgressValue} 
              className="h-2 bg-white/10"
            />
            <p className="text-xs text-white/60">
              {Math.round(actualProgressValue)}% completion
            </p>
          </div>
        )}
        
        <p className="text-sm text-white/70 leading-relaxed">{subtitle}</p>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
