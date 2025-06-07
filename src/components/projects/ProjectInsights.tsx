
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { Project } from '@/types/projects';

interface ProjectInsightsProps {
  project: Project;
}

const ProjectInsights: React.FC<ProjectInsightsProps> = ({ project }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>AI insights coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectInsights;
