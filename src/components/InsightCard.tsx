
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
  text: string;
  icon: LucideIcon;
}

const InsightCard: React.FC<InsightCardProps> = ({ text, icon: Icon }) => {
  return (
    <Card className="enhanced-card hover-lift hover-glow group cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-sm text-foreground leading-relaxed flex-1 group-hover:text-primary transition-colors">
            {text}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
