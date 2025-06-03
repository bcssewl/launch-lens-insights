
import React from 'react';
import { Logo } from './icons';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerLinkText: string;
  footerLinkTo: string;
  footerText: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Back Arrow */}
        <div className="flex justify-start">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col items-center">
          <Logo />
          <h2 className="mt-6 text-center text-3xl font-extrabold font-heading text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
        {children}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {footerText}{' '}
          <Link to={footerLinkTo} className="font-medium text-primary hover:text-primary/90">
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
