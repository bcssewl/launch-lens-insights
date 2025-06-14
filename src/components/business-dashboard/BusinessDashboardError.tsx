
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface BusinessDashboardErrorProps {
  error: string;
}

const BusinessDashboardError: React.FC<BusinessDashboardErrorProps> = ({ error }) => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="apple-card p-12 text-center">
        <p className="text-red-600 mb-6 text-lg">
          {error || 'Business idea not found'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline" className="apple-button-outline">
            <Link to="/dashboard/ideas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ideas
            </Link>
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="apple-button-outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboardError;
