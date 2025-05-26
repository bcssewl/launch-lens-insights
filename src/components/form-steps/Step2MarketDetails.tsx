
import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { IdeaValidationFormData } from '../IdeaValidationForm';

interface Step2MarketDetailsProps {
  form: UseFormReturn<IdeaValidationFormData>;
  targetCustomerOptions: readonly string[];
  geographicFocusOptions: readonly string[];
}

const Step2MarketDetails: React.FC<Step2MarketDetailsProps> = ({ form, targetCustomerOptions, geographicFocusOptions }) => {
  const { control } = form;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="targetCustomer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Customer</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select target customer type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {targetCustomerOptions.map(option => (
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
        name="customerSegment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer Segment</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Small business owners, College students" {...field} />
            </FormControl>
            <FormDescription>Be specific about who your ideal customer is.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="geographicFocus"
        render={() => (
          <FormItem>
            <FormLabel>Geographic Focus</FormLabel>
            <FormDescription>Where will you primarily operate or target customers?</FormDescription>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 pt-2">
              {geographicFocusOptions.map((item) => (
                <FormField
                  key={item}
                  control={control}
                  name="geographicFocus"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value) => value !== item
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default Step2MarketDetails;

