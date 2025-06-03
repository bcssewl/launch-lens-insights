
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ExternalLink, Sparkles } from 'lucide-react';

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
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{item.title}</CardTitle>
            {/* <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /> Learn More</Button> */}
          </div>
          <CardDescription className="text-sm">{item.description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-2">
            <div>
              <span className="text-xs text-muted-foreground mr-1">Effort:</span>
              <Badge variant={getBadgeVariant(item.effort)}>{item.effort}</Badge>
            </div>
            <div>
              <span className="text-xs text-muted-foreground mr-1">Impact:</span>
              <Badge variant={getBadgeVariant(item.impact)}>{item.impact}</Badge>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowComingSoonDialog(true)}
            className="ml-2"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Generate Plan
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showComingSoonDialog} onOpenChange={setShowComingSoonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <AlertDialogTitle>AI Action Plans - Coming Soon!</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2">
              <p>Get detailed, step-by-step action plans tailored to each recommendation.</p>
              <p>AI-powered insights with timelines, resources, and success metrics will help you execute these recommendations effectively.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowComingSoonDialog(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ActionItemCard;
