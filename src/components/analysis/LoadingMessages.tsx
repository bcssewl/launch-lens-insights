
import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, Target, Zap, Brain, Rocket } from 'lucide-react';

const loadingMessages = [
  {
    icon: Brain,
    message: "Our AI is diving deep into market research data...",
    submessage: "Analyzing 10,000+ data points from industry reports"
  },
  {
    icon: TrendingUp,
    message: "Crunching competitor intelligence...",
    submessage: "Mapping your competitive landscape in real-time"
  },
  {
    icon: Target,
    message: "Identifying your ideal customers...",
    submessage: "Cross-referencing demographic and behavioral patterns"
  },
  {
    icon: Lightbulb,
    message: "Evaluating innovation potential...",
    submessage: "Comparing against 50,000+ successful startups"
  },
  {
    icon: Zap,
    message: "Calculating market opportunity size...",
    submessage: "Running TAM, SAM, SOM financial projections"
  },
  {
    icon: Rocket,
    message: "Assessing scalability factors...",
    submessage: "Modeling growth trajectories and expansion paths"
  },
  {
    icon: Brain,
    message: "Running SWOT analysis algorithms...",
    submessage: "Identifying strengths, weaknesses, and opportunities"
  },
  {
    icon: TrendingUp,
    message: "Benchmarking against industry leaders...",
    submessage: "Comparing metrics with top performers in your sector"
  },
  {
    icon: Target,
    message: "Analyzing customer pain points...",
    submessage: "Processing feedback from 100,000+ user surveys"
  },
  {
    icon: Lightbulb,
    message: "Generating strategic recommendations...",
    submessage: "Synthesizing insights from venture capital trends"
  },
  {
    icon: Zap,
    message: "Validating business model viability...",
    submessage: "Testing against proven monetization strategies"
  },
  {
    icon: Rocket,
    message: "Finalizing your comprehensive report...",
    submessage: "Compiling actionable insights and next steps"
  }
];

interface LoadingMessagesProps {
  className?: string;
}

const LoadingMessages: React.FC<LoadingMessagesProps> = ({ className = '' }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState('opacity-100');

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeClass('opacity-0');
      
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        setFadeClass('opacity-100');
      }, 300);
    }, 4000); // Change message every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const currentMessage = loadingMessages[currentMessageIndex];
  const IconComponent = currentMessage.icon;

  return (
    <div className={`text-center space-y-4 ${className}`}>
      <div className={`transition-opacity duration-300 ${fadeClass}`}>
        <div className="flex items-center justify-center mb-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center animate-pulse">
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div className="absolute inset-0 w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full opacity-20 animate-ping"></div>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {currentMessage.message}
        </h3>
        
        <p className="text-sm text-muted-foreground">
          {currentMessage.submessage}
        </p>
      </div>
      
      {/* Progress dots */}
      <div className="flex justify-center space-x-2 mt-6">
        {loadingMessages.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentMessageIndex 
                ? 'bg-primary scale-125' 
                : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingMessages;
