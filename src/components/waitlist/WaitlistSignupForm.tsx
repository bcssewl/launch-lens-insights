
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const WaitlistSignupForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('waitlist_signups')
        .insert([
          {
            email: email.trim().toLowerCase(),
            referral_source: window.location.href,
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already signed up!",
            description: "This email is already on our waitlist. We'll be in touch soon!",
            variant: "default",
          });
          setIsSuccess(true);
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast({
          title: "Welcome to the waitlist!",
          description: "We'll notify you as soon as we're ready for you.",
        });
      }
    } catch (error) {
      console.error('Waitlist signup error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">
          You're on the list!
        </h3>
        <p className="text-gray-400 mb-6">
          Thanks for joining our waitlist. We'll send you an email as soon as we're ready for you to try Optivise.
        </p>
        <p className="text-sm text-gray-500">
          Keep an eye on your inbox — early access is coming soon!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 bg-gray-950/50 border-gray-800 text-white placeholder:text-gray-400"
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="h-12 px-6 bg-black hover:bg-black/90 text-white"
            variant="ghost"
            disabled={isLoading}
          >
            {isLoading ? 'Joining...' : 'Get Notified'}
          </Button>
        </div>
      </form>
      <p className="text-xs text-gray-500 text-center mt-4">
        We respect your privacy. No spam, unsubscribe at any time.
      </p>
    </div>
  );
};

export default WaitlistSignupForm;
