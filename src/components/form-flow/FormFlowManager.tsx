
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

  const handleVoiceComplete = (audioBlob: Blob) => {
    // Mock extracted data from voice recording - using exact enum values
    const mockExtracted: Partial<IdeaValidationFormData> = {
      ideaName: "FarmConnect",
      oneLineDescription: "A mobile platform connecting local farmers directly with consumers for fresh produce delivery",
      problemStatement: "Consumers want fresh, local produce but farmers struggle to reach customers without expensive middlemen reducing their profits",
      solutionDescription: "A mobile app where farmers list their products and consumers can order directly, with built-in logistics and payment processing",
      targetCustomer: "B2C",
      customerSegment: "Health-conscious families and individuals who value fresh, local produce",
      revenueModel: "Commission",
      expectedPricing: 25,
      knownCompetitors: "Local farmers markets, grocery stores, some existing farm-to-table apps",
      primaryGoal: "Validate Market Demand",
      timeline: "In 3 months"
    };
    
    setExtractedData(mockExtracted);
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
    />
  );
};

export default FormFlowManager;
