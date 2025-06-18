
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const MobileAddNewSection: React.FC = () => {
  return (
    <Card className="mobile-gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 w-full">
      <CardContent className="p-0">
        <Button 
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary via-accent to-yellow-500 text-white font-medium text-base hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0" 
          asChild
        >
          <Link to="/dashboard/validate" className="flex items-center justify-between px-4">
            <div className="flex flex-col items-start">
              <span className="text-white/90 text-sm">Ready to start?</span>
              <span className="font-semibold text-base">Analyze New Idea</span>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Plus className="h-4 w-4 text-white" />
            </div>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileAddNewSection;
