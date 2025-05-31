
import React from 'react';
import { CheckCircle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RecommendationCardProps {
  recommendation: string;
  score: number;
  status?: 'proceed' | 'caution' | 'high-risk';
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  score, 
  status = 'proceed' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'proceed':
        return {
          icon: CheckCircle,
          badge: '🟢 Ready to Proceed',
          badgeVariant: 'default' as const
        };
      case 'caution':
        return {
          icon: TrendingUp,
          badge: '🟡 Proceed with Caution',
          badgeVariant: 'secondary' as const
        };
      case 'high-risk':
        return {
          icon: TrendingUp,
          badge: '🔴 High Risk',
          badgeVariant: 'destructive' as const
        };
      default:
        return {
          icon: CheckCircle,
          badge: '🟢 Ready to Proceed',
          badgeVariant: 'default' as const
        };
    }
  };

  const { icon: Icon, badge, badgeVariant } = getStatusConfig();

  return (
    <div className="recommendation-card group">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Strategic Recommendation
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {recommendation}
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <Badge variant={badgeVariant} className="text-sm px-3 py-1">
              {badge}
            </Badge>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Score:</span>
              <span className="text-lg font-bold text-primary">
                {score.toFixed(1)}/10
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
