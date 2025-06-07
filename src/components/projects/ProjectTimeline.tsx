
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Project } from '@/types/projects';

interface ProjectTimelineProps {
  project: Project;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Project Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Timeline visualization coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;
