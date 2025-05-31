
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import IdeaValidationForm from '@/components/IdeaValidationForm';
import DashboardHeader from '@/components/DashboardHeader';

const ValidateIdeaPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen page-background">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-accent/20 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-10">
          <DashboardHeader>Idea Validation</DashboardHeader>
          <div className="p-4 sm:p-6 lg:p-8">
            <IdeaValidationForm />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ValidateIdeaPage;
