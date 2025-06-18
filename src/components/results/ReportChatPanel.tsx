
import React from 'react';
import { X, MessageSquare, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import ChatInput from '@/components/assistant/ChatInput';
import { Message } from '@/constants/aiAssistant';

interface ReportChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  isTyping: boolean;
  viewportRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (message: string) => void;
  onClearConversation: () => void;
  onDownloadChat: () => void;
  reportTitle: string;
}

const ReportChatPanel: React.FC<ReportChatPanelProps> = ({
  isOpen,
  onClose,
  messages,
  isTyping,
  viewportRef,
  onSendMessage,
  onClearConversation,
  onDownloadChat,
  reportTitle
}) => {
  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const reportSpecificPrompts = [
    "Explain my market analysis in simple terms",
    "What should I focus on first?",
    "Why is my score what it is?",
    "How can I improve my competitive position?",
    "What are the biggest risks I should address?"
  ];

  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-sm">Report Advisor</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          Discussing: {reportTitle}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-b border-border bg-muted/10">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onDownloadChat} className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={onClearConversation} className="text-xs">
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
          <div className="p-4 space-y-4">
            {messages.length <= 1 && !isTyping ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-sm mb-2">Ask me about your report</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  I can help explain your analysis, scores, and recommendations
                </p>
                <div className="space-y-2">
                  {reportSpecificPrompts.slice(0, 3).map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs justify-start h-8"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessage 
                    key={msg.id} 
                    message={{ ...msg, timestamp: formatTimestamp(msg.timestamp) }} 
                  />
                ))}
                {isTyping && <TypingIndicator />}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && !isTyping && (
        <div className="px-4 py-2 border-t border-border bg-muted/10">
          <div className="flex flex-wrap gap-1">
            {reportSpecificPrompts.slice(3).map((prompt, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => handlePromptClick(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border">
        <ChatInput onSendMessage={onSendMessage} isTyping={isTyping} />
      </div>
    </div>
  );
};

export default ReportChatPanel;
