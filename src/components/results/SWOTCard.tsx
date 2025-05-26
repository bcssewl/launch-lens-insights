
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SWOTCardProps {
  title: string;
  items: string[];
  className?: string;
  titleClassName?: string;
}

const SWOTCard: React.FC<SWOTCardProps> = ({ title, items, className, titleClassName }) => {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className={cn("text-xl", titleClassName)}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
        {items.length === 0 && <p className="text-sm text-muted-foreground">No {title.toLowerCase()} identified.</p>}
      </CardContent>
    </Card>
  );
};

export default SWOTCard;
