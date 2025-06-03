
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import IdeaValidationForm from '@/components/IdeaValidationForm';
import DashboardHeader from '@/components/DashboardHeader';

const ValidateIdeaPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <DashboardHeader>Idea Validation</DashboardHeader>
        <div className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="apple-card border-0 shadow-lg p-8">
              <IdeaValidationForm />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ValidateIdeaPage;
