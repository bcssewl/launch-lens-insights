
import React, { useState } from 'react';
import { IdeaValidationFormData } from '@/hooks/useIdeaValidationForm';
import { supabase } from '@/integrations/supabase/client';

import InputMethodSelector from '../InputMethodSelector';
import VoiceRecorder from '../VoiceRecorder';
import PitchDeckUploader from '../PitchDeckUploader';
import ExtractedDataReview from '../ExtractedDataReview';
import IdeaValidationFormSteps from './IdeaValidationFormSteps';

type InputMethod = 'form' | 'voice' | 'pitch_deck';
type FormFlow = 'method_selection' | 'voice_recording' | 'pitch_upload' | 'data_review' | 'form_steps';

interface FormFlowManagerProps {
  onFormComplete: (data: IdeaValidationFormData) => void;
  isSubmitting: boolean;
  duplicateId: string | null;
  validationData: any;
}

const FormFlowManager: React.FC<FormFlowManagerProps> = ({
  onFormComplete,
  isSubmitting,
  duplicateId,
  validationData
}) => {
  const [currentFlow, setCurrentFlow] = useState<FormFlow>(
    duplicateId && validationData ? 'form_steps' : 'method_selection'
  );
  const [inputMethod, setInputMethod] = useState<InputMethod>('form');
  const [extractedData, setExtractedData] = useState<Partial<IdeaValidationFormData>>({});
  const [audioRecordingId, setAudioRecordingId] = useState<string | null>(null);

  const handleMethodSelect = (method: InputMethod) => {
    setInputMethod(method);
    if (method === 'form') {
      setCurrentFlow('form_steps');
    } else if (method === 'voice') {
      setCurrentFlow('voice_recording');
    } else if (method === 'pitch_deck') {
      setCurrentFlow('pitch_upload');
    }
  };

  const handleVoiceComplete = async (audioBlob: Blob, recordingId?: string) => {
    console.log('Voice recording completed:', { recordingId, blobSize: audioBlob.size });
    
    if (recordingId) {
      setAudioRecordingId(recordingId);
      
      try {
        // Get the transcription from the audio recording
        const { data: recording, error: recordingError } = await supabase
          .from('audio_recordings')
          .select('transcription_text')
          .eq('id', recordingId)
          .single();
        
        if (recordingError) {
          console.error('Error fetching recording:', recordingError);
          throw recordingError;
        }
        
        if (recording?.transcription_text) {
          console.log('Transcription found, extracting form data...');
          
          // Call n8n webhook to extract form data from transcription
          const { data: extractionResult, error: extractionError } = await supabase.functions.invoke('n8n-webhook', {
            body: {
              message: 'extract_form_data',
              transcription: recording.transcription_text,
              action: 'extract_form_data'
            }
          });
          
          if (extractionError) {
            console.error('Error extracting form data:', extractionError);
            throw extractionError;
          }
          
          console.log('Form extraction result:', extractionResult);
          
          if (extractionResult?.response) {
            // The n8n webhook should return structured form data
            const formData = extractionResult.response;
            
            // Validate and structure the extracted data according to our form schema
            const structuredData: Partial<IdeaValidationFormData> = {
              ideaName: formData.ideaName || formData.idea_name || "Voice-recorded Idea",
              oneLineDescription: formData.oneLineDescription || formData.one_line_description || "An innovative solution extracted from voice recording",
              problemStatement: formData.problemStatement || formData.problem_statement || "Based on your voice recording, we've identified key problem areas",
              solutionDescription: formData.solutionDescription || formData.solution_description || "Your proposed solution as described in the recording",
              targetCustomer: formData.targetCustomer || "B2C",
              customerSegment: formData.customerSegment || formData.customer_segment || "Target audience identified from your description",
              geographicFocus: formData.geographicFocus || ["United States"],
              revenueModel: formData.revenueModel || "Commission",
              expectedPricing: formData.expectedPricing || 25,
              knownCompetitors: formData.knownCompetitors || formData.known_competitors || "Competitors mentioned in your recording",
              primaryGoal: formData.primaryGoal || "Validate Market Demand",
              timeline: formData.timeline || "In 3 months",
              additionalContext: formData.additionalContext || formData.additional_context || ""
            };
            
            setExtractedData(structuredData);
          } else {
            console.warn('No structured data returned from extraction, using fallback');
            // Fallback with basic extracted data
            setExtractedData({
              ideaName: "Voice-recorded Idea",
              oneLineDescription: "An innovative solution extracted from voice recording",
              problemStatement: recording.transcription_text.substring(0, 200) + "...",
              solutionDescription: "Solution extracted from your voice recording",
              targetCustomer: "B2C",
              customerSegment: "Target audience from recording",
              geographicFocus: ["United States"],
              revenueModel: "Commission",
              expectedPricing: 25,
              knownCompetitors: "",
              primaryGoal: "Validate Market Demand",
              timeline: "In 3 months"
            });
          }
        } else {
          console.warn('No transcription found, using basic fallback data');
          setExtractedData({
            ideaName: "Voice-recorded Idea",
            oneLineDescription: "Please review and edit the extracted information",
            problemStatement: "Please describe your problem statement",
            solutionDescription: "Please describe your solution",
            targetCustomer: "B2C",
            customerSegment: "Please specify your target customer segment",
            geographicFocus: ["United States"],
            revenueModel: "Commission",
            expectedPricing: 25,
            knownCompetitors: "",
            primaryGoal: "Validate Market Demand",
            timeline: "In 3 months"
          });
        }
      } catch (error) {
        console.error('Error processing voice recording:', error);
        // Use fallback data if processing fails
        setExtractedData({
          ideaName: "Voice-recorded Idea",
          oneLineDescription: "Please review and edit the extracted information",
          problemStatement: "Please describe your problem statement",
          solutionDescription: "Please describe your solution",
          targetCustomer: "B2C",
          customerSegment: "Please specify your target customer segment",
          geographicFocus: ["United States"],
          revenueModel: "Commission",
          expectedPricing: 25,
          knownCompetitors: "",
          primaryGoal: "Validate Market Demand",
          timeline: "In 3 months"
        });
      }
    }
    
    setCurrentFlow('data_review');
  };

  const handlePitchDeckComplete = (file: File) => {
    // Mock extracted data from pitch deck - using exact enum values
    const mockExtracted: Partial<IdeaValidationFormData> = {
      ideaName: "EcoCommute Solutions",
      oneLineDescription: "Smart carpooling platform that reduces urban traffic congestion and carbon emissions",
      problemStatement: "Urban areas face increasing traffic congestion and air pollution, while many commuters travel alone in private vehicles",
      solutionDescription: "AI-powered matching system that connects commuters with similar routes, optimizing carpooling for maximum efficiency and convenience",
      targetCustomer: "B2B",
      customerSegment: "Daily commuters in metropolitan areas aged 25-45",
      geographicFocus: ["United States"],
      revenueModel: "Subscription",
      expectedPricing: 15,
      knownCompetitors: "Uber Pool, traditional carpooling apps, public transportation",
      primaryGoal: "Market Sizing",
      timeline: "In 6+ months"
    };
    
    setExtractedData(mockExtracted);
    setCurrentFlow('data_review');
  };

  const handleDataReviewConfirm = (data: Partial<IdeaValidationFormData>) => {
    setExtractedData(data);
    setCurrentFlow('form_steps');
  };

  const handleDataReviewEdit = () => {
    setCurrentFlow('form_steps');
  };

  const handleBackToMethodSelection = () => {
    setCurrentFlow('method_selection');
    setInputMethod('form');
    setExtractedData({});
    setAudioRecordingId(null);
  };

  // Render based on current flow
  if (currentFlow === 'method_selection') {
    return <InputMethodSelector onMethodSelect={handleMethodSelect} />;
  }

  if (currentFlow === 'voice_recording') {
    return (
      <VoiceRecorder 
        onComplete={handleVoiceComplete}
        onBack={handleBackToMethodSelection}
      />
    );
  }

  if (currentFlow === 'pitch_upload') {
    return (
      <PitchDeckUploader 
        onComplete={handlePitchDeckComplete}
        onBack={handleBackToMethodSelection}
      />
    );
  }

  if (currentFlow === 'data_review') {
    return (
      <ExtractedDataReview
        extractedData={extractedData}
        inputMethod={inputMethod as 'voice' | 'pitch_deck'}
        onConfirm={handleDataReviewConfirm}
        onEdit={handleDataReviewEdit}
        onBack={() => setCurrentFlow(inputMethod === 'voice' ? 'voice_recording' : 'pitch_upload')}
      />
    );
  }

  return (
    <IdeaValidationFormSteps
      onFormComplete={onFormComplete}
      isSubmitting={isSubmitting}
      duplicateId={duplicateId}
      extractedData={extractedData}
      inputMethod={inputMethod}
      onBackToMethodSelection={handleBackToMethodSelection}
      audioRecordingId={audioRecordingId}
    />
  );
};

export default FormFlowManager;
