
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RecommendationBadgeProps {
  recommendation: string;
}

const RecommendationBadge: React.FC<RecommendationBadgeProps> = ({ recommendation }) => {
  let badgeVariant: "default" | "destructive" | "success" | "warning" | "error" | "info" = "info";
  let badgeText = recommendation.toUpperCase();

  if (recommendation.toLowerCase().includes("proceed")) {
    badgeVariant = "success";
    badgeText = `🟢 ${badgeText}`;
  } else if (recommendation.toLowerCase().includes("high risk")) {
    badgeVariant = "error";
    badgeText = `🔴 ${badgeText}`;
  } else if (recommendation.toLowerCase().includes("mixed signals")) {
    badgeVariant = "warning";
    badgeText = `🟡 ${badgeText}`;
  }

  return (
    <Badge 
      variant={badgeVariant} 
      className={cn(
        "text-xs sm:text-sm px-3 py-1.5 break-words whitespace-normal text-center max-w-full"
      )}
    >
      {badgeText}
    </Badge>
  );
};

export default RecommendationBadge;
