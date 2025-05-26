
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RecommendationBadgeProps {
  recommendation: string;
}

const RecommendationBadge: React.FC<RecommendationBadgeProps> = ({ recommendation }) => {
  let badgeVariant: "default" | "destructive" | "secondary" = "secondary";
  let textColor = "text-foreground";
  let badgeText = recommendation.toUpperCase();

  if (recommendation.toLowerCase().includes("proceed")) {
    badgeVariant = "default"; // Uses primary color
    textColor = "text-primary-foreground";
    badgeText = `🟢 ${badgeText}`;
  } else if (recommendation.toLowerCase().includes("high risk")) {
    badgeVariant = "destructive";
    textColor = "text-destructive-foreground";
    badgeText = `🔴 ${badgeText}`;
  } else if (recommendation.toLowerCase().includes("mixed signals")) {
    // Using secondary for yellow-ish, assuming theme supports it
    // Or could use outline with a specific yellow border/text if theme doesn't have a good yellow
    badgeVariant = "secondary" 
    textColor = "text-yellow-600 dark:text-yellow-400 border border-yellow-500/50";
    badgeText = `🟡 ${badgeText}`;
  }

  return (
    <Badge variant={badgeVariant} className={cn("text-sm px-3 py-1.5 whitespace-nowrap", textColor)}>
      {badgeText}
    </Badge>
  );
};

export default RecommendationBadge;
