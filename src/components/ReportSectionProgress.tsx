
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface ReportSection {
  section_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  agent_name?: string;
}

interface ReportSectionProgressProps {
  sections: ReportSection[];
}

const sectionLabels = {
  overview: 'Overview Analysis',
  market_analysis: 'Market Research',
  competition: 'Competition Analysis',
  swot: 'SWOT Analysis',
  scores: 'Scoring & Evaluation',
  action_items: 'Action Items'
};

const ReportSectionProgress: React.FC<ReportSectionProgressProps> = ({ sections }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const completedSections = sections.filter(s => s.status === 'completed').length;
  const totalSections = Object.keys(sectionLabels).length;
  const progressPercentage = (completedSections / totalSections) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Analysis Progress</CardTitle>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-sm text-muted-foreground">
            {completedSections} of {totalSections} sections completed
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(sectionLabels).map(([sectionType, label]) => {
            const section = sections.find(s => s.section_type === sectionType);
            const status = section?.status || 'pending';
            
            return (
              <div key={sectionType} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(status)}
                  <div>
                    <p className="font-medium">{label}</p>
                    {section?.agent_name && (
                      <p className="text-xs text-muted-foreground">Agent: {section.agent_name}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(status)}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportSectionProgress;
