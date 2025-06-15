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
  const [pitchDeckUploadId, setPitchDeckUploadId] = useState<string | null>(null);

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

  const parseFormDataFromTranscription = (transcriptionData: any): Partial<IdeaValidationFormData> => {
    console.log('Parsing form data from transcription data:', transcriptionData);
    
    // Check if transcriptionData is already a structured object
    if (typeof transcriptionData === 'object' && transcriptionData !== null) {
      console.log('Found structured object in transcription:', transcriptionData);
      
      // Map the extracted object to our form structure
      const structuredData: Partial<IdeaValidationFormData> = {
        ideaName: transcriptionData.ideaName || "Extracted from document",
        oneLineDescription: transcriptionData.oneLineDescription || "An innovative solution extracted from your document",
        problemStatement: transcriptionData.problemStatement || "Problem identified from your document",
        solutionDescription: transcriptionData.solutionDescription || "Solution described in your document",
        targetCustomer: transcriptionData.targetCustomer || "B2C",
        customerSegment: transcriptionData.customerSegment || "Target audience from your document",
        geographicFocus: Array.isArray(transcriptionData.geographicFocus) ? transcriptionData.geographicFocus : 
                        (transcriptionData.geographicFocus === "Global") ? ["Global"] : ["United States"],
        revenueModel: transcriptionData.revenueModel || "One-time Purchase",
        expectedPricing: typeof transcriptionData.expectedPricing === 'number' ? transcriptionData.expectedPricing : 25,
        knownCompetitors: transcriptionData.knownCompetitors || "",
        primaryGoal: transcriptionData.primaryGoal || "Validate Market Demand",
        timeline: transcriptionData.timeline || "Building this month",
        additionalContext: transcriptionData.additionalContext || ""
      };
      
      console.log('Final structured data from transcription:', structuredData);
      return structuredData;
    }
    
    // Handle string input (fallback for voice recordings)
    if (typeof transcriptionData === 'string') {
      // Try to parse JSON if the transcription contains structured data
      try {
        const jsonMatch = transcriptionData.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = JSON.parse(jsonMatch[0]);
          console.log('Found JSON structure in transcription text:', extractedJson);
          return parseFormDataFromTranscription(extractedJson); // Recursive call with parsed object
        }
      } catch (error) {
        console.log('No valid JSON found in transcription, using fallback');
      }
      
      // Fallback for plain text transcription
      return {
        ideaName: "Document-based Idea",
        oneLineDescription: "Please review and edit the extracted information",
        problemStatement: transcriptionData.substring(0, 200) + (transcriptionData.length > 200 ? "..." : ""),
        solutionDescription: "Please describe your solution based on your document",
        targetCustomer: "B2C",
        customerSegment: "Please specify your target customer segment",
        geographicFocus: ["United States"],
        revenueModel: "One-time Purchase",
        expectedPricing: 25,
        knownCompetitors: "",
        primaryGoal: "Validate Market Demand",
        timeline: "Building this month"
      };
    }
    
    // Final fallback
    return {
      ideaName: "Document-based Idea",
      oneLineDescription: "Please review and edit the extracted information",
      problemStatement: "Please describe your problem statement",
      solutionDescription: "Please describe your solution",
      targetCustomer: "B2C",
      customerSegment: "Please specify your target customer segment",
      geographicFocus: ["United States"],
      revenueModel: "One-time Purchase",
      expectedPricing: 25,
      knownCompetitors: "",
      primaryGoal: "Validate Market Demand",
      timeline: "Building this month"
    };
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
          console.log('Transcription found:', recording.transcription_text);
          
          // Parse the form data directly from the transcription text
          const parsedFormData = parseFormDataFromTranscription(recording.transcription_text);
          
          if (parsedFormData) {
            setExtractedData(parsedFormData);
            console.log('Successfully set extracted data from transcription:', parsedFormData);
          } else {
            console.warn('Failed to parse form data from transcription, using fallback');
            setExtractedData({
              ideaName: "Voice-recorded Idea",
              oneLineDescription: "Please review and edit the extracted information",
              problemStatement: recording.transcription_text.substring(0, 200) + (recording.transcription_text.length > 200 ? "..." : ""),
              solutionDescription: "Please describe your solution based on your recording",
              targetCustomer: "B2C",
              customerSegment: "Please specify your target customer segment",
              geographicFocus: ["United States"],
              revenueModel: "One-time Purchase",
              expectedPricing: 25,
              knownCompetitors: "",
              primaryGoal: "Validate Market Demand",
              timeline: "Building this month"
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
            revenueModel: "One-time Purchase",
            expectedPricing: 25,
            knownCompetitors: "",
            primaryGoal: "Validate Market Demand",
            timeline: "Building this month"
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
          revenueModel: "One-time Purchase",
          expectedPricing: 25,
          knownCompetitors: "",
          primaryGoal: "Validate Market Demand",
          timeline: "Building this month"
        });
      }
    }
    
    // Go directly to form steps
    setCurrentFlow('form_steps');
  };

  const handlePitchDeckComplete = async (uploadId: string, transcriptionData?: any) => {
    console.log('Pitch deck upload completed:', { uploadId, transcriptionData });
    setPitchDeckUploadId(uploadId);
    
    if (transcriptionData) {
      // Parse the extracted data from the transcription
      const parsedFormData = parseFormDataFromTranscription(transcriptionData);
      setExtractedData(parsedFormData);
    } else {
      // Use fallback data if no transcription
      setExtractedData({
        ideaName: "Document-based Idea",
        oneLineDescription: "Please review and edit the extracted information",
        problemStatement: "Please describe your problem statement",
        solutionDescription: "Please describe your solution",
        targetCustomer: "B2C",
        customerSegment: "Please specify your target customer segment",
        geographicFocus: ["United States"],
        revenueModel: "One-time Purchase",
        expectedPricing: 25,
        knownCompetitors: "",
        primaryGoal: "Validate Market Demand",
        timeline: "Building this month"
      });
    }
    
    setCurrentFlow('form_steps');
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
    setPitchDeckUploadId(null);
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
      pitchDeckUploadId={pitchDeckUploadId}
    />
  );
};

export default FormFlowManager;
