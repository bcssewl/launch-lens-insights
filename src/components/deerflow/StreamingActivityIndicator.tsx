/**
 * @file StreamingActivityIndicator.tsx
 * @description Real-time activity indicators for live streaming updates
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  Globe, 
  Code, 
  FileText, 
  Brain, 
  Loader2,
  Activity,
  Zap
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'search' | 'visit' | 'tool' | 'thinking' | 'reasoning';
  content: string;
  timestamp: Date;
  status: 'active' | 'completed' | 'error';
}

interface StreamingActivityIndicatorProps {
  activities: ActivityItem[];
  isStreaming?: boolean;
  currentActivity?: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'search': return Search;
    case 'visit': return Globe;
    case 'tool': return Code;
    case 'thinking': return Brain;
    case 'reasoning': return FileText;
    default: return Activity;
  }
};

const getActivityColor = (type: string, status: string) => {
  if (status === 'error') return 'text-red-500';
  if (status === 'completed') return 'text-green-500';
  
  switch (type) {
    case 'search': return 'text-blue-500';
    case 'visit': return 'text-purple-500';
    case 'tool': return 'text-orange-500';
    case 'thinking': return 'text-indigo-500';
    case 'reasoning': return 'text-teal-500';
    default: return 'text-gray-500';
  }
};

const TypingAnimation = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text]);

  return (
    <span className="text-sm text-foreground">
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
};

export const StreamingActivityIndicator: React.FC<StreamingActivityIndicatorProps> = ({
  activities,
  isStreaming = false,
  currentActivity
}) => {
  const recentActivities = activities.slice(-5); // Show last 5 activities
  const activeCount = activities.filter(a => a.status === 'active').length;

  if (activities.length === 0 && !isStreaming) {
    return null;
  }

  return (
    <Card className="p-3 bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-l-primary">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Live Activity</span>
            {activeCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                {activeCount} active
              </Badge>
            )}
          </div>
          {isStreaming && (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Streaming</span>
            </div>
          )}
        </div>

        {/* Current Activity */}
        {currentActivity && isStreaming && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-2 bg-primary/10 rounded border border-primary/20"
          >
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 text-primary animate-spin" />
              <TypingAnimation text={currentActivity} />
            </div>
          </motion.div>
        )}

        {/* Recent Activities */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {recentActivities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type, activity.status);
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="relative">
                    <IconComponent className={`h-3 w-3 ${colorClass}`} />
                    {activity.status === 'active' && (
                      <div className="absolute inset-0 rounded-full border border-current animate-ping opacity-50" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium capitalize text-foreground">
                        {activity.type}
                      </span>
                      <Badge 
                        variant={activity.status === 'completed' ? 'default' : 
                                activity.status === 'error' ? 'destructive' : 'secondary'}
                        className="text-xs h-4"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.content}
                    </p>
                  </div>
                  
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Streaming Indicator */}
        {isStreaming && (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1 w-1 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Processing...</span>
          </div>
        )}
      </div>
    </Card>
  );
};