import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Search, BookOpen, Zap, CheckCircle2, XCircle } from 'lucide-react';

export interface StratixProgressEvent {
  type: string;
  message: string;
  timestamp: Date;
  progress_percentage?: number;
  data?: any;
}

interface StratixProgressIndicatorProps {
  status: string;
  events: StratixProgressEvent[];
  className?: string;
}

const statusSteps = [
  { key: 'thinking', label: 'Searching', icon: Search },
  { key: 'search', label: 'Reading', icon: BookOpen },
  { key: 'synthesis', label: 'Synthesizing', icon: Zap },
  { key: 'verification', label: 'Verifying', icon: CheckCircle2 },
];

const getStepStatus = (stepKey: string, currentStatus: string, events: StratixProgressEvent[]) => {
  if (currentStatus === 'error') return 'error';
  if (currentStatus === 'done') return 'completed';
  
  const stepIndex = statusSteps.findIndex(step => step.key === stepKey);
  const currentIndex = statusSteps.findIndex(step => step.key === currentStatus);
  
  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
};

const StratixProgressIndicator: React.FC<StratixProgressIndicatorProps> = ({
  status,
  events,
  className
}) => {
  const snippetEvents = events.filter(event => event.type === 'snippet' && event.data);
  const currentProgress = events.find(e => e.progress_percentage)?.progress_percentage || 0;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${Math.min(currentProgress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {statusSteps.map((step, index) => {
            const stepStatus = getStepStatus(step.key, status, events);
            const Icon = step.icon;
            
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                    stepStatus === 'completed' && "bg-primary text-primary-foreground",
                    stepStatus === 'active' && "bg-primary/20 text-primary border-2 border-primary",
                    stepStatus === 'pending' && "bg-muted text-muted-foreground",
                    stepStatus === 'error' && "bg-destructive text-destructive-foreground"
                  )}
                >
                  {stepStatus === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : stepStatus === 'error' ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <Icon className={cn(
                      "w-4 h-4",
                      stepStatus === 'active' && "animate-pulse"
                    )} />
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-1 transition-colors duration-300",
                  stepStatus === 'active' && "text-primary font-medium",
                  stepStatus === 'completed' && "text-primary",
                  stepStatus === 'pending' && "text-muted-foreground",
                  stepStatus === 'error' && "text-destructive"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sources Found */}
      {snippetEvents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Sources Found:</h4>
          <div className="flex flex-wrap gap-2">
            {snippetEvents.slice(-5).map((event, index) => {
              const source = event.data?.source || 'Unknown Source';
              const url = event.data?.url || '';
              
              // Extract domain for favicon
              let domain = '';
              let displayUrl = source;
              
              try {
                if (url) {
                  const urlObj = new URL(url);
                  domain = urlObj.hostname;
                  displayUrl = domain.replace('www.', '');
                }
              } catch (e) {
                displayUrl = source.toLowerCase();
              }

              return (
                <div
                  key={`${event.timestamp.getTime()}-${index}`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-xs"
                >
                  {domain && (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                      alt=""
                      className="w-4 h-4 rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-muted-foreground">
                    {displayUrl.length > 20 ? `${displayUrl.substring(0, 17)}...` : displayUrl}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Message */}
      {status !== 'idle' && (
        <div className="text-center">
          <p className={cn(
            "text-sm",
            status === 'error' && "text-destructive",
            status === 'done' && "text-primary font-medium",
            !['error', 'done'].includes(status) && "text-muted-foreground"
          )}>
            {status === 'error' && "Research encountered an issue"}
            {status === 'done' && "Research completed successfully"}
            {status === 'thinking' && "Analyzing your query and planning research..."}
            {status === 'search' && "Searching across industry databases..."}
            {status === 'analysis' && "Processing and analyzing data..."}
            {status === 'synthesis' && "Synthesizing findings and insights..."}
            {status === 'verification' && "Verifying sources and cross-referencing..."}
          </p>
        </div>
      )}
    </div>
  );
};

export default StratixProgressIndicator;