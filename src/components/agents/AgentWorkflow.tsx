
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Project } from '@/types/projects';
import { mockAgentTypes } from '@/utils/mockProjectData';

interface AgentWorkflowProps {
  project: Project;
}

const AgentWorkflow: React.FC<AgentWorkflowProps> = ({ project }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Agent Analysis Workflow</h2>
        <p className="text-sm text-muted-foreground">
          Track the progress of your automated business analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockAgentTypes.map(agentType => {
          const output = project.agentOutputs.find(o => o.agentType === agentType.id);
          const status = output?.status || 'pending';
          
          return (
            <Card key={agentType.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{agentType.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {agentType.description}
                    </p>
                  </div>
                  <Badge className={getStatusColor(status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(status)}
                      {status}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Duration: {agentType.estimatedDuration}
                </div>
                
                {output && output.status === 'in-progress' && (
                  <Progress value={65} className="h-2" />
                )}
                
                {output && output.score && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Score:</span>
                    <Badge variant="outline">{output.score}/10</Badge>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {agentType.outputs.length} outputs
                  </div>
                  {status === 'pending' && (
                    <Button size="sm" variant="outline">
                      <Play className="mr-1 h-3 w-3" />
                      Start
                    </Button>
                  )}
                  {status === 'completed' && (
                    <Button size="sm" variant="outline">
                      View Results
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AgentWorkflow;
