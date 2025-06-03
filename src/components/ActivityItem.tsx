
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
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

  const getStatusIcon = () => {
    if (isRunningExperiment) return Clock;
    if (statusColor === 'green') return CheckCircle;
    if (statusColor === 'red') return XCircle;
    return AlertCircle;
  };

  const getScoreColorClasses = () => {
    if (score >= 7) return 'bg-gradient-to-br from-green-500 to-green-600 border-green-600 shadow-soft';
    if (score >= 5) return 'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-600 shadow-soft';
    return 'bg-gradient-to-br from-red-500 to-red-600 border-red-600 shadow-soft';
  };

  const getStatusIndicatorClass = () => {
    if (statusColor === 'green') return 'flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200';
    if (statusColor === 'red') return 'flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200';
    if (isRunningExperiment) return 'flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200';
    return 'flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200';
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="group p-4 hover:bg-accent/30 rounded-xl transition-all duration-200 border border-transparent hover:border-border/50 hover-lift">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Score Display */}
          <div className="flex-shrink-0">
            {isRunningExperiment ? (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20">
                <Clock className="w-5 h-5 text-primary animate-pulse" />
              </div>
            ) : (
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm border ${getScoreColorClasses()}`}>
                {score.toFixed(1)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h4 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer truncate">
                {ideaName}
              </h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timestamp}
              </p>
            </div>

            {/* Status with Icon */}
            <div className="flex items-center gap-2">
              <div className={getStatusIndicatorClass()}>
                <StatusIcon className="w-3 h-3" />
                <span>{statusText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isRunningExperiment && reportId && (
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
            onClick={handleViewReport}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActivityItem;
