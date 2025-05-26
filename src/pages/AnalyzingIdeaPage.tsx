
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, BarChart3, Search, Calculator, Lightbulb, FileText, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; // Assuming you have a Progress component

const analysisStages = [
  { text: "Researching market size...", icon: BarChart3 },
  { text: "Analyzing competition...", icon: Search },
  { text: "Calculating viability score...", icon: Calculator },
  { text: "Generating recommendations...", icon: Lightbulb },
  { text: "Preparing your report...", icon: FileText },
];

const tips = [
  "Did you know? 42% of startups fail due to lack of market need.",
  "We analyze over 50 data points to score your idea.",
  "Our AI considers market size, competition, and feasibility.",
  "A strong problem-solution fit is key to startup success.",
  "Validation helps refine your idea before significant investment."
];

const TOTAL_DURATION = 6000; // 6 seconds
const STAGE_CHANGE_INTERVAL = TOTAL_DURATION / analysisStages.length;
const TIP_CHANGE_INTERVAL = 3000; // Change tip every 3 seconds

const AnalyzingIdeaPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    // Animate progress stages
    const stageInterval = setInterval(() => {
      setCurrentStageIndex(prevIndex => (prevIndex + 1) % analysisStages.length);
    }, STAGE_CHANGE_INTERVAL);

    // Animate progress percentage
    const progressInterval = setInterval(() => {
      setProgressPercentage(prev => {
        const newProgress = prev + (100 / (TOTAL_DURATION / 100)); // Increment to reach 100% in TOTAL_DURATION
        return Math.min(newProgress, 100);
      });
    }, 100);
    
    // Animate tips
    const tipInterval = setInterval(() => {
      setCurrentTipIndex(prevIndex => (prevIndex + 1) % tips.length);
    }, TIP_CHANGE_INTERVAL);

    // Redirect after total duration
    const redirectTimeout = setTimeout(() => {
      navigate('/dashboard/reports');
    }, TOTAL_DURATION);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
      clearInterval(tipInterval);
      clearTimeout(redirectTimeout);
    };
  }, [navigate]);
  
  // Ensure progress reaches 100% just before redirect if intervals are not perfect
  useEffect(() => {
    if (progressPercentage >= 100) {
      const finalRedirectTimeout = setTimeout(() => {
        navigate('/dashboard/reports');
      }, 300); // Short delay to show 100%
      return () => clearTimeout(finalRedirectTimeout);
    }
  }, [progressPercentage, navigate]);


  const CurrentStageIcon = analysisStages[currentStageIndex].icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      <Brain className="absolute inset-0 w-full h-full text-primary/5 opacity-30 animate-pulse " style={{ transform: 'scale(2.5)' }} strokeWidth={0.5}/>
      
      <div className="z-10 flex flex-col items-center text-center max-w-xl">
        <Loader2 className="w-20 h-20 text-primary animate-spin mb-8" />
        
        <h1 className="text-4xl font-bold text-primary mb-4">Analyzing Your Idea...</h1>
        
        <div className="w-full max-w-md mb-6">
          <Progress value={progressPercentage} className="h-3 bg-primary/20" />
          <p className="text-sm text-muted-foreground mt-1">{Math.round(progressPercentage)}% Complete</p>
        </div>

        <div className="flex items-center justify-center space-x-3 text-lg text-muted-foreground mb-8 h-8">
          <CurrentStageIcon className="w-6 h-6 text-primary" />
          <span>{analysisStages[currentStageIndex].text}</span>
        </div>

        <p className="text-sm text-muted-foreground mb-10">
          This usually takes 60-90 seconds. For this demo, it's much faster!
        </p>

        <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-sm text-card-foreground font-semibold">Quick Tip:</p>
            <p className="text-xs text-muted-foreground">{tips[currentTipIndex]}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyzingIdeaPage;
