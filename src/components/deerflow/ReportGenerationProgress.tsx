/**
 * @file ReportGenerationProgress.tsx
 * @description Progress indicator for report generation with streaming updates
 */

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FileText, Loader2, CheckCircle2, Download, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

interface ReportGenerationProgressProps {
  researchState?: 'researching' | 'generating_report' | 'report_generated';
  reportContent?: string;
  citations?: any[];
  isStreaming?: boolean;
  onExport?: (type: 'pdf' | 'copy') => void;
}

const getProgressValue = (state: string) => {
  switch (state) {
    case 'researching': return 25;
    case 'generating_report': return 75;
    case 'report_generated': return 100;
    default: return 0;
  }
};

const getStateInfo = (state: string) => {
  switch (state) {
    case 'researching':
      return { 
        label: 'Researching', 
        color: 'bg-blue-500', 
        icon: Loader2,
        description: 'Gathering information and analyzing sources...'
      };
    case 'generating_report':
      return { 
        label: 'Generating Report', 
        color: 'bg-orange-500', 
        icon: FileText,
        description: 'Synthesizing findings into comprehensive report...'
      };
    case 'report_generated':
      return { 
        label: 'Report Complete', 
        color: 'bg-green-500', 
        icon: CheckCircle2,
        description: 'Report successfully generated with citations'
      };
    default:
      return { 
        label: 'Starting', 
        color: 'bg-gray-500', 
        icon: Loader2,
        description: 'Initializing research process...'
      };
  }
};

export const ReportGenerationProgress: React.FC<ReportGenerationProgressProps> = ({
  researchState = 'researching',
  reportContent,
  citations = [],
  isStreaming = false,
  onExport
}) => {
  const progressValue = getProgressValue(researchState);
  const stateInfo = getStateInfo(researchState);
  const IconComponent = stateInfo.icon;

  const handleCopy = async () => {
    if (reportContent) {
      await navigator.clipboard.writeText(reportContent);
      onExport?.('copy');
    }
  };

  const handlePdfExport = () => {
    onExport?.('pdf');
  };

  return (
    <Card className="p-4 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <IconComponent 
                className={`h-5 w-5 ${researchState === 'report_generated' ? 'text-green-600' : 'text-primary'} ${
                  (researchState === 'researching' || researchState === 'generating_report') && isStreaming ? 'animate-spin' : ''
                }`}
              />
              {isStreaming && researchState !== 'report_generated' && (
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Research Report</h3>
              <p className="text-xs text-muted-foreground">{stateInfo.description}</p>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={`${stateInfo.color} text-white border-0`}
          >
            {stateInfo.label}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progressValue}%</span>
          </div>
          <Progress 
            value={progressValue} 
            className="h-2"
          />
        </div>

        {/* Report Content Preview */}
        {reportContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="bg-background border rounded-lg p-3 max-h-40 overflow-y-auto">
              <div 
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: reportContent.substring(0, 500) + '...' }}
              />
            </div>

            {/* Citations */}
            {citations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Sources ({citations.length})
                </h4>
                <div className="grid gap-1">
                  {citations.slice(0, 3).map((citation: any, index: number) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="font-mono bg-muted px-1 rounded">[{index + 1}]</span>
                      <span className="truncate">{citation.title || citation.url}</span>
                    </div>
                  ))}
                  {citations.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{citations.length - 3} more sources
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Export Actions */}
            {researchState === 'report_generated' && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Text
                </Button>
                <Button size="sm" variant="outline" onClick={handlePdfExport}>
                  <Download className="h-3 w-3 mr-1" />
                  Export PDF
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Live Updates Indicator */}
        {isStreaming && researchState !== 'report_generated' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex gap-1">
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <span>Live updates...</span>
          </div>
        )}
      </div>
    </Card>
  );
};