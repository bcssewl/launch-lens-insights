import DashboardLayout from '@/layouts/DashboardLayout';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import { useDeerFlowKeyboard } from '@/hooks/useDeerFlowKeyboard';
import { useEnhancedDeerStreaming } from '@/hooks/useEnhancedDeerStreaming';
import { DeerFlowHeader } from '@/components/deerflow/DeerFlowHeader';
import { MessageList } from '@/components/deerflow/MessageList';
import { InputBox } from '@/components/deerflow/InputBox';
import { ResearchPanel } from '@/components/deerflow/ResearchPanel';
import { DeerFlowSettings } from '@/components/deerflow/DeerFlowSettings';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Responsive width calculations using platform's breakpoint system
 */
const getChatWidth = (isResearchOpen: boolean, viewport: number): string => {
  // Use platform's breakpoint values
  if (viewport < 640) return '100%'; // sm breakpoint
  if (viewport < 1024) return '100%'; // lg breakpoint
  
  if (!isResearchOpen) {
    // Single column: use platform's reading width
    return 'min(768px, calc(100vw - 2rem))';
  } else {
    // Dual column: calculate based on platform's grid
    return 'min(538px, calc(60vw - 2rem))';
  }
};

/**
 * Mobile detection using platform's breakpoint system
 */
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const updateLayout = () => {
      // Use platform's mobile breakpoint
      setIsMobile(window.innerWidth < 768);
    };
    
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);
  
  return isMobile;
};

export default function DeerFlowPage() {
  const { researchPanelState } = useDeerFlowMessageStore();
  const isMobile = useMobileDetection();

  if (isMobile) {
    return <MobileDeerFlowLayout />;
  }

  return <DesktopDeerFlowLayout />;
}

/**
 * Desktop layout using platform's container patterns
 */
const DesktopDeerFlowLayout = () => {
  const { researchPanelState } = useDeerFlowMessageStore();
  const { startDeerFlowStreaming } = useEnhancedDeerStreaming();
  
  // Enable keyboard navigation
  useDeerFlowKeyboard();
  
  const handleSendMessage = (message: string, options?: { interruptFeedback?: string }) => {
    startDeerFlowStreaming(message, {
      interruptFeedback: options?.interruptFeedback
    });
  };
  
  const doubleColumnMode = researchPanelState.isOpen;

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="flex flex-col h-full w-full bg-background text-foreground">
          {/* Header - Fixed at top */}
          <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <DeerFlowHeader />
          </div>

          {/* Main content area - Dual column architecture */}
          <div className={cn(
            "flex-1 flex h-full w-full justify-center px-4 pt-4 pb-4 min-h-0",
            doubleColumnMode && "gap-8"
          )}>
            {/* Messages Block */}
            <div className={cn(
              "flex flex-col shrink-0",
              "transition-all duration-300 ease-out will-change-transform",
              !doubleColumnMode && "w-[768px] mx-auto",
              doubleColumnMode && "w-[538px]"
            )}>
              {/* Messages area - takes remaining space */}
              <div className="flex-1 overflow-hidden">
                <ErrorBoundary>
                  <MessageList onSendMessage={handleSendMessage} />
                </ErrorBoundary>
              </div>
              
              {/* Input area - Fixed at bottom */}
              <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm pt-4">
                <InputBox onSendMessage={handleSendMessage} />
              </div>
            </div>

            {/* Research Panel with Enhanced Animations */}
            <AnimatePresence mode="wait">
              {doubleColumnMode && (
                <motion.div
                  key="research-panel"
                  initial={{ opacity: 0, scale: 0.95, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 50 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeOut",
                    layout: { duration: 0.3 }
                  }}
                  className={cn(
                    "pb-4 w-[min(max(calc((100vw-538px)*0.75),575px),960px)]"
                  )}
                  layout
                >
                  <div className={cn(
                    "h-full bg-card border border-border rounded-lg shadow-xl",
                    "overflow-hidden backdrop-blur-sm",
                    "ring-1 ring-black/5 dark:ring-white/5"
                  )}>
                    <ErrorBoundary 
                      fallback={
                        <div className="p-4 text-center text-muted-foreground">
                          <p>Research panel temporarily unavailable</p>
                          <p className="text-xs mt-2">Try refreshing the page</p>
                        </div>
                      }
                    >
                      <ResearchPanel />
                    </ErrorBoundary>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DeerFlowSettings />
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
};

/**
 * Mobile layout using platform's mobile patterns
 */
const MobileDeerFlowLayout = () => {
  const { researchPanelState, closeResearchPanel } = useDeerFlowMessageStore();
  const { startDeerFlowStreaming } = useEnhancedDeerStreaming();
  
  // Enable keyboard navigation on mobile too
  useDeerFlowKeyboard();

  const handleSendMessage = (message: string, options?: { interruptFeedback?: string }) => {
    startDeerFlowStreaming(message, {
      interruptFeedback: options?.interruptFeedback
    });
  };

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="flex flex-col h-full w-full bg-background">
          {/* Mobile header - Fixed at top */}
          <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <DeerFlowHeader />
          </div>
          
          {/* Chat area - takes remaining space */}
          <div className="flex-1 overflow-hidden min-h-0">
            <div className="h-full px-4 py-2">
              <ErrorBoundary>
                <MessageList onSendMessage={handleSendMessage} />
              </ErrorBoundary>
            </div>
          </div>
          
          {/* Mobile input - Fixed at bottom */}
          <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm p-4">
            <InputBox onSendMessage={handleSendMessage} />
          </div>

          {/* Research panel as full-screen modal on mobile with enhanced animations */}
          <AnimatePresence>
            {researchPanelState.isOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                  onClick={closeResearchPanel}
                />
                
                {/* Panel */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeOut",
                    type: "spring",
                    damping: 25,
                    stiffness: 300
                  }}
                  className={cn(
                    "fixed inset-y-0 right-0 z-50 w-full max-w-md",
                    "bg-background border-l border-border shadow-2xl",
                    "flex flex-col overflow-hidden",
                    // Touch-friendly on mobile
                    "touch-pan-y"
                  )}
                  // Accessibility improvements
                  role="dialog"
                  aria-modal="true"
                  aria-label="Research panel"
                >
                  <ErrorBoundary>
                    <ResearchPanel />
                  </ErrorBoundary>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <DeerFlowSettings />
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
};