
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export interface ActionItem { // Exporting ActionItem interface
  id: number;
  title: string;
  effort: string;
  impact: string;
  description: string;
}

interface ActionItemCardProps {
  item: ActionItem;
}

const getBadgeVariant = (level: string): "default" | "secondary" | "destructive" | "outline" => {
  const lowerLevel = level.toLowerCase();
  if (lowerLevel === "high") return "destructive"; // High impact/effort
  if (lowerLevel === "medium") return "secondary"; // Using 'secondary' which is often yellowish/orangeish in themes
  if (lowerLevel === "low") return "default"; // Low impact/effort (often green/blue in themes)
  return "outline";
};

const ActionItemCard: React.FC<ActionItemCardProps> = ({ item }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{item.title}</CardTitle>
          {/* <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /> Learn More</Button> */}
        </div>
        <CardDescription className="text-sm">{item.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-start space-x-2 pt-4 border-t">
        <div>
          <span className="text-xs text-muted-foreground mr-1">Effort:</span>
          <Badge variant={getBadgeVariant(item.effort)}>{item.effort}</Badge>
        </div>
        <div>
          <span className="text-xs text-muted-foreground mr-1">Impact:</span>
          <Badge variant={getBadgeVariant(item.impact)}>{item.impact}</Badge>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ActionItemCard;
