
import React from 'react';
import AuthLayout from '@/components/AuthLayout';
import { LoginForm } from '@/components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your Launch Lens account"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo="/signup"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
