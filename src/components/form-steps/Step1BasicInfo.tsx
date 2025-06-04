
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

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <div className="space-y-4 w-full">
      <FormField
        control={control}
        name="ideaName"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="mobile-subheading">Idea Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., Netflix for Books" 
                {...field} 
                className="apple-input w-full touch-target"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="oneLineDescription"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="mobile-subheading">One-line Description</FormLabel>
            <FormControl>
              <Input 
                placeholder="Describe your idea in one sentence" 
                {...field} 
                className="apple-input w-full touch-target"
              />
            </FormControl>
            <FormDescription className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-xs">Describe your idea in one powerful sentence.</span>
              <span className="text-xs font-medium">{oneLineDescriptionLength}/150</span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="problemStatement"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="mobile-subheading">Problem Statement</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What problem does this solve? Who experiences this problem?" 
                {...field} 
                rows={3}
                className="apple-input w-full min-h-[80px] resize-none overflow-hidden"
                onChange={(e) => {
                  field.onChange(e);
                  autoResize(e);
                }}
                onInput={autoResize}
              />
            </FormControl>
             <FormDescription className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-xs">Clearly define the pain point you are addressing.</span>
              <span className="text-xs font-medium">{problemStatementLength}/500</span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="solutionDescription"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="mobile-subheading">Solution Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="How does your solution work? What makes it unique?" 
                {...field} 
                rows={3}
                className="apple-input w-full min-h-[80px] resize-none overflow-hidden"
                onChange={(e) => {
                  field.onChange(e);
                  autoResize(e);
                }}
                onInput={autoResize}
              />
            </FormControl>
            <FormDescription className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-xs">Explain your proposed solution and its key features.</span>
              <span className="text-xs font-medium">{solutionDescriptionLength}/500</span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default Step1BasicInfo;
