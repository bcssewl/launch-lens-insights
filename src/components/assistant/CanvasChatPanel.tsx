
import React from 'react';
import { ResizablePanel } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import EnhancedChatInput from './EnhancedChatInput';
import { Message } from '@/constants/aiAssistant';

interface CanvasChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  viewportRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (message: string) => void;
  onCanvasDownload?: () => void;
  onCanvasPrint?: () => void;
  formatTimestamp: (timestamp: Date) => string;
}

const CanvasChatPanel: React.FC<CanvasChatPanelProps> = ({
  messages,
  isTyping,
  viewportRef,
  onSendMessage,
  onCanvasDownload,
  onCanvasPrint,
  formatTimestamp
}) => {
  return (
    <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
      <div className="h-full border-r border-border/50 flex flex-col relative">
        {/* Chat Messages Area with proper scrolling */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
            <div className="px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }}
                  onOpenCanvas={undefined} // Disable canvas opening in full view
                  onCanvasDownload={onCanvasDownload}
                  onCanvasPrint={onCanvasPrint}
                />
              ))}
              {isTyping && <TypingIndicator />}
            </div>
            <div className="h-20" /> {/* Spacer for input */}
          </ScrollArea>
        </div>

        {/* Seamless Input Area at bottom of chat panel */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
          <EnhancedChatInput 
            onSendMessage={onSendMessage} 
            isTyping={isTyping}
            isCompact={true}
          />
        </div>
      </div>
    </ResizablePanel>
  );
};

export default CanvasChatPanel;
