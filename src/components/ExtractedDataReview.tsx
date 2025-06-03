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
    { key: 'timeline', label: 'Timeline', value: extractedData.timeline }
  ].filter(field => field.value);

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
        {inputMethod === 'voice' && (
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
              Voice Transcription
            </h4>
            <p className="text-sm text-muted-foreground italic">
              "I have this idea for a platform that connects local farmers directly with consumers. 
              The problem is that people want fresh, local produce but farmers struggle to reach customers 
              without going through expensive middlemen. My solution is a mobile app that lets farmers 
              list their products and consumers can order directly from nearby farms..."
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-medium">Extracted Data Points</h4>
          {extractedFields.map(field => (
            <div key={field.key} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <label className="font-medium text-sm">{field.label}</label>
                {getConfidenceBadge(getConfidenceScore(field.key))}
              </div>
              <p className="text-sm bg-muted/50 rounded p-2">
                {field.value || 'Not extracted'}
              </p>
            </div>
          ))}
        </div>

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

        <div className="flex justify-between space-x-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onEdit}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Details
            </Button>
            <Button onClick={() => onConfirm(extractedData)} className="gradient-button">
              Looks Good - Continue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractedDataReview;
