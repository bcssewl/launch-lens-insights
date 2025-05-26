
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import IdeaValidationForm from '@/components/IdeaValidationForm';
import DashboardHeader from '@/components/DashboardHeader';

const ValidateIdeaPage: React.FC = () => {
  return (
    <DashboardLayout>
      <DashboardHeader>Idea Validation</DashboardHeader>
      <div className="p-4 sm:p-6 lg:p-8">
        <IdeaValidationForm />
      </div>
    </DashboardLayout>
  );
};

export default ValidateIdeaPage;
