
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileDashboardHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const MobileDashboardHeader: React.FC<MobileDashboardHeaderProps> = ({ 
  title = "Dashboard",
  showBackButton = false 
}) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="mobile-container">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboardHeader;
