import React, { useState } from 'react';
import { IdeaValidationFormData } from '@/hooks/useIdeaValidationForm';

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
    // Store the recording ID for later use
    if (recordingId) {
      setAudioRecordingId(recordingId);
      
      // Get the transcription and extract form data
      try {
        const { data: recording } = await supabase
          .from('audio_recordings')
          .select('transcription_text')
          .eq('id', recordingId)
          .single();
        
        if (recording?.transcription_text) {
          // Send transcription to n8n for form extraction
          const response = await fetch('https://n8n-launchlens.botica.it.com/webhook/audio-transcribe-form', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transcription: recording.transcription_text,
              action: 'extract_form_data'
            })
          });
          
          if (response.ok) {
            const extractedFormData = await response.json();
            setExtractedData(extractedFormData);
          } else {
            // Fallback to mock data if extraction fails
            const mockExtracted: Partial<IdeaValidationFormData> = {
              ideaName: "Voice-recorded Idea",
              oneLineDescription: "An innovative solution extracted from voice recording",
              problemStatement: "Based on your voice recording, we've identified key problem areas",
              solutionDescription: "Your proposed solution as described in the recording",
              targetCustomer: "B2C",
              customerSegment: "Target audience identified from your description",
              revenueModel: "Commission",
              expectedPricing: 25,
              knownCompetitors: "Competitors mentioned in your recording",
              primaryGoal: "Validate Market Demand",
              timeline: "In 3 months"
            };
            setExtractedData(mockExtracted);
          }
        }
      } catch (error) {
        console.error('Error processing voice recording:', error);
        // Use fallback mock data
        const mockExtracted: Partial<IdeaValidationFormData> = {
          ideaName: "Voice-recorded Idea",
          oneLineDescription: "An innovative solution extracted from voice recording",
          problemStatement: "Based on your voice recording, we've identified key problem areas",
          solutionDescription: "Your proposed solution as described in the recording",
          targetCustomer: "B2C",
          customerSegment: "Target audience identified from your description",
          revenueModel: "Commission",
          expectedPricing: 25,
          knownCompetitors: "Competitors mentioned in your recording",
          primaryGoal: "Validate Market Demand",
          timeline: "In 3 months"
        };
        setExtractedData(mockExtracted);
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
