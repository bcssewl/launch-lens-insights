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
        <div className={cn(
          // Use existing container styling
          "flex h-full w-full",
          "bg-background text-foreground",
          // Add platform's responsive container classes
          "container mx-auto px-4 sm:px-6 lg:px-8"
        )}>
          <DeerFlowHeader />

          <div className="flex-1 flex overflow-hidden">
            {/* Chat Container */}
            <div className={cn(
              // Chat container with platform's max-width
              "flex-1 min-w-0 flex flex-col",
              "max-w-4xl mx-auto",
              "transition-all duration-300 ease-out",
              !isResearchPanelOpen && "pr-0",
              isResearchPanelOpen && "pr-4 lg:pr-8"
            )}>
              {/* Messages area with platform's spacing */}
              <div className="flex-1 overflow-hidden">
                <ErrorBoundary>
                  <MessageList />
                </ErrorBoundary>
              </div>
              
              {/* Input area with platform's styling */}
              <div className="border-t bg-background/95 backdrop-blur-sm p-4">
                <InputBox />
              </div>
            </div>

            {/* Research Panel with platform's panel design */}
            {isResearchPanelOpen && (
              <div className={cn(
                // Use existing side panel styling
                "flex-shrink-0 w-full max-w-md lg:max-w-lg",
                "bg-card border-l border-border",
                "transition-all duration-300 ease-out",
                // Platform's panel animation pattern
                "transform translate-x-0 opacity-100"
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
  const { isResearchPanelOpen, setResearchPanelOpen } = useDeerFlowStore();

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="flex flex-col h-full bg-background">
          {/* Mobile header with platform's styling */}
          <div className="border-b bg-background/95 backdrop-blur-sm">
            <DeerFlowHeader />
          </div>
          
          {/* Chat takes full width on mobile */}
          <div className="flex-1 overflow-hidden px-4 py-2">
            <ErrorBoundary>
              <MessageList />
            </ErrorBoundary>
          </div>
          
          {/* Mobile input with platform's input pattern */}
          <div className="border-t bg-background/95 backdrop-blur-sm p-4">
            <InputBox />
          </div>

          {/* Research panel as full-screen modal on mobile */}
          {isResearchPanelOpen && (
            <div className={cn(
              "fixed inset-0 z-50 bg-background",
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