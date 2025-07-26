import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Edit3, Clock, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanStep {
  id: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface PlanCardProps {
  plan: PlanStep[];
  isActive?: boolean;
  onAccept?: (feedback?: string) => void;
  onReject?: (feedback: string) => void;
  autoAccept?: boolean;
  className?: string;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isActive = false,
  onAccept,
  onReject,
  autoAccept = false,
  className
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleAccept = () => {
    onAccept?.(feedback || undefined);
    setFeedback('');
    setShowFeedback(false);
  };

  const handleReject = () => {
    if (!feedback.trim()) return;
    onReject?.(feedback);
    setFeedback('');
    setShowFeedback(false);
  };

  const getStepIcon = (status: PlanStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'active':
        return <Clock className="w-4 h-4 text-primary animate-pulse" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  return (
    <Card className={cn(
      "border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10",
      isActive && "border-primary/40",
      className
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Edit3 className="w-5 h-5 text-primary" />
          Research Plan
          {isActive && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {plan.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-colors",
                step.status === 'active' && "bg-primary/10",
                step.status === 'completed' && "bg-green-500/10"
              )}
            >
              {getStepIcon(step.status)}
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  <span className="font-medium">Step {index + 1}:</span> {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {!autoAccept && isActive && (onAccept || onReject) && (
          <div className="space-y-3 pt-3 border-t border-primary/20">
            {showFeedback ? (
              <div className="space-y-3">
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback or modifications for this plan..."
                  className="min-h-20"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAccept}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept with Feedback
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="destructive"
                    size="sm"
                    disabled={!feedback.trim()}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Request Changes
                  </Button>
                  <Button
                    onClick={() => setShowFeedback(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleAccept}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept Plan
                </Button>
                <Button
                  onClick={() => setShowFeedback(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Provide Feedback
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};