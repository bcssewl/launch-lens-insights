import DashboardLayout from '@/layouts/DashboardLayout';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useDeerFlowStore } from '@/stores/deerFlowStore';
import { DeerFlowHeader } from '@/components/deerflow/DeerFlowHeader';
import { MessageList } from '@/components/deerflow/MessageList';
import { InputBox } from '@/components/deerflow/InputBox';
import { ResearchPanel } from '@/components/deerflow/ResearchPanel';
import { DeerFlowSettings } from '@/components/deerflow/DeerFlowSettings';

export default function DeerFlowPage() {
  const { 
    addMessage, 
    setIsResponding, 
    isResponding,
    setResearchPanelOpen,
    isResearchPanelOpen 
  } = useDeerFlowStore();

  const handleSendMessage = async (message: string) => {
    // Add user message
    addMessage({
      role: "user",
      content: message,
    });

    setIsResponding(true);
    setResearchPanelOpen(true);

    try {
      // Mock API call - replace with actual DeerFlow API integration
      console.log("Sending message to DeerFlow API:", message);
      
      // Simulate AI processing
      setTimeout(() => {
        // Add mock planner message
        addMessage({
          role: "planner",
          content: JSON.stringify({
            title: "Research Plan",
            thought: "I'll analyze this topic systematically",
            steps: [
              "Search for recent market data",
              "Analyze industry reports", 
              "Identify key trends",
              "Generate comprehensive report"
            ]
          }),
          metadata: {
            reasoningContent: "Let me think about the best approach to research this topic. I need to consider multiple data sources and ensure comprehensive coverage."
          }
        });

        // Add research start message
        setTimeout(() => {
          addMessage({
            role: "research",
            content: "Starting comprehensive research on your topic...",
            metadata: {
              researchState: "researching"
            }
          });
        }, 1000);

        setIsResponding(false);
      }, 2000);

    } catch (error) {
      console.error("Error sending message:", error);
      setIsResponding(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col bg-background">
        <DeerFlowHeader />

        <div className="flex-1">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Chat Panel */}
            <ResizablePanel defaultSize={isResearchPanelOpen ? 60 : 100} minSize={40}>
              <div className="h-full flex flex-col">
                <MessageList onSendMessage={handleSendMessage} />
                <InputBox onSendMessage={handleSendMessage} />
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