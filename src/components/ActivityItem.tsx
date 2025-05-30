import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActivityItemProps {
  ideaName: string;
  score: number;
  timestamp: string;
  statusText: string;
  statusColor: 'green' | 'yellow' | 'red';
  reportId?: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  ideaName,
  score,
  timestamp,
  statusText,
  statusColor,
  reportId,
}) => {
  const navigate = useNavigate();
  const isRunningExperiment = score === 0 && (statusText === 'Validation Queued' || statusText === 'Analysis in Progress');

  const handleViewReport = () => {
    if (reportId) {
      navigate(`/results/${reportId}`);
    }
  };

  const getScoreColorClasses = () => {
    if (score >= 7) return 'bg-green-500 border-green-600';
    if (score >= 5) return 'bg-yellow-500 border-yellow-600';
    return 'bg-red-500 border-red-600';
  };

  const getBadgeClasses = () => {
    if (statusColor === 'green') return 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 border-green-300 dark:border-green-700';
    if (statusColor === 'yellow') return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800 border-yellow-300 dark:border-yellow-700';
    return 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 border-red-300 dark:border-red-700';
  };

  return (
    <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-accent/50 rounded-lg transition-colors">
      <div className="flex items-center mb-2 sm:mb-0">
        {isRunningExperiment ? (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 border-2 border-blue-600 mr-4">
            <Clock className="w-5 h-5 text-white animate-pulse" />
          </div>
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 mr-4 ${getScoreColorClasses()}`}
          >
            {score.toFixed(1)}
          </div>
        )}
        <div>
          <a href="#" className="font-semibold text-primary hover:underline">
            {ideaName}
          </a>
          <p className="text-xs text-muted-foreground">{timestamp}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 mt-2 sm:mt-0">
         <Badge className={`${getBadgeClasses()} whitespace-nowrap`}>{statusText}</Badge>
        {!isRunningExperiment && reportId && (
          <Button
            variant="outline"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2 sm:mt-0"
            onClick={handleViewReport}
          >
            View Report <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActivityItem;
