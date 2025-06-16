
import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface AnalysisTimerProps {
  onComplete?: () => void;
  className?: string;
}

const AnalysisTimer: React.FC<AnalysisTimerProps> = ({ onComplete, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState(390); // 6 minutes 30 seconds = 390 seconds
  const totalTime = 390;

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  // Color based on time remaining
  const getColor = () => {
    if (timeLeft > 240) return '#10b981'; // green
    if (timeLeft > 120) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            stroke="currentColor" 
            strokeWidth="6" 
            fill="transparent" 
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            stroke={getColor()} 
            strokeWidth="6" 
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-in-out"
            style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))' }}
          />
        </svg>
        
        {/* Timer icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Timer className="h-8 w-8 text-primary animate-pulse" />
        </div>
      </div>

      {/* Time display */}
      <div className="text-center space-y-1">
        <div className="text-3xl font-bold font-mono text-foreground">
          {formatTime(timeLeft)}
        </div>
        <p className="text-sm text-muted-foreground">
          Estimated time remaining
        </p>
      </div>
    </div>
  );
};

export default AnalysisTimer;
