
import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import ProjectDashboard from '@/components/projects/ProjectDashboard';
import { getProjectById } from '@/utils/mockProjectData';

const ProjectDashboardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? getProjectById(projectId) : null;

  if (!project) {
    return (
      <DashboardLayout>
        <DashboardHeader>Project Not Found</DashboardHeader>
        <div className="p-4 md:p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-foreground">Project not found</h2>
            <p className="text-muted-foreground mt-2">The project you're looking for doesn't exist.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader>{project.name}</DashboardHeader>
      <div className="p-4 md:p-6">
        <ProjectDashboard project={project} />
      </div>
    </DashboardLayout>
  );
};

export default ProjectDashboardPage;
