
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface SimpleReportProgressProps {
  status: 'generating' | 'completed' | 'failed' | 'archived';
}

const SimpleReportProgress: React.FC<SimpleReportProgressProps> = ({ status }) => {
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
          progress: 60,
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
          <Progress value={statusInfo.progress} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleReportProgress;
