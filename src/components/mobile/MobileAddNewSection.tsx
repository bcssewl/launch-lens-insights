
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const MobileAddNewSection: React.FC = () => {
  return (
    <Card className="mobile-gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-0">
        <Button 
          className="w-full mobile-gradient-button" 
          asChild
        >
          <Link to="/dashboard/validate" className="flex items-center justify-between">
            <div className="flex flex-col items-start">
              <span className="text-white/90 text-xs">Ready to start?</span>
              <span className="font-semibold mobile-subheading">Validate New Idea</span>
            </div>
            <div className="touch-target bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <Plus className="h-5 w-5 text-white" />
            </div>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileAddNewSection;
