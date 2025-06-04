
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Edit3 } from 'lucide-react';
import { IdeaValidationFormData } from '@/hooks/useIdeaValidationForm';

interface ExtractedDataReviewProps {
  extractedData: Partial<IdeaValidationFormData>;
  inputMethod: 'voice' | 'pitch_deck';
  onConfirm: (data: Partial<IdeaValidationFormData>) => void;
  onEdit: () => void;
  onBack: () => void;
}

const ExtractedDataReview: React.FC<ExtractedDataReviewProps> = ({
  extractedData,
  inputMethod,
  onConfirm,
  onEdit,
  onBack
}) => {
  // Mock confidence scores for demonstration
  const getConfidenceScore = (field: string) => {
    const scores: Record<string, number> = {
      ideaName: 95,
      oneLineDescription: 90,
      problemStatement: 85,
      solutionDescription: 80,
      targetCustomer: 75,
      customerSegment: 70,
      revenueModel: 85,
      expectedPricing: 60,
      knownCompetitors: 70,
      primaryGoal: 80,
      timeline: 75
    };
    return scores[field] || 70;
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 85) return <Badge variant="default" className="bg-green-500">High</Badge>;
    if (score >= 70) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline" className="border-orange-500 text-orange-600">Low</Badge>;
  };

  const extractedFields = [
    { key: 'ideaName', label: 'Idea Name', value: extractedData.ideaName },
    { key: 'oneLineDescription', label: 'One-line Description', value: extractedData.oneLineDescription },
    { key: 'problemStatement', label: 'Problem Statement', value: extractedData.problemStatement },
    { key: 'solutionDescription', label: 'Solution Description', value: extractedData.solutionDescription },
    { key: 'targetCustomer', label: 'Target Customer', value: extractedData.targetCustomer },
    { key: 'customerSegment', label: 'Customer Segment', value: extractedData.customerSegment },
    { key: 'revenueModel', label: 'Revenue Model', value: extractedData.revenueModel },
    { key: 'expectedPricing', label: 'Expected Pricing', value: extractedData.expectedPricing ? `$${extractedData.expectedPricing}` : undefined },
    { key: 'knownCompetitors', label: 'Known Competitors', value: extractedData.knownCompetitors },
    { key: 'primaryGoal', label: 'Primary Goal', value: extractedData.primaryGoal },
    { key: 'timeline', label: 'Timeline', value: extractedData.timeline },
    { key: 'geographicFocus', label: 'Geographic Focus', value: extractedData.geographicFocus ? extractedData.geographicFocus.join(', ') : undefined },
    { key: 'additionalContext', label: 'Additional Context', value: extractedData.additionalContext }
  ].filter(field => field.value && field.value !== '');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          Review Extracted Information
        </CardTitle>
        <p className="text-muted-foreground">
          We've extracted the following information from your {inputMethod === 'voice' ? 'voice recording' : 'pitch deck'}. 
          Review and confirm the details below.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium">Extracted Data Points ({extractedFields.length} fields extracted)</h4>
          {extractedFields.length > 0 ? (
            extractedFields.map(field => (
              <div key={field.key} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <label className="font-medium text-sm">{field.label}</label>
                  {getConfidenceBadge(getConfidenceScore(field.key))}
                </div>
                <p className="text-sm bg-muted/50 rounded p-2">
                  {field.value}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No data could be extracted from your {inputMethod === 'voice' ? 'voice recording' : 'pitch deck'}.</p>
              <p className="text-sm mt-1">Please try recording again or fill out the form manually.</p>
            </div>
          )}
        </div>

        {extractedFields.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                  Review Recommended
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Some fields have medium or low confidence scores. We recommend reviewing 
                  and editing these details to ensure accuracy before submitting your validation.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-3 pt-4">
          <Button variant="outline" onClick={onBack} className="w-full">
            Back
          </Button>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={onEdit}
              className="flex-1 sm:flex-none sm:min-w-[140px]"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Details
            </Button>
            {extractedFields.length > 0 && (
              <Button 
                onClick={() => onConfirm(extractedData)} 
                className="flex-1 gradient-button"
              >
                Looks Good - Continue
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractedDataReview;
