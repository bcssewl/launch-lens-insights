
import React from 'react';
import AuthLayout from '@/components/AuthLayout';
import { SignUpForm } from '@/components/SignUpForm';

const SignUpPage: React.FC = () => {
  return (
    <AuthLayout
      title="Join Optivise"
      subtitle="Start validating your ideas today"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    >
      <SignUpForm />
    </AuthLayout>
  );
};

export default SignUpPage;
