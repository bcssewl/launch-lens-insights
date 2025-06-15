
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getStatusAriaAttributes } from '@/lib/accessibility';

interface RecommendationBadgeProps {
  recommendation: string;
}

const RecommendationBadge: React.FC<RecommendationBadgeProps> = ({ recommendation }) => {
  let badgeVariant: "default" | "destructive" | "success" | "warning" | "error" | "info" = "info";
  let badgeText = recommendation.toUpperCase();
  let statusType: 'success' | 'warning' | 'error' | 'info' = 'info';

  if (recommendation.toLowerCase().includes("proceed")) {
    badgeVariant = "success";
    statusType = "success";
    badgeText = `${badgeText}`;
  } else if (recommendation.toLowerCase().includes("high risk")) {
    badgeVariant = "error";
    statusType = "error";
    badgeText = `${badgeText}`;
  } else if (recommendation.toLowerCase().includes("mixed signals")) {
    badgeVariant = "warning";
    statusType = "warning";
    badgeText = `${badgeText}`;
  }

  const ariaAttributes = getStatusAriaAttributes(statusType);

  return (
    <Badge 
      variant={badgeVariant} 
      className={cn(
        "text-xs sm:text-sm px-3 py-1.5 break-words whitespace-normal text-center max-w-full"
      )}
      statusLabel={`Recommendation status: ${badgeText}`}
      {...ariaAttributes}
    >
      <span className="sr-only">Recommendation: </span>
      {badgeText}
    </Badge>
  );
};

export default RecommendationBadge;
