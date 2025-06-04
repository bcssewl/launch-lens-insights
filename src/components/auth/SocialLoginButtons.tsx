
import React from 'react';
import { Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppleLogo } from '../AppleLogo';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialLoginButtonsProps {
  isGoogleLoading: boolean;
  onGoogleLoading: (loading: boolean) => void;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  isGoogleLoading,
  onGoogleLoading,
}) => {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    
    onGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        console.error('Google sign in error:', error);
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected Google sign in error:', error);
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      onGoogleLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? "Signing in..." : "Google"}
        </Button>
        <Button variant="outline" className="w-full">
          <AppleLogo className="mr-2 h-4 w-4" />
          Apple
        </Button>
        <Button variant="outline" className="w-full">
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </Button>
      </div>
    </div>
  );
};
