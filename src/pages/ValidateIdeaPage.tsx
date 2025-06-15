
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import IdeaValidationForm from '@/components/IdeaValidationForm';
import DashboardHeader from '@/components/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import { FloatingElements } from '@/components/landing/FloatingElements';
import { useIsMobile } from '@/hooks/use-mobile';

const ValidateIdeaPage: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <DashboardLayout>
      <div className="apple-hero overflow-hidden min-h-screen flex flex-col">
        <FloatingElements />
        {isMobile ? (
          <MobileDashboardHeader title="Idea Validation" />
        ) : (
          <DashboardHeader>Idea Validation</DashboardHeader>
        )}
        <div className="flex-1 flex items-center justify-center px-4 py-2">
          <div className="w-full max-w-4xl">
            <IdeaValidationForm />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ValidateIdeaPage;
