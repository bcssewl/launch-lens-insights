
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
  text: string;
  icon: LucideIcon;
}

const InsightCard: React.FC<InsightCardProps> = ({ text, icon: Icon }) => {
  return (
    <Card className="premium-card hover-lift group cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-primary/10 backdrop-blur-sm rounded-xl group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
            <Icon className="h-5 w-5 text-primary transition-all duration-300" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed flex-1 group-hover:text-foreground transition-colors">
            {text}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
