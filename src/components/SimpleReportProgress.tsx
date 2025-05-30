
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface SimpleReportProgressProps {
  status: 'generating' | 'completed' | 'failed' | 'archived';
  useAnimation?: boolean;
}

const SimpleReportProgress: React.FC<SimpleReportProgressProps> = ({ status, useAnimation = false }) => {
  const [animatedProgress, setAnimatedProgress] = useState(10);

  useEffect(() => {
    if (!useAnimation || status !== 'generating') {
      return;
    }

    // 6 minute animation (360 seconds) from 10% to 95%
    const totalDuration = 360000; // 6 minutes in milliseconds
    const startProgress = 10;
    const endProgress = 95;
    const progressRange = endProgress - startProgress;
    const startTime = Date.now();

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / totalDuration, 1);
      
      // Smooth easing function for more realistic progress
      const easeOutQuart = 1 - Math.pow(1 - progressRatio, 4);
      const newProgress = startProgress + (progressRange * easeOutQuart);
      
      setAnimatedProgress(Math.round(newProgress));

      if (progressRatio < 1) {
        requestAnimationFrame(animateProgress);
      }
    };

    animateProgress();
  }, [status, useAnimation]);

  const getStatusInfo = () => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          text: 'Analysis Complete',
          progress: 100,
          color: 'text-green-600'
        };
      case 'generating':
        return {
          icon: <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />,
          text: 'Analyzing Your Idea',
          progress: useAnimation ? animatedProgress : 60,
          color: 'text-blue-600'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-6 w-6 text-red-500" />,
          text: 'Analysis Failed',
          progress: 0,
          color: 'text-red-600'
        };
      default:
        return {
          icon: <Clock className="h-6 w-6 text-gray-400" />,
          text: 'Queued',
          progress: 10,
          color: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Analysis Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {statusInfo.icon}
            <div>
              <p className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</p>
              <p className="text-sm text-muted-foreground">
                {status === 'generating' && 'This usually takes 2-5 minutes'}
                {status === 'completed' && 'Your report is ready to view'}
                {status === 'failed' && 'Something went wrong during analysis'}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={statusInfo.progress} className="w-full" />
            {useAnimation && status === 'generating' && (
              <p className="text-xs text-muted-foreground text-center">
                {statusInfo.progress}% complete
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleReportProgress;
