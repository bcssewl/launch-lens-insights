
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import ProjectsOverview from '@/components/projects/ProjectsOverview';

const ProjectsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <DashboardHeader>Projects</DashboardHeader>
      <div className="p-4 md:p-6">
        <ProjectsOverview />
      </div>
    </DashboardLayout>
  );
};

export default ProjectsPage;
