
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useIdeaValidationForm } from '@/hooks/useIdeaValidationForm';
import FormFlowManager from './form-flow/FormFlowManager';

const IdeaValidationForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { duplicateId, loadingValidation, validationData, processForm } = useIdeaValidationForm();

  const handleFormComplete = async (data: any) => {
    setIsSubmitting(true);
    try {
      await processForm(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingValidation) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading validation data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <FormFlowManager
      onFormComplete={handleFormComplete}
      isSubmitting={isSubmitting}
      duplicateId={duplicateId}
      validationData={validationData}
    />
  );
};

export default IdeaValidationForm;
