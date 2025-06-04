
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordInput } from './PasswordInput';

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

interface LoginFormFieldsProps {
  form: UseFormReturn<LoginFormValues>;
}

export const LoginFormFields: React.FC<LoginFormFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input type="email" placeholder="you@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <PasswordInput
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex items-center justify-between">
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Remember me</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <div className="text-sm">
          <Link to="/forgot-password" className="font-medium text-primary hover:text-primary/90">
            Forgot your password?
          </Link>
        </div>
      </div>
    </>
  );
};
