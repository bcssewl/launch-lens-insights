
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
  text: string;
  icon: LucideIcon;
}

const InsightCard: React.FC<InsightCardProps> = ({ text, icon: Icon }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary/50">
      <CardContent className="p-4 flex items-center space-x-3">
        <Icon className="h-6 w-6 text-primary" />
        <p className="text-sm text-foreground">{text}</p>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
