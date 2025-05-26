
import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { IdeaValidationFormData } from '../IdeaValidationForm';

interface Step3BusinessModelProps {
  form: UseFormReturn<IdeaValidationFormData>;
  revenueModelOptions: readonly string[];
}

const Step3BusinessModel: React.FC<Step3BusinessModelProps> = ({ form, revenueModelOptions }) => {
  const { control, watch } = form;
  const expectedPricingValue = watch('expectedPricing');

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="revenueModel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Revenue Model</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary revenue model" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {revenueModelOptions.map(option => (
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
        name="expectedPricing"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Expected Pricing</FormLabel>
            <FormControl>
              <Slider
                defaultValue={[field.value || 50]}
                onValueChange={(value) => field.onChange(value[0])}
                max={1000}
                min={1}
                step={1}
              />
            </FormControl>
            <FormDescription>
              Estimated price point: ${expectedPricingValue === 1000 ? '1000+' : expectedPricingValue}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="knownCompetitors"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Known Competitors (Optional)</FormLabel>
            <FormControl>
              <Textarea placeholder="List any competitors you're aware of (e.g., Company A, Product B)" {...field} rows={3}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default Step3BusinessModel;

