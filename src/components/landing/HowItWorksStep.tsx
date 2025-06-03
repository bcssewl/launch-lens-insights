
import React from 'react';

interface HowItWorksStepProps {
  icon: React.ElementType;
  step: number;
  title: string;
  description: string;
}

export const HowItWorksStep = ({ icon: Icon, step, title, description }: HowItWorksStepProps) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="relative mb-4">
      <div className="p-4 rounded-full bg-primary/10 text-primary ring-2 ring-primary/30">
        <Icon className="w-10 h-10" />
      </div>
      <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
        {step}
      </span>
    </div>
    <h3 className="text-lg font-semibold font-heading mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);
