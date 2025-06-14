
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface WelcomeAnimationProps {
  onComplete?: () => void;
}

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [userName, setUserName] = useState('');
  const [animationStage, setAnimationStage] = useState<'enter' | 'display' | 'exit'>('enter');

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0]); // Use first name only
        } else {
          // Fallback to email username
          const emailName = user.email?.split('@')[0] || 'there';
          setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to email username
        const emailName = user.email?.split('@')[0] || 'there';
        setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
      }
    };

    loadUserProfile();
  }, [user]);

  useEffect(() => {
    // Animation timeline
    const enterTimer = setTimeout(() => {
      setAnimationStage('display');
    }, 500);

    const displayTimer = setTimeout(() => {
      setAnimationStage('exit');
    }, 2500);

    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(displayTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div 
        className={`
          relative flex flex-col items-center justify-center p-8 rounded-3xl
          bg-gradient-to-br from-background via-background to-muted/20
          border border-border/50 shadow-2xl
          transition-all duration-700 ease-out
          ${animationStage === 'enter' ? 'scale-50 opacity-0 translate-y-8' : ''}
          ${animationStage === 'display' ? 'scale-100 opacity-100 translate-y-0' : ''}
          ${animationStage === 'exit' ? 'scale-95 opacity-0 translate-y-4' : ''}
        `}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse delay-300" />
        
        {/* Content */}
        <div className="relative z-10 text-center space-y-4">
          <div className="text-4xl md:text-5xl font-bold text-foreground">
            <span 
              className={`
                inline-block transition-all duration-500 delay-200
                ${animationStage === 'enter' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
              `}
            >
              Welcome
            </span>
          </div>
          
          <div className="text-3xl md:text-4xl font-semibold text-primary">
            <span 
              className={`
                inline-block transition-all duration-500 delay-500
                ${animationStage === 'enter' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
              `}
            >
              {userName}
            </span>
          </div>
          
          <div className="text-lg text-muted-foreground">
            <span 
              className={`
                inline-block transition-all duration-500 delay-700
                ${animationStage === 'enter' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
              `}
            >
              Ready to validate your next big idea?
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAnimation;
