
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { IdeaValidationFormData, useIdeaValidationForm } from '@/hooks/useIdeaValidationForm';

import Step1BasicInfo from '../form-steps/Step1BasicInfo';
import Step2MarketDetails from '../form-steps/Step2MarketDetails';
import Step3BusinessModel from '../form-steps/Step3BusinessModel';
import Step4ValidationGoals from '../form-steps/Step4ValidationGoals';

import {
  geographicFocusOptions,
  targetCustomerOptions,
  revenueModelOptions,
  primaryGoalOptions,
  timelineOptions
} from '@/lib/validation-constants';

const steps = [
  { id: 'Step 1', name: 'Basic Information', fields: ['ideaName', 'oneLineDescription', 'problemStatement', 'solutionDescription'] },
  { id: 'Step 2', name: 'Market Details', fields: ['targetCustomer', 'customerSegment', 'geographicFocus'] },
  { id: 'Step 3', name: 'Business Model', fields: ['revenueModel', 'expectedPricing', 'knownCompetitors'] },
  { id: 'Step 4', name: 'Validation Goals', fields: ['primaryGoal', 'timeline', 'additionalContext'] },
];

interface IdeaValidationFormStepsProps {
  onFormComplete: (data: IdeaValidationFormData) => void;
  isSubmitting: boolean;
  duplicateId: string | null;
  extractedData: Partial<IdeaValidationFormData>;
  inputMethod: 'form' | 'voice' | 'pitch_deck';
  onBackToMethodSelection: () => void;
}

const IdeaValidationFormSteps: React.FC<IdeaValidationFormStepsProps> = ({
  onFormComplete,
  isSubmitting,
  duplicateId,
  extractedData,
  inputMethod,
  onBackToMethodSelection
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { form } = useIdeaValidationForm();

  // Pre-populate form with extracted data
  useEffect(() => {
    if (Object.keys(extractedData).length > 0) {
      form.reset({
        ...form.getValues(),
        ...extractedData,
        geographicFocus: extractedData.geographicFocus || ['United States'],
      });
    }
  }, [extractedData, form]);

  const nextStep = async () => {
    const currentFields = steps[currentStep].fields as (keyof IdeaValidationFormData)[];
    const output = await form.trigger(currentFields, { shouldFocus: true });
    
    console.log("Validation output for step", currentStep, output);
    console.log("Errors:", form.formState.errors);

    if (!output) {
      const firstErrorField = currentFields.find(field => form.formState.errors[field]);
      if (firstErrorField) {
         form.setFocus(firstErrorField);
      }
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(step => step + 1);
    } else {
      form.handleSubmit(onFormComplete)();
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
        <CardTitle className="text-3xl font-bold text-primary">
          {duplicateId ? 'Edit & Resubmit Idea' : 'Validate Your Startup Idea'}
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground">
          {duplicateId ? 'Modify your idea and resubmit for analysis' : 'Get AI-powered insights in minutes'}
        </CardDescription>
        <div className="mt-4">
          <Progress value={progressValue} className="w-full h-2" />
          <p className="text-sm text-muted-foreground mt-1">Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}</p>
        </div>
        {inputMethod !== 'form' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBackToMethodSelection}
            className="mt-2"
          >
            Change Input Method
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormComplete)} className="space-y-6">
            {currentStep === 0 && <Step1BasicInfo form={form} />}
            {currentStep === 1 && <Step2MarketDetails form={form} geographicFocusOptions={geographicFocusOptions} targetCustomerOptions={targetCustomerOptions} />}
            {currentStep === 2 && <Step3BusinessModel form={form} revenueModelOptions={revenueModelOptions}/>}
            {currentStep === 3 && <Step4ValidationGoals form={form} primaryGoalOptions={primaryGoalOptions} timelineOptions={timelineOptions}/>}
            
            <div className="flex justify-between pt-6">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={prevStep} disabled={isSubmitting}>
                  Back
                </Button>
              )}
              {currentStep === 0 && <div className="flex-grow"></div>} 
              
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" className="gradient-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : (duplicateId ? 'Resubmit Analysis' : 'Analyze My Idea')}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default IdeaValidationFormSteps;
