
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Form } from '@/components/ui/form';
import { useNavigate } from 'react-router-dom';

import Step1BasicInfo from './form-steps/Step1BasicInfo';
import Step2MarketDetails from './form-steps/Step2MarketDetails';
import Step3BusinessModel from './form-steps/Step3BusinessModel';
import Step4ValidationGoals from './form-steps/Step4ValidationGoals';

import {
  geographicFocusOptions,
  targetCustomerOptions,
  revenueModelOptions,
  primaryGoalOptions,
  timelineOptions
} from '@/lib/validation-constants';

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
  expectedPricing: z.coerce.number().min(1, "Pricing must be at least $1").max(1000, "Pricing must be $1000 or less"),
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
  const navigate = useNavigate();

  const form = useForm<IdeaValidationFormData>({
    resolver: zodResolver(ideaValidationSchema),
    mode: 'onChange',
    defaultValues: {
      ideaName: '',
      oneLineDescription: '',
      problemStatement: '',
      solutionDescription: '',
      customerSegment: '',
      geographicFocus: [],
      expectedPricing: 50,
      knownCompetitors: '',
      additionalContext: '',
    },
  });

  const { handleSubmit, trigger, control, watch } = form;

  const processForm = (data: IdeaValidationFormData) => {
    console.log('Form Data:', data);
    // Store data in localStorage or send to an API
    // For now, just navigate
    toast({
      title: "Idea Submitted!",
      description: "Your idea is now being analyzed. Please wait...",
    });
    navigate('/analyzing'); // Navigate to the new analyzing page
  };

  const nextStep = async () => {
    const currentFields = steps[currentStep].fields as (keyof IdeaValidationFormData)[];
    // Trigger validation for current step fields
    const output = await form.trigger(currentFields, { shouldFocus: true });
    
    console.log("Validation output for step", currentStep, output);
    console.log("Errors:", form.formState.errors);

    if (!output) {
      // If validation fails, find the first field with an error and focus it
      const firstErrorField = currentFields.find(field => form.formState.errors[field]);
      if (firstErrorField) {
         form.setFocus(firstErrorField);
      }
      return; // Don't proceed to next step
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(step => step + 1);
    } else {
      // Last step, submit form
      form.handleSubmit(processForm)();
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(processForm)} className="space-y-6">
            {currentStep === 0 && <Step1BasicInfo form={form} />}
            {currentStep === 1 && <Step2MarketDetails form={form} geographicFocusOptions={geographicFocusOptions} targetCustomerOptions={targetCustomerOptions} />}
            {currentStep === 2 && <Step3BusinessModel form={form} revenueModelOptions={revenueModelOptions}/>}
            {currentStep === 3 && <Step4ValidationGoals form={form} primaryGoalOptions={primaryGoalOptions} timelineOptions={timelineOptions}/>}
            
            <div className="flex justify-between pt-6">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
              )}
              {/* This div ensures the "Continue" or "Analyze" button is pushed to the right when "Back" is not visible */}
              {currentStep === 0 && <div className="flex-grow"></div>} 
              
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" className="gradient-button"> {/* Ensure this button also triggers form submission if nextStep logic is bypassed on last step */}
                  Analyze My Idea
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default IdeaValidationForm;
