
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

import Step1BasicInfo from './form-steps/Step1BasicInfo';
import Step2MarketDetails from './form-steps/Step2MarketDetails';
import Step3BusinessModel from './form-steps/Step3BusinessModel';
import Step4ValidationGoals from './form-steps/Step4ValidationGoals';

const geographicFocusOptions = ["United States", "Europe", "Asia", "Global", "Other"] as const;
const targetCustomerOptions = ["B2B", "B2C", "Marketplace", "Platform"] as const;
const revenueModelOptions = ["Subscription", "One-time Purchase", "Commission", "Advertising", "Freemium"] as const;
const primaryGoalOptions = ["Validate Market Demand", "Understand Competition", "Market Sizing", "All of the Above"] as const;
const timelineOptions = ["Building this month", "In 3 months", "In 6+ months", "Just exploring"] as const;


const ideaValidationSchema = z.object({
  // Step 1
  ideaName: z.string().min(3, "Idea name must be at least 3 characters").max(100, "Idea name must be 100 characters or less"),
  oneLineDescription: z.string().min(10, "Description must be at least 10 characters").max(150, "Description must be 150 characters or less"),
  problemStatement: z.string().min(20, "Problem statement must be at least 20 characters").max(500, "Problem statement must be 500 characters or less"),
  solutionDescription: z.string().min(20, "Solution description must be at least 20 characters").max(500, "Solution description must be 500 characters or less"),
  // Step 2
  targetCustomer: z.enum(targetCustomerOptions, { required_error: "Target customer is required" }),
  customerSegment: z.string().min(3, "Customer segment must be at least 3 characters").max(100, "Segment must be 100 characters or less"),
  geographicFocus: z.array(z.enum(geographicFocusOptions)).min(1, "Select at least one geographic focus"),
  // Step 3
  revenueModel: z.enum(revenueModelOptions, { required_error: "Revenue model is required" }),
  expectedPricing: z.number().min(1, "Pricing must be at least $1").max(1000, "Pricing must be $1000 or less"),
  knownCompetitors: z.string().max(500, "Competitors list must be 500 characters or less").optional(),
  // Step 4
  primaryGoal: z.enum(primaryGoalOptions, { required_error: "Primary goal is required" }),
  timeline: z.enum(timelineOptions, { required_error: "Timeline is required" }),
  additionalContext: z.string().max(1000, "Additional context must be 1000 characters or less").optional(),
});

export type IdeaValidationFormData = z.infer<typeof ideaValidationSchema>;

const steps = [
  { id: 'Step 1', name: 'Basic Information', fields: ['ideaName', 'oneLineDescription', 'problemStatement', 'solutionDescription'] },
  { id: 'Step 2', name: 'Market Details', fields: ['targetCustomer', 'customerSegment', 'geographicFocus'] },
  { id: 'Step 3', name: 'Business Model', fields: ['revenueModel', 'expectedPricing', 'knownCompetitors'] },
  { id: 'Step 4', name: 'Validation Goals', fields: ['primaryGoal', 'timeline', 'additionalContext'] },
];

const IdeaValidationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<IdeaValidationFormData>({
    resolver: zodResolver(ideaValidationSchema),
    mode: 'onChange', // Validate on change for better UX
    defaultValues: {
      ideaName: '',
      oneLineDescription: '',
      problemStatement: '',
      solutionDescription: '',
      customerSegment: '',
      geographicFocus: [],
      expectedPricing: 50, // Default pricing
      knownCompetitors: '',
      additionalContext: '',
    },
  });

  const { handleSubmit, trigger, control, watch } = form;

  const processForm = (data: IdeaValidationFormData) => {
    console.log('Form Data:', data);
    toast({
      title: "Idea Submitted!",
      description: "Your idea has been submitted for validation. We'll process it shortly.",
    });
    // Here you would typically send data to a backend
    // For now, just reset and go to first step
    form.reset();
    setCurrentStep(0);
  };

  const nextStep = async () => {
    const currentFields = steps[currentStep].fields as (keyof IdeaValidationFormData)[];
    const output = await trigger(currentFields);
    if (!output) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(step => step + 1);
    } else {
      handleSubmit(processForm)();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1);
    }
  };

  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Validate Your Startup Idea</CardTitle>
        <CardDescription className="text-md text-muted-foreground">Get AI-powered insights in minutes</CardDescription>
        <div className="mt-4">
          <Progress value={progressValue} className="w-full h-2" />
          <p className="text-sm text-muted-foreground mt-1">Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(processForm)} className="space-y-6">
          {currentStep === 0 && <Step1BasicInfo form={form} />}
          {currentStep === 1 && <Step2MarketDetails form={form} geographicFocusOptions={geographicFocusOptions} targetCustomerOptions={targetCustomerOptions} />}
          {currentStep === 2 && <Step3BusinessModel form={form} revenueModelOptions={revenueModelOptions}/>}
          {currentStep === 3 && <Step4ValidationGoals form={form} primaryGoalOptions={primaryGoalOptions} timelineOptions={timelineOptions}/>}

          <div className="flex justify-between pt-4">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            )}
            <div className="flex-grow"></div> {/* Spacer */}
            {currentStep < steps.length - 1 && (
              <Button type="button" onClick={nextStep}>
                Continue
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="submit" className="gradient-button">
                Analyze My Idea
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IdeaValidationForm;

