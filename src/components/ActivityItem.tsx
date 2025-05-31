
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

  const getScoreDisplay = () => {
    if (score >= 8) return { bg: 'bg-gradient-to-br from-green-500 to-green-600', border: 'border-green-500', glow: 'shadow-green-500/25' };
    if (score >= 6) return { bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600', border: 'border-yellow-500', glow: 'shadow-yellow-500/25' };
    return { bg: 'bg-gradient-to-br from-red-500 to-red-600', border: 'border-red-500', glow: 'shadow-red-500/25' };
  };

  const getStatusIndicatorClass = () => {
    if (statusColor === 'green') return 'status-indicator success';
    if (statusColor === 'red') return 'status-indicator error';
    if (isRunningExperiment) return 'status-indicator info';
    return 'status-indicator warning';
  };

  const StatusIcon = getStatusIcon();
  const scoreDisplay = getScoreDisplay();

  return (
    <div className="group p-5 hover:bg-card/50 rounded-xl transition-all duration-300 border border-transparent hover:border-border/30 hover-lift">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Score Display */}
          <div className="flex-shrink-0">
            {isRunningExperiment ? (
              <div className="w-14 h-14 rounded-xl flex items-center justify-center premium-card border-primary/20">
                <Clock className="w-6 h-6 text-primary animate-pulse" />
              </div>
            ) : (
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-sm border-2 ${scoreDisplay.bg} ${scoreDisplay.border} shadow-lg ${scoreDisplay.glow}`}>
                {score.toFixed(1)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer truncate text-lg">
                {ideaName}
              </h4>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5" />
                {timestamp}
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div className={getStatusIndicatorClass()}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusText}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isRunningExperiment && reportId && (
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10 hover:text-primary text-muted-foreground hover-lift"
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
