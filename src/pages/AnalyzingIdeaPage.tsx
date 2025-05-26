
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, BarChart3, Search, Calculator, Lightbulb, FileText } from 'lucide-react'; // Replaced Document with FileText for consistency
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const stages = [
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
  "Clear problem definition is key to a successful idea.",
  "Understanding your target customer is crucial."
];

const AnalyzingIdeaPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(tips[0]);
  const totalDuration = 6000; // 6 seconds total for loading simulation
  const stageDuration = totalDuration / stages.length;

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage((prevStage) => {
        if (prevStage < stages.length - 1) {
          return prevStage + 1;
        }
        return prevStage;
      });
    }, stageDuration);

    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + (100 / (totalDuration / 100));
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 100);
    
    const tipInterval = setInterval(() => {
      setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 3000);


    const timer = setTimeout(() => {
      navigate('/results'); // Navigate to the new results page
    }, totalDuration);

    return () => {
      clearTimeout(timer);
      clearInterval(stageInterval);
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [navigate, stageDuration]);

  const IconComponent = stages[currentStage].icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4 selection:bg-primary/20">
      {/* Background Animation - Placeholder for complex visuals */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-pulse opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full filter blur-3xl animate-pulse animation-delay-2000 opacity-50"></div>
      </div>
      
      <Card className="w-full max-w-lg text-center shadow-2xl z-10 glassmorphism-card">
        <CardHeader>
          <div className="mx-auto mb-6">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">Analyzing Your Idea...</CardTitle>
          <CardDescription className="text-muted-foreground">
            Please wait while we process your startup concept.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center space-x-3 text-lg text-primary">
            <IconComponent className="w-6 h-6 animate-fade-in" />
            <span className="animate-fade-in">{stages[currentStage].text}</span>
          </div>
          <Progress value={progress} className="w-full h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
          <p className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</p>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground animate-fade-in">
            💡 {currentTip}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center pt-4">
          <p className="text-xs text-muted-foreground">This usually takes 60-90 seconds in a real analysis.</p>
          <p className="text-xs text-muted-foreground">(Demo completes in {totalDuration/1000} seconds)</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AnalyzingIdeaPage;
