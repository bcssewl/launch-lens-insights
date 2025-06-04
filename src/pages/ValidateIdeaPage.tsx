
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import IdeaValidationForm from '@/components/IdeaValidationForm';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import { useMobile } from '@/hooks/use-mobile';

const ValidateIdeaPage: React.FC = () => {
  const isMobile = useMobile();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 overflow-x-hidden">
        {isMobile ? (
          <MobileDashboardHeader title="Idea Validation" />
        ) : (
          <DashboardHeader>Idea Validation</DashboardHeader>
        )}
        <div className="mobile-container">
          <div className="w-full max-w-none">
            <div className="apple-card border-0 shadow-lg mobile-spacing">
              <IdeaValidationForm />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ValidateIdeaPage;
