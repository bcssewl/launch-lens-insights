
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HoverInfoCardProps {
  trigger: React.ReactNode;
  title?: string;
  content: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const HoverInfoCard: React.FC<HoverInfoCardProps> = ({ 
  trigger, 
  title, 
  content, 
  className,
  side = 'top'
}) => {
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="cursor-help transition-all duration-200 hover:scale-105">
          {trigger}
        </div>
      </HoverCardTrigger>
      <HoverCardContent 
        side={side} 
        className={cn("w-80 p-0 animate-fade-in", className)}
      >
        <Card className="border-0 shadow-lg">
          {title && (
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
          )}
          <CardContent className={cn("text-sm", title ? "pt-0" : "")}>
            {content}
          </CardContent>
        </Card>
      </HoverCardContent>
    </HoverCard>
  );
};

export default HoverInfoCard;
