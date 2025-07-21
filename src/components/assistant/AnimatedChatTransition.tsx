import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGreeting } from '@/hooks/useGreeting';
import EnhancedChatInput from './EnhancedChatInput';

interface AnimatedChatTransitionProps {
  onSendMessage: (message: string, attachments?: any[], selectedModel?: string) => void;
  selectedModel: string;
  hasMessages: boolean;
  children: React.ReactNode; // Chat content to show after transition
}

const AnimatedChatTransition: React.FC<AnimatedChatTransitionProps> = ({
  onSendMessage,
  selectedModel,
  hasMessages,
  children
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showChat, setShowChat] = useState(hasMessages);
  const { primaryGreeting, assistanceMessage, isLoading: greetingLoading } = useGreeting();
  const transitionStarted = useRef(false);

  // Handle the first message being sent
  const handleFirstMessage = useCallback((message: string, attachments?: any[], model?: string) => {
    if (!showChat && !transitionStarted.current) {
      transitionStarted.current = true;
      setIsTransitioning(true);
      
      // Start the transition
      setTimeout(() => {
        setShowChat(true);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 400);
      }, 50);
    }
    
    onSendMessage(message, attachments, model);
  }, [showChat, onSendMessage]);

  // If we already have messages, show chat directly
  useEffect(() => {
    if (hasMessages && !showChat) {
      setShowChat(true);
      transitionStarted.current = true;
    }
  }, [hasMessages, showChat]);

  // Landing state - centered input with greeting
  if (!showChat && !isTransitioning) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-screen w-full relative bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Greeting Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl font-light text-foreground tracking-tight mb-2">
            {greetingLoading ? 'Welcome' : primaryGreeting}
          </h1>
          <h2 className="text-lg font-normal text-muted-foreground">
            {greetingLoading ? 'How may I assist you today?' : assistanceMessage}
          </h2>
        </motion.div>

        {/* Centered Input */}
        <motion.div 
          className="w-full max-w-2xl px-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <EnhancedChatInput
            onSendMessage={handleFirstMessage}
            isTyping={false}
            isCompact={false}
            selectedModel={selectedModel}
          />
        </motion.div>
      </motion.div>
    );
  }

  // Transition state - input sliding down
  if (isTransitioning) {
    return (
      <div className="flex flex-col h-screen w-full relative bg-background">
        {/* Greeting fading out */}
        <motion.div 
          className="text-center mb-8 pt-24"
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-4xl font-light text-foreground tracking-tight mb-2">
            {greetingLoading ? 'Welcome' : primaryGreeting}
          </h1>
          <h2 className="text-lg font-normal text-muted-foreground">
            {greetingLoading ? 'How may I assist you today?' : assistanceMessage}
          </h2>
        </motion.div>

        {/* Chat content sliding in */}
        <motion.div 
          className="flex-1 flex flex-col"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {children}
        </motion.div>

        {/* Input sliding down */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 mb-20"
          initial={{ y: -400 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="max-w-4xl mx-auto px-6 py-4">
            <EnhancedChatInput
              onSendMessage={onSendMessage}
              isTyping={false}
              isCompact={true}
              selectedModel={selectedModel}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Final chat state
  return (
    <motion.div 
      className="h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedChatTransition;