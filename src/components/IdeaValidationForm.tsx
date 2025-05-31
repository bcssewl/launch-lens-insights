import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Form } from '@/components/ui/form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useValidationData } from '@/hooks/useValidationData';
import { Lightbulb, BarChart3 } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get('duplicateId');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { validationData, loading: loadingValidation } = useValidationData(duplicateId);

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

  const { handleSubmit, trigger, control, watch, reset } = form;

  // Populate form with duplicated data
  useEffect(() => {
    if (validationData && validationData.form_data) {
      const formData = validationData.form_data;
      reset({
        ideaName: formData.ideaName || validationData.idea_name || '',
        oneLineDescription: formData.oneLineDescription || validationData.one_line_description || '',
        problemStatement: formData.problemStatement || validationData.problem_statement || '',
        solutionDescription: formData.solutionDescription || validationData.solution_description || '',
        targetCustomer: formData.targetCustomer || undefined,
        customerSegment: formData.customerSegment || '',
        geographicFocus: formData.geographicFocus || [],
        revenueModel: formData.revenueModel || undefined,
        expectedPricing: formData.expectedPricing || 50,
        knownCompetitors: formData.knownCompetitors || '',
        primaryGoal: formData.primaryGoal || undefined,
        timeline: formData.timeline || undefined,
        additionalContext: formData.additionalContext || '',
      });
    }
  }, [validationData, reset]);

  const processForm = async (data: IdeaValidationFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your idea for validation.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert the idea validation data into Supabase
      const { data: submission, error: validationError } = await supabase
        .from('idea_validations')
        .insert({
          user_id: user.id,
          idea_name: data.ideaName,
          one_line_description: data.oneLineDescription,
          problem_statement: data.problemStatement,
          solution_description: data.solutionDescription,
          form_data: data,
          status: 'pending'
        })
        .select()
        .single();

      if (validationError) {
        console.error('Error submitting idea validation:', validationError);
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your idea. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Idea validation submitted successfully:', submission);

      // Create the validation report
      const { data: report, error: reportError } = await supabase
        .from('validation_reports')
        .insert({
          validation_id: submission.id,
          status: 'generating',
          report_data: {
            form_data: data,
            submission_timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (reportError) {
        console.error('Error creating validation report:', reportError);
        toast({
          title: "Report Creation Failed",
          description: "Your idea was submitted but we couldn't start the analysis. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Validation report created successfully:', report);
      
      toast({
        title: duplicateId ? "Duplicated Idea Submitted!" : "Idea Submitted!",
        description: "Your idea is now being analyzed. Please wait...",
      });

      // Navigate to analyzing page with report ID
      navigate('/analyzing', { state: { reportId: report.id, validationId: submission.id } });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an unexpected error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      form.handleSubmit(processForm)();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1);
    }
  };
  
  const progressValue = ((currentStep + 1) / steps.length) * 100;

  if (loadingValidation) {
    return (
      <Card className="w-full max-w-2xl mx-auto premium-card">
        <CardContent className="p-6">
          <div className="text-center">Loading validation data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto premium-card">
      <CardHeader className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <Lightbulb className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div>
          <CardTitle className="text-3xl font-bold heading-gradient mb-2">
            {duplicateId ? 'Edit & Resubmit Idea' : 'Validate Your Startup Idea'}
          </CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            {duplicateId ? 'Modify your idea and resubmit for analysis' : 'Get AI-powered insights in minutes'}
          </CardDescription>
        </div>
        
        <div className="space-y-4">
          <div className="progress-bar h-3">
            <div 
              className="progress-fill animate-slide-in"
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}
            </span>
            <div className="flex items-center gap-2">
              <div className="stepper-dot"></div>
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(processForm)} className="space-y-8">
            {currentStep === 0 && <Step1BasicInfo form={form} />}
            {currentStep === 1 && <Step2MarketDetails form={form} geographicFocusOptions={geographicFocusOptions} targetCustomerOptions={targetCustomerOptions} />}
            {currentStep === 2 && <Step3BusinessModel form={form} revenueModelOptions={revenueModelOptions}/>}
            {currentStep === 3 && <Step4ValidationGoals form={form} primaryGoalOptions={primaryGoalOptions} timelineOptions={timelineOptions}/>}
            
            <div className="flex justify-between pt-8">
              {currentStep > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep} 
                  disabled={isSubmitting}
                  className="premium-card hover-lift"
                >
                  Back
                </Button>
              )}
              {currentStep === 0 && <div className="flex-grow"></div>} 
              
              {currentStep < steps.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={nextStep} 
                  disabled={isSubmitting}
                  className="gradient-button hover-lift"
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="gradient-button hover-lift" 
                  disabled={isSubmitting}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Submitting...' : (duplicateId ? '📊 Resubmit Analysis' : '📊 Analyze My Idea')}
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
