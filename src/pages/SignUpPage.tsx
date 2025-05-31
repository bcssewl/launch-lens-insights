
import React from 'react';
import AuthLayout from '@/components/AuthLayout';
import { SignUpForm } from '@/components/SignUpForm';

const SignUpPage: React.FC = () => {
  return (
    <div className="min-h-screen page-background">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10">
        <AuthLayout
          title="Join Launch Lens"
          subtitle="Start validating your ideas today"
          footerText="Already have an account?"
          footerLinkText="Sign in"
          footerLinkTo="/login"
        >
          <SignUpForm />
        </AuthLayout>
      </div>
    </div>
  );
};

export default SignUpPage;
