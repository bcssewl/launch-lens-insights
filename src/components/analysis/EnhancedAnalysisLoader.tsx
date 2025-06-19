
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Brain } from 'lucide-react';
import AnalysisTimer from './AnalysisTimer';

interface EnhancedAnalysisLoaderProps {
  status: 'generating' | 'completed' | 'failed' | 'archived';
  useAnimation?: boolean;
}

const EnhancedAnalysisLoader: React.FC<EnhancedAnalysisLoaderProps> = ({
  status,
  useAnimation = false
}) => {
  if (status === 'completed') {
    return (
      <Card className="apple-card border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center animate-scale-in">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-r from-success to-success/80 rounded-full opacity-20 animate-ping"></div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">Analysis Complete</h3>
              <p className="text-muted-foreground">Your startup idea has been thoroughly analyzed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="apple-card border-0 shadow-2xl">
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
                      top: `${20 + i * 10}%`,
                      left: `${10 + i * 15}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: `${3 + i * 0.5}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <h2 className="font-semibold tracking-tight text-foreground">Analyzing Your Vision</h2>
              <p className="text-lg text-muted-foreground">
                Analyzing your startup idea across multiple dimensions
              </p>
            </div>
          </div>

          {/* Timer Component */}
          <div className="flex justify-center">
            <AnalysisTimer className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-2xl border border-primary/10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAnalysisLoader;
