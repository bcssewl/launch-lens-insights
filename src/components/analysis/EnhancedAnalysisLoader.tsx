import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Brain } from 'lucide-react';
interface EnhancedAnalysisLoaderProps {
  status: 'generating' | 'completed' | 'failed' | 'archived';
  useAnimation?: boolean;
}
const EnhancedAnalysisLoader: React.FC<EnhancedAnalysisLoaderProps> = ({
  status,
  useAnimation = false
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(10);
  useEffect(() => {
    if (!useAnimation || status !== 'generating') {
      return;
    }

    // 4 minute animation (240 seconds) from 10% to 95%
    const totalDuration = 240000; // 4 minutes in milliseconds
    const startProgress = 10;
    const endProgress = 95;
    const progressRange = endProgress - startProgress;
    const startTime = Date.now();
    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / totalDuration, 1);

      // Smooth easing function for more realistic progress
      const easeOutQuart = 1 - Math.pow(1 - progressRatio, 4);
      const newProgress = startProgress + progressRange * easeOutQuart;
      setAnimatedProgress(Math.round(newProgress));
      if (progressRatio < 1) {
        requestAnimationFrame(animateProgress);
      }
    };
    animateProgress();
  }, [status, useAnimation]);
  if (status === 'completed') {
    return <Card className="apple-card border-0 bg-white/95 backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-scale-in">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-20 animate-ping"></div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Analysis Complete</h3>
              <p className="text-gray-600">Your startup idea has been thoroughly analyzed</p>
            </div>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card className="apple-card border-0 bg-white/95 backdrop-blur-xl shadow-2xl">
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Central AI Brain Icon */}
          <div className="text-center">
            <div className="relative">
              <div className="w-32 h-32 mx-auto bg-gradient-to-r from-primary via-accent to-primary rounded-full flex items-center justify-center animate-pulse recording-sphere">
                <Brain className="h-16 w-16 text-white animate-pulse" />
              </div>
              
              {/* Floating particles around the brain */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => <div key={i} className={`absolute w-2 h-2 bg-primary/30 rounded-full animate-float floating-element`} style={{
                top: `${20 + i * 10}%`,
                left: `${10 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}></div>)}
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <h2 className="font-semibold tracking-tight text-[launchlens-background-light] text-zinc-600">Analyzing Your Vision</h2>
              <p className="text-lg text-gray-600">
                Analyzing your startup idea across multiple dimensions
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Analysis Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {useAnimation ? animatedProgress : 60}%
              </span>
            </div>
            <div className="relative">
              <Progress value={useAnimation ? animatedProgress : 60} className="h-3 bg-gray-100" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-20 rounded-full animate-pulse h-3"></div>
            </div>
          </div>

          {/* Time Estimate */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              This usually takes 2-4 minutes • Please keep this tab open
            </p>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default EnhancedAnalysisLoader;