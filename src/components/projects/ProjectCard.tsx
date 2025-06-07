
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, Users, Calendar, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '@/types/projects';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 60) return '#3b82f6';
    if (progress >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: project.color }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link to={`/dashboard/projects/${project.id}`} className="block">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {project.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {project.description}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <Badge className={getStageColor(project.stage)}>
            {project.stage.charAt(0).toUpperCase() + project.stage.slice(1)}
          </Badge>
          <Badge variant="outline">{project.industry}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm text-muted-foreground">{project.progress}%</span>
          </div>
          <Progress 
            value={project.progress} 
            className="h-2"
            style={{ 
              '--progress-background': getProgressColor(project.progress) 
            } as React.CSSProperties}
          />
        </div>

        {/* Agent Outputs Summary */}
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {project.agentOutputs.filter(o => o.status === 'completed').length} of {project.agentOutputs.length} analyses complete
          </span>
        </div>

        {/* Team Members */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {project.members.slice(0, 3).map(member => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
              {project.members.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{project.members.length - 3}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span className="text-xs">
              {format(new Date(project.updated_at), 'MMM d')}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {project.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{project.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
