import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Search, Brain, CheckCircle, AlertCircle } from 'lucide-react';

interface StratixProgressEvent {
  type: string;
  message: string;
  timestamp: Date;
  data?: any;
}

interface StratixProgressState {
  projectId: string | null;
  status: string;
  events: StratixProgressEvent[];
}

interface StratixProgressIndicatorProps {
  progress: StratixProgressState;
}

const StratixProgressIndicator: React.FC<StratixProgressIndicatorProps> = ({ progress }) => {
  if (!progress.projectId || progress.status === 'idle') {
    return null;
  }

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'thinking':
        return <Brain className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'search':
        return <Search className="h-4 w-4 animate-spin text-orange-500" />;
      case 'snippet':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'synthesis':
        return <Loader2 className="h-4 w-4 animate-spin text-purple-500" />;
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'thinking': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'search': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case 'snippet': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'synthesis': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isActive = ['connecting', 'thinking', 'search', 'synthesis', 'running'].includes(progress.status);
  const latestEvent = progress.events[progress.events.length - 1];

  // Calculate progress percentage based on latest event
  const getProgressPercentage = () => {
    if (!latestEvent?.data) return 0;
    if (typeof latestEvent.data === 'object' && 'progress_percentage' in latestEvent.data) {
      return latestEvent.data.progress_percentage as number;
    }
    // Fallback based on status
    switch (progress.status) {
      case 'thinking': return 15;
      case 'search': return 35;
      case 'synthesis': return 75;
      case 'done': return 100;
      default: return 0;
    }
  };

  const progressPercent = getProgressPercentage();

  if (progress.status === 'complete') {
    return null; // Hide when complete
  }

  return (
    <Card className="mb-4 border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(progress.status)}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Stratix Research</span>
              <Badge variant="secondary" className={getStatusColor(progress.status)}>
                {progress.status}
              </Badge>
              {progressPercent > 0 && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {progressPercent}%
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {latestEvent?.message || 'Processing your research request...'}
            </p>
            {progressPercent > 0 && (
              <Progress value={progressPercent} className="h-2" />
            )}
          </div>
          {isActive && (
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
        </div>
        
        {progress.events.length > 1 && (
          <div className="mt-3 space-y-1">
            <div className="text-xs font-medium text-muted-foreground mb-1">Recent Activity:</div>
            {progress.events.slice(-3).map((event, index) => (
              <div key={`${event.timestamp.getTime()}-${index}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                {getStatusIcon(event.type)}
                <span className="flex-1">{event.message}</span>
                <span className="text-xs opacity-60">
                  {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StratixProgressIndicator;