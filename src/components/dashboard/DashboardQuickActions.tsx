
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, PlayCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardQuickActionsProps {
  onRefresh: () => void;
}

const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({ onRefresh }) => {
  return (
    <section className="flex flex-col sm:flex-row items-center gap-4">
      <Button size="lg" className="w-full sm:w-auto apple-button shadow-lg hover:shadow-xl transition-all duration-300" asChild>
        <Link to="/dashboard/validate">
          <Lightbulb className="mr-2 h-5 w-5" />
          Validate New Idea
        </Link>
      </Button>
      <Button variant="outline" size="lg" className="w-full sm:w-auto apple-button-outline">
        <PlayCircle className="mr-2 h-5 w-5" />
        View Tutorial
      </Button>
      <Button variant="outline" size="sm" onClick={onRefresh} className="apple-button-outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </section>
  );
};

export default DashboardQuickActions;
