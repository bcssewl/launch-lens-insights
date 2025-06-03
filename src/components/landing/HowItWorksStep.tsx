
import React from 'react';

interface HowItWorksStepProps {
  icon: React.ElementType;
  step: number;
  title: string;
  description: string;
}

export const HowItWorksStep = ({ icon: Icon, step, title, description }: HowItWorksStepProps) => (
  <div className="flex flex-col items-center text-center relative z-10">
    <div className="relative mb-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
        {step}
      </span>
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
  </div>
);
