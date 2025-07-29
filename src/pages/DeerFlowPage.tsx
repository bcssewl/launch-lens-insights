import DashboardLayout from '@/layouts/DashboardLayout';
import { useDeerFlowStore } from '@/stores/deerFlowStore';
import { DeerFlowHeader } from '@/components/deerflow/DeerFlowHeader';
import { MessageList } from '@/components/deerflow/MessageList';
import { InputBox } from '@/components/deerflow/InputBox';
import { ResearchPanel } from '@/components/deerflow/ResearchPanel';
import { DeerFlowSettings } from '@/components/deerflow/DeerFlowSettings';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

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
  const { isResearchPanelOpen } = useDeerFlowStore();
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
  const { isResearchPanelOpen } = useDeerFlowStore();

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="flex flex-col h-full w-full bg-background text-foreground">
          {/* Header - Fixed at top */}
          <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <DeerFlowHeader />
          </div>

          {/* Main content area */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Chat Container */}
            <div className={cn(
              "flex-1 min-w-0 flex flex-col",
              "transition-all duration-300 ease-out",
              isResearchPanelOpen ? "mr-4 lg:mr-8" : "mr-0"
            )}>
              {/* Messages area - takes remaining space */}
              <div className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto h-full">
                  <ErrorBoundary>
                    <MessageList />
                  </ErrorBoundary>
                </div>
              </div>
              
              {/* Input area - Fixed at bottom */}
              <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                  <div className="max-w-4xl mx-auto">
                    <InputBox />
                  </div>
                </div>
              </div>
            </div>

            {/* Research Panel - Fixed sidebar */}
            {isResearchPanelOpen && (
              <div className={cn(
                "flex-shrink-0 w-full max-w-md lg:max-w-lg",
                "bg-card border-l border-border",
                "transition-all duration-300 ease-out",
                "overflow-hidden"
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
            )}
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
  const { isResearchPanelOpen } = useDeerFlowStore();

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
                <MessageList />
              </ErrorBoundary>
            </div>
          </div>
          
          {/* Mobile input - Fixed at bottom */}
          <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm p-4">
            <InputBox />
          </div>

          {/* Research panel as full-screen modal on mobile */}
          {isResearchPanelOpen && (
            <div className={cn(
              "fixed inset-0 z-50 bg-background flex flex-col",
              "transition-all duration-300 ease-out"
            )}>
              <ErrorBoundary>
                <ResearchPanel />
              </ErrorBoundary>
            </div>
          )}

          <DeerFlowSettings />
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
};