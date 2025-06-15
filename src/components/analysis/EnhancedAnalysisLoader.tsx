
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Brain, TrendingUp, Users, DollarSign, Target, Zap } from 'lucide-react';

interface EnhancedAnalysisLoaderProps {
  status: 'generating' | 'completed' | 'failed' | 'archived';
  useAnimation?: boolean;
}

interface AnalysisStage {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
  color: string;
}

const analysisStages: AnalysisStage[] = [
  {
    id: 'market-research',
    title: 'Market Research',
    description: 'Analyzing market size and opportunities',
    icon: <TrendingUp className="h-6 w-6" />,
    duration: 25,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'competition',
    title: 'Competition Analysis',
    description: 'Identifying key competitors and positioning',
    icon: <Users className="h-6 w-6" />,
    duration: 20,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'financial',
    title: 'Financial Modeling',
    description: 'Calculating financial projections and metrics',
    icon: <DollarSign className="h-6 w-6" />,
    duration: 20,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'swot',
    title: 'SWOT Analysis',
    description: 'Evaluating strengths, weaknesses, opportunities',
    icon: <Target className="h-6 w-6" />,
    duration: 20,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'scoring',
    title: 'Final Scoring',
    description: 'Generating comprehensive viability score',
    icon: <Zap className="h-6 w-6" />,
    duration: 15,
    color: 'from-violet-500 to-purple-500'
  }
];

const EnhancedAnalysisLoader: React.FC<EnhancedAnalysisLoaderProps> = ({ 
  status, 
  useAnimation = false 
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(10);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);

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

    // Stage timing based on duration percentages
    let cumulativeDuration = 0;
    const stageTimings = analysisStages.map(stage => {
      const start = cumulativeDuration;
      cumulativeDuration += stage.duration;
      return { start, end: cumulativeDuration, stage };
    });

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / totalDuration, 1);
      
      // Smooth easing function for more realistic progress
      const easeOutQuart = 1 - Math.pow(1 - progressRatio, 4);
      const newProgress = startProgress + (progressRange * easeOutQuart);
      
      setAnimatedProgress(Math.round(newProgress));

      // Update current stage based on progress
      const currentProgressPercent = progressRatio * 100;
      const currentStage = stageTimings.find(
        timing => currentProgressPercent >= timing.start && currentProgressPercent < timing.end
      );

      if (currentStage) {
        const stageIndex = stageTimings.indexOf(currentStage);
        const stageProgressPercent = 
          (currentProgressPercent - currentStage.start) / 
          (currentStage.end - currentStage.start) * 100;
        
        setCurrentStageIndex(stageIndex);
        setStageProgress(Math.min(stageProgressPercent, 100));
      }

      if (progressRatio < 1) {
        requestAnimationFrame(animateProgress);
      }
    };

    animateProgress();
  }, [status, useAnimation]);

  if (status === 'completed') {
    return (
      <Card className="apple-card border-0 bg-white/95 backdrop-blur-xl">
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
      </Card>
    );
  }

  const currentStage = analysisStages[currentStageIndex];

  return (
    <Card className="apple-card border-0 bg-white/95 backdrop-blur-xl shadow-2xl">
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
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 bg-primary/30 rounded-full animate-float floating-element`}
                    style={{
                      top: `${20 + (i * 10)}%`,
                      left: `${10 + (i * 15)}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: `${3 + (i * 0.5)}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
                AI Analysis in Progress
              </h2>
              <p className="text-lg text-gray-600">
                Analyzing your startup idea across multiple dimensions
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {useAnimation ? animatedProgress : 60}%
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={useAnimation ? animatedProgress : 60} 
                className="h-2 bg-gray-100"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-20 rounded-full animate-pulse h-2"></div>
            </div>
          </div>

          {/* Current Stage */}
          <div className="apple-card bg-gradient-to-r from-gray-50/50 to-white/50 p-6 rounded-2xl border border-gray-100/50">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentStage.color} flex items-center justify-center text-white shadow-lg`}>
                {currentStage.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{currentStage.title}</h3>
                <p className="text-gray-600 text-sm">{currentStage.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(stageProgress)}%
                </div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={stageProgress} 
                className={`h-1.5 bg-gray-200`}
              />
            </div>
          </div>

          {/* Analysis Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {analysisStages.map((stage, index) => {
              const isActive = index === currentStageIndex;
              const isCompleted = index < currentStageIndex;
              
              return (
                <div
                  key={stage.id}
                  className={`relative p-4 rounded-xl border transition-all duration-500 ${
                    isActive 
                      ? 'bg-white shadow-lg border-primary/20 scale-105' 
                      : isCompleted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                    isActive 
                      ? `bg-gradient-to-r ${stage.color} text-white shadow-md` 
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      React.cloneElement(stage.icon as React.ReactElement, { className: "h-4 w-4" })
                    )}
                  </div>
                  <h4 className={`font-medium text-sm mb-1 ${
                    isActive ? 'text-gray-900' : isCompleted ? 'text-green-900' : 'text-gray-500'
                  }`}>
                    {stage.title}
                  </h4>
                  <p className={`text-xs ${
                    isActive ? 'text-gray-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {stage.description}
                  </p>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time Estimate */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              This usually takes 2-5 minutes • Please keep this tab open
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAnalysisLoader;
