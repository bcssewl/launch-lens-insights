import DashboardLayout from '@/layouts/DashboardLayout';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
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
                  <MessageList />
                </ErrorBoundary>
              </div>
              
              {/* Input area - Fixed at bottom */}
              <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm pt-4">
                <InputBox />
              </div>
            </div>

            {/* Research Panel */}
            <div className={cn(
              "pb-4 transition-all duration-300 ease-out will-change-transform",
              "w-[min(max(calc((100vw-538px)*0.75),575px),960px)]",
              !doubleColumnMode && "scale-0 opacity-0 pointer-events-none",
              doubleColumnMode && "scale-100 opacity-100"
            )}>
              <div className={cn(
                "h-full bg-card border border-border rounded-lg shadow-lg",
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
            </div>
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
  const { researchPanelState } = useDeerFlowMessageStore();

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
          {researchPanelState.isOpen && (
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