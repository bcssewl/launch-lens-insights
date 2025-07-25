import MessagesBlock from '@/components/chat/MessagesBlock';
import ResearchBlock from '@/components/chat/ResearchBlock';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { useUnifiedStreaming } from '@/hooks/useUnifiedStreaming';
import ModelSelectionDropdown, { AIModel } from '@/components/assistant/ModelSelectionDropdown';
import AIAssistantPage from '../AIAssistantPage';

const ChatPage = () => {
  const [openResearchId, setOpenResearchId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  const { streamingState, startStreaming, sendFeedback } = useUnifiedStreaming(selectedModel?.id, openResearchId);

  const doubleColumnMode = useMemo(
    () => openResearchId !== null,
    [openResearchId],
  );

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model);
  };

  if (selectedModel && selectedModel.id !== 'deer') {
    return <AIAssistantPage />;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-shrink-0 p-4 border-b">
        <ModelSelectionDropdown onModelSelect={handleModelSelect} selectedModel={selectedModel?.id} />
      </div>
      <div
        className={cn(
          "flex h-full w-full justify-center-safe px-4 pt-12 pb-4",
          doubleColumnMode && "gap-8",
        )}
      >
        <MessagesBlock
          className={cn(
            "shrink-0 transition-all duration-300 ease-out",
            !doubleColumnMode &&
              `w-[768px] translate-x-[min(max(calc((100vw-538px)*0.75),575px)/2,960px/2)]`,
            doubleColumnMode && `w-[538px]`,
          )}
          setOpenResearchId={setOpenResearchId}
          startStreaming={startStreaming}
          streamingState={streamingState}
        />
        <ResearchBlock
          className={cn(
            "w-[min(max(calc((100vw-538px)*0.75),575px),960px)] pb-4 transition-all duration-300 ease-out",
            !doubleColumnMode && "scale-0",
            doubleColumnMode && "",
          )}
          researchId={openResearchId}
          streamingState={streamingState}
          sendFeedback={sendFeedback}
        />
      </div>
    </div>
  );
};

export default ChatPage;
