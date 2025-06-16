import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useValidationData } from '@/hooks/useValidationData';
import { useAudioRecordings } from '@/hooks/useAudioRecordings';
import { toast } from '@/hooks/use-toast';

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
  // Optional audio recording ID
  audioRecordingId: z.string().optional(),
});

export type IdeaValidationFormData = z.infer<typeof ideaValidationSchema>;

export const useIdeaValidationForm = () => {
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get('duplicateId');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateAudioRecording } = useAudioRecordings();
  
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

  const { handleSubmit, trigger, reset } = form;

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

      // Trigger the webhook for validation queue right after form submission
      try {
        console.log('Triggering validation queue webhook...');
        const webhookResponse = await fetch('https://n8n-launchlens.botica.it.com/webhook/start-validation-queue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            validation_id: submission.id,
            user_id: user.id,
            form_data: data,
            submission_timestamp: new Date().toISOString()
          }),
        });

        if (!webhookResponse.ok) {
          console.error('Webhook failed with status:', webhookResponse.status);
          const errorText = await webhookResponse.text();
          console.error('Webhook error response:', errorText);
        } else {
          console.log('Validation queue webhook triggered successfully');
        }
      } catch (webhookError) {
        console.error('Error triggering validation queue webhook:', webhookError);
        // Don't fail the submission if webhook fails, just log the error
      }

      // If there's an audio recording, link it to this validation
      if (data.audioRecordingId) {
        const audioUpdateSuccess = await updateAudioRecording(data.audioRecordingId, {
          validation_id: submission.id,
          processing_status: 'linked_to_validation'
        });
        
        if (audioUpdateSuccess) {
          console.log('Audio recording linked to validation:', data.audioRecordingId);
        }
      }

      // Create the validation report
      const { data: report, error: reportError } = await supabase
        .from('validation_reports')
        .insert({
          validation_id: submission.id,
          status: 'generating',
          report_data: {
            form_data: data,
            submission_timestamp: new Date().toISOString(),
            audio_recording_id: data.audioRecordingId || null
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
    }
  };

  return {
    form,
    duplicateId,
    loadingValidation,
    validationData,
    handleSubmit,
    trigger,
    processForm
  };
};
