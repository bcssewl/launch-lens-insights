
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  Play, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Lightbulb,
  DollarSign,
  Target,
  Shield
} from 'lucide-react';
import { Project } from '@/types/projects';
import AgentWorkflow from '@/components/agents/AgentWorkflow';
import ProjectTimeline from './ProjectTimeline';
import ProjectInsights from './ProjectInsights';
import { format } from 'date-fns';

interface ProjectDashboardProps {
  project: Project;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project }) => {
  const getStageColor = (stage: Project['stage']) => {
    switch (stage) {
      case 'ideation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'validation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'development':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'launch':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'validation':
        return <Lightbulb className="h-4 w-4" />;
      case 'financial':
        return <DollarSign className="h-4 w-4" />;
      case 'market':
        return <Target className="h-4 w-4" />;
      case 'competitor':
        return <BarChart3 className="h-4 w-4" />;
      case 'swot':
        return <Shield className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const completedOutputs = project.agentOutputs.filter(o => o.status === 'completed').length;
  const totalOutputs = project.agentOutputs.length;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-8 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{project.name}</h1>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStageColor(project.stage)}>
              {project.stage.charAt(0).toUpperCase() + project.stage.slice(1)}
            </Badge>
            <Badge variant="outline">{project.industry}</Badge>
            <div className="flex flex-wrap gap-1">
              {project.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Run Analysis
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-foreground">{project.progress}%</div>
              <Progress value={project.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {completedOutputs}/{totalOutputs}
            </div>
            <p className="text-sm text-muted-foreground">Complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-foreground">{project.members.length}</div>
              <div className="flex -space-x-1">
                {project.members.slice(0, 3).map(member => (
                  <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {format(new Date(project.updated_at), 'MMM d')}
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(project.updated_at), 'yyyy')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analyses">Analyses</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Outputs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Agent Analyses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.agentOutputs.length > 0 ? (
                  project.agentOutputs.map(output => (
                    <div key={output.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getAgentIcon(output.agentType)}
                        <div>
                          <div className="font-medium text-sm">{output.agentName}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(output.created_at), 'MMM d, HH:mm')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {output.score && (
                          <Badge variant="outline">{output.score}/10</Badge>
                        )}
                        {getStatusIcon(output.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No analyses yet</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Start Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.members.map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.role}</div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Invite Members
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analyses">
          <AgentWorkflow project={project} />
        </TabsContent>

        <TabsContent value="timeline">
          <ProjectTimeline project={project} />
        </TabsContent>

        <TabsContent value="insights">
          <ProjectInsights project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDashboard;
