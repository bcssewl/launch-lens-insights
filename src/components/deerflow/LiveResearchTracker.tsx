/**
 * @file LiveResearchTracker.tsx
 * @description Real-time research activity tracking for DeerFlow
 */

import React from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Globe, 
  FileText, 
  Brain,
  Clock,
  CheckCircle,
  ArrowRight,
  Loader2,
  ExternalLink
} from "lucide-react";

interface ResearchPhase {
  phase: string;
  content: string;
  progress?: number;
  timestamp?: Date;
}

interface SearchActivity {
  query: string;
  results?: any[];
  search_type?: 'web' | 'github' | 'academic';
  timestamp?: Date;
}

interface VisitActivity {
  url: string;
  title?: string;
  content?: string;
  status?: 'success' | 'failed';
  timestamp?: Date;
}

interface LiveResearchTrackerProps {
  thinkingPhases?: ResearchPhase[];
  reasoningSteps?: Array<{ step: string; content: string; reasoning_type?: string }>;
  searchActivities?: SearchActivity[];
  visitedUrls?: VisitActivity[];
  researchState?: 'researching' | 'generating_report' | 'report_generated';
  reportProgress?: number;
  isStreaming?: boolean;
  className?: string;
}

export const LiveResearchTracker = ({
  thinkingPhases = [],
  reasoningSteps = [],
  searchActivities = [],
  visitedUrls = [],
  researchState,
  reportProgress = 0,
  isStreaming = false,
  className = ''
}: LiveResearchTrackerProps) => {
  const hasActivity = thinkingPhases.length > 0 || 
                     reasoningSteps.length > 0 || 
                     searchActivities.length > 0 || 
                     visitedUrls.length > 0;

  if (!hasActivity && !researchState) return null;

  const renderThinkingPhases = () => {
    if (thinkingPhases.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Brain className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium">Deep Thinking</span>
          {isStreaming && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-purple-600 rounded-full"
            />
          )}
        </div>
        
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {thinkingPhases.map((phase, index) => (
              <motion.div
                key={`thinking-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg dark:bg-purple-950/20 dark:border-purple-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      {phase.phase}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                      {phase.content}
                    </p>
                  </div>
                  {phase.progress !== undefined && (
                    <Badge variant="outline" className="text-xs ml-2">
                      {Math.round(phase.progress)}%
                    </Badge>
                  )}
                </div>
                {phase.progress !== undefined && (
                  <Progress value={phase.progress} className="mt-2 h-1" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderReasoningSteps = () => {
    if (reasoningSteps.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <ArrowRight className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Reasoning Steps</span>
        </div>
        
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {reasoningSteps.map((step, index) => (
              <motion.div
                key={`reasoning-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-2 bg-blue-50/50 border border-blue-200 rounded dark:bg-blue-950/20 dark:border-blue-800"
              >
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      {step.step}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      {step.content}
                    </p>
                    {step.reasoning_type && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {step.reasoning_type}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderSearchActivities = () => {
    if (searchActivities.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Search Activities</span>
          <Badge variant="outline" className="text-xs">
            {searchActivities.length}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {searchActivities.map((activity, index) => (
              <motion.div
                key={`search-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-2 bg-green-50/50 border border-green-200 rounded dark:bg-green-950/20 dark:border-green-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      "{activity.query}"
                    </p>
                    {activity.results && (
                      <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                        Found {activity.results.length} results
                      </p>
                    )}
                  </div>
                  {activity.search_type && (
                    <Badge variant="outline" className="text-xs">
                      {activity.search_type}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderVisitedUrls = () => {
    if (visitedUrls.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium">Visited URLs</span>
          <Badge variant="outline" className="text-xs">
            {visitedUrls.length}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {visitedUrls.map((visit, index) => (
              <motion.div
                key={`visit-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-2 bg-orange-50/50 border border-orange-200 rounded dark:bg-orange-950/20 dark:border-orange-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200 truncate">
                      {visit.title || 'Untitled Page'}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-300 truncate">
                      {visit.url}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {visit.status === 'success' ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : visit.status === 'failed' ? (
                      <Clock className="h-3 w-3 text-red-500" />
                    ) : (
                      <Loader2 className="h-3 w-3 text-orange-500 animate-spin" />
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <a href={visit.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderReportProgress = () => {
    if (!researchState || researchState === 'researching') return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-medium">Report Generation</span>
          {researchState === 'generating_report' && isStreaming && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-indigo-600 rounded-full"
            />
          )}
        </div>
        
        <Card className="border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                {researchState === 'generating_report' ? 'Writing report...' : 'Report completed'}
              </span>
              <Badge variant="outline" className="text-xs">
                {researchState === 'report_generated' ? '100%' : `${Math.round(reportProgress)}%`}
              </Badge>
            </div>
            
            <Progress 
              value={researchState === 'report_generated' ? 100 : reportProgress} 
              className="h-2" 
            />
            
            {researchState === 'report_generated' && (
              <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-2">
                ✓ Research report is ready in the Report tab
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Live Research Progress</span>
        {isStreaming && (
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        )}
      </div>

      {renderThinkingPhases()}
      {renderReasoningSteps()}
      {renderSearchActivities()}
      {renderVisitedUrls()}
      {renderReportProgress()}
    </div>
  );
};