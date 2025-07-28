import DashboardLayout from '@/layouts/DashboardLayout';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useDeerFlowStore } from '@/stores/deerFlowStore';
import { DeerFlowHeader } from '@/components/deerflow/DeerFlowHeader';
import { MessageList } from '@/components/deerflow/MessageList';
import { InputBox } from '@/components/deerflow/InputBox';
import { ResearchPanel } from '@/components/deerflow/ResearchPanel';
import { DeerFlowSettings } from '@/components/deerflow/DeerFlowSettings';

export default function DeerFlowPage() {
  const { isResearchPanelOpen } = useDeerFlowStore();

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col bg-background">
        <DeerFlowHeader />

        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Chat Panel */}
            <ResizablePanel defaultSize={isResearchPanelOpen ? 60 : 100} minSize={40}>
              <div className="h-full relative">
                {/* Messages area - constrained height to leave space for input */}
                <div className="absolute top-0 left-0 right-0 bottom-16 overflow-hidden">
                  <MessageList />
                </div>
                
                {/* Input area - absolutely positioned at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16 border-t bg-background/95 backdrop-blur-sm p-3 z-10">
                  <InputBox />
                </div>
              </div>
            </ResizablePanel>

            {isResearchPanelOpen && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={30}>
                  <ResearchPanel />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>

        <DeerFlowSettings />
      </div>
    </DashboardLayout>
  );
}