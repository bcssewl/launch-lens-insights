import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IdeaValidationFormData } from '@/hooks/useIdeaValidationForm';
import { primaryGoalOptions as primaryGoalOptionsData, timelineOptions as timelineOptionsData } from '@/lib/validation-constants';

interface Step4ValidationGoalsProps {
  form: UseFormReturn<IdeaValidationFormData>;
  primaryGoalOptions: typeof primaryGoalOptionsData;
  timelineOptions: typeof timelineOptionsData;
}

const Step4ValidationGoals: React.FC<Step4ValidationGoalsProps> = ({ form, primaryGoalOptions, timelineOptions }) => {
  const { control } = form;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="primaryGoal"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Primary Validation Goal</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
                value={field.value}
              >
                {primaryGoalOptions.map(option => (
                  <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={option} />
                    </FormControl>
                    <FormLabel className="font-normal">{option}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="timeline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Development Timeline</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your estimated timeline" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {timelineOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="additionalContext"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Context (Optional)</FormLabel>
            <FormControl>
              <Textarea placeholder="Any other details about your idea or specific questions you have?" {...field} value={field.value ?? ''} rows={4}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default Step4ValidationGoals;
