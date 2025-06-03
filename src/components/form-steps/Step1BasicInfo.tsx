import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IdeaValidationFormData } from '@/hooks/useIdeaValidationForm';

interface Step1BasicInfoProps {
  form: UseFormReturn<IdeaValidationFormData>;
}

const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({ form }) => {
  const { control, watch } = form;
  const oneLineDescriptionLength = watch('oneLineDescription')?.length || 0;
  const problemStatementLength = watch('problemStatement')?.length || 0;
  const solutionDescriptionLength = watch('solutionDescription')?.length || 0;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="ideaName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Idea Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Netflix for Books" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="oneLineDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>One-line Description</FormLabel>
            <FormControl>
              <Input placeholder="Describe your idea in one sentence" {...field} />
            </FormControl>
            <FormDescription className="flex justify-between">
              <span>Describe your idea in one powerful sentence.</span>
              <span>{oneLineDescriptionLength}/150</span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="problemStatement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Problem Statement</FormLabel>
            <FormControl>
              <Textarea placeholder="What problem does this solve? Who experiences this problem?" {...field} rows={4}/>
            </FormControl>
             <FormDescription className="flex justify-between">
              <span>Clearly define the pain point you are addressing.</span>
              <span>{problemStatementLength}/500</span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="solutionDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Solution Description</FormLabel>
            <FormControl>
              <Textarea placeholder="How does your solution work? What makes it unique?" {...field} rows={4}/>
            </FormControl>
            <FormDescription className="flex justify-between">
              <span>Explain your proposed solution and its key features.</span>
              <span>{solutionDescriptionLength}/500</span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default Step1BasicInfo;
