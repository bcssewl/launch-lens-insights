
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/assistant/ChatMessage';
import ChatInput from '@/components/assistant/ChatInput';
import TypingIndicator from '@/components/assistant/TypingIndicator';
import ActionPlanSuggestions from './ActionPlanSuggestions';
import ActionPlanViewer from './ActionPlanViewer';
import { useActionPlanAgent } from '@/hooks/useActionPlanAgent';

interface ActionPlanAgentProps {
  report: any;
}

const ActionPlanAgent: React.FC<ActionPlanAgentProps> = ({ report }) => {
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  
  const {
    messages,
    isTyping,
    viewportRef,
    handleSendMessage,
    handleClearConversation,
    handleDownloadChat,
    isConfigured
  } = useActionPlanAgent(report);

  const handleGeneratePlan = (planData: any) => {
    setGeneratedPlan(planData);
    setShowActionPlan(true);
  };

  const handleBackToChat = () => {
    setShowActionPlan(false);
  };

  if (showActionPlan && generatedPlan) {
    return (
      <ActionPlanViewer 
        plan={generatedPlan} 
        report={report}
        onBackToChat={handleBackToChat}
        onRegeneratePlan={() => setShowActionPlan(false)}
      />
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <Card className="flex-1 flex flex-col apple-card border-0 shadow-lg overflow-hidden">
        {/* Chat Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold text-lg">🎯</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Lean Startup Specialist</h3>
              <p className="text-sm text-muted-foreground">Let's create an actionable plan for your business idea</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6" ref={viewportRef}>
          <div className="py-6 space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isActionPlanMode={true}
                onGeneratePlan={handleGeneratePlan}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-muted/20 p-6 space-y-4">
          <ActionPlanSuggestions onSelectSuggestion={handleSendMessage} />
          <ChatInput onSendMessage={handleSendMessage} isTyping={isTyping} />
        </div>
      </Card>
    </div>
  );
};

export default ActionPlanAgent;
