
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertCircle, XCircle, Download, Lightbulb } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface MobileActivityItemProps {
  ideaName: string;
  score: number;
  timestamp: string;
  statusText: string;
  statusColor: 'green' | 'yellow' | 'red';
  reportId?: string;
}

const MobileActivityItem: React.FC<MobileActivityItemProps> = ({
  ideaName,
  score,
  timestamp,
  statusText,
  statusColor,
  reportId,
}) => {
  const navigate = useNavigate();
  const isRunningExperiment = statusText === 'Analysis in Progress';

  const handleViewReport = () => {
    if (reportId) {
      navigate(`/results/${reportId}`);
    }
  };

  const getScoreColorClasses = () => {
    if (score >= 7) return 'bg-gradient-to-br from-green-500 to-green-600 text-white';
    if (score >= 5) return 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white';
    return 'bg-gradient-to-br from-red-500 to-red-600 text-white';
  };

  const getStatusIcon = () => {
    if (isRunningExperiment) return Clock;
    if (statusColor === 'green') return CheckCircle;
    if (statusColor === 'red') return XCircle;
    return AlertCircle;
  };

  const getStatusClasses = () => {
    if (statusColor === 'green') return 'bg-green-100 text-green-700 border-green-200';
    if (statusColor === 'red') return 'bg-red-100 text-red-700 border-red-200';
    if (isRunningExperiment) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="mobile-activity-item p-3 rounded-xl border border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm w-full">
      <div className="flex items-center space-x-3">
        {/* Score Badge */}
        <div className="flex-shrink-0">
          {isRunningExperiment ? (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20">
              <Clock className="w-4 h-4 text-primary animate-pulse" />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-md ${getScoreColorClasses()}`}>
              {score.toFixed(1)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm truncate mb-1">
            {ideaName}
          </h4>
          <div className="flex items-center gap-2 mb-1">
            <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getStatusClasses()}`}>
              <StatusIcon className="w-3 h-3" />
              <span>{statusText}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timestamp}
          </p>
        </div>

        {/* Action Button */}
        {!isRunningExperiment && reportId && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg hover:bg-primary/10 hover:text-primary w-8 h-8 p-0"
            onClick={handleViewReport}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

interface MobileRecentActivityProps {
  recentActivities: Array<{
    id: string;
    ideaName: string;
    score: number;
    timestamp: string;
    statusText: string;
    statusColor: 'green' | 'yellow' | 'red';
    reportId?: string;
  }>;
}

const MobileRecentActivity: React.FC<MobileRecentActivityProps> = ({ recentActivities }) => {
  return (
    <Card className="mobile-activity-card border-0 shadow-lg w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <MobileActivityItem
              key={activity.id}
              ideaName={activity.ideaName}
              score={activity.score}
              timestamp={activity.timestamp}
              statusText={activity.statusText}
              statusColor={activity.statusColor}
              reportId={activity.reportId}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">No recent activity yet.</p>
            <Button variant="outline" className="apple-button-outline text-sm" asChild>
              <Link to="/dashboard/validate">
                <Lightbulb className="mr-2 h-4 w-4" />
                Validate Your First Idea
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileRecentActivity;
