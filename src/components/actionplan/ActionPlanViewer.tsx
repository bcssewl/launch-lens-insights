
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, RefreshCw, Save, Target, Users, DollarSign, TrendingUp } from 'lucide-react';

interface ActionPlanViewerProps {
  plan: any;
  report: any;
  onBackToChat: () => void;
  onRegeneratePlan: () => void;
}

const ActionPlanViewer: React.FC<ActionPlanViewerProps> = ({ 
  plan, 
  report, 
  onBackToChat, 
  onRegeneratePlan 
}) => {
  const handleDownloadPlan = () => {
    const planContent = `
LEAN STARTUP ACTION PLAN
========================

Business Idea: ${plan.ideaName}
Validation Score: ${plan.score}/10
Budget: ${plan.budget}
User Base: ${plan.userBase}

${plan.phases.map((phase: any, index: number) => `
PHASE ${index + 1}: ${phase.title}
${'-'.repeat(phase.title.length + 10)}
Description: ${phase.description}
Budget: ${phase.budget}

Tasks:
${phase.tasks.map((task: string) => `• ${task}`).join('\n')}

Success Metrics:
${phase.success_metrics.map((metric: string) => `• ${metric}`).join('\n')}
`).join('\n')}

KEY RECOMMENDATIONS:
${plan.recommendations.map((rec: string) => `• ${rec}`).join('\n')}
    `.trim();
    
    const blob = new Blob([planContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `action-plan-${plan.ideaName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBackToChat}
          className="flex items-center gap-2 hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Chat
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPlan}>
            <Download className="mr-2 h-4 w-4" />
            Download Plan
          </Button>
          <Button variant="outline" size="sm" onClick={onRegeneratePlan}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Plan
          </Button>
        </div>
      </div>

      {/* Plan Overview */}
      <Card className="apple-card border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{plan.ideaName}</CardTitle>
              <p className="text-muted-foreground">Lean Startup Action Plan</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Validation Score</p>
                <p className="font-semibold">{plan.score}/10</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-semibold">{plan.budget}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">User Base</p>
                <p className="font-semibold">{plan.userBase}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      <div className="space-y-6">
        {plan.phases.map((phase: any, index: number) => (
          <Card key={index} className="apple-card border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{phase.title}</CardTitle>
                <Badge variant="secondary">{phase.budget}</Badge>
              </div>
              <p className="text-muted-foreground">{phase.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Key Tasks</h4>
                <ul className="space-y-2">
                  {phase.tasks.map((task: string, taskIndex: number) => (
                    <li key={taskIndex} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Success Metrics</h4>
                <div className="flex flex-wrap gap-2">
                  {phase.success_metrics.map((metric: string, metricIndex: number) => (
                    <Badge key={metricIndex} variant="outline" className="text-xs">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Recommendations */}
      <Card className="apple-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Key Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {plan.recommendations.map((recommendation: string, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-xs font-bold">✓</span>
                </div>
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionPlanViewer;
