
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Target } from 'lucide-react';
import { Message } from '@/constants/aiAssistant';
import UserAvatar from './UserAvatar';
import AIAvatar from './AIAvatar';
import CopyButton from './CopyButton';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  isActionPlanMode?: boolean;
  onGeneratePlan?: (planData: any) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isActionPlanMode = false, onGeneratePlan }) => {
  const isUser = message.sender === 'user';
  
  // Check if this message contains the action plan generation trigger
  const hasActionPlanTrigger = message.text.includes('[GENERATE_ACTION_PLAN]');
  
  // Clean message text by removing the trigger
  const cleanMessageText = message.text.replace('[GENERATE_ACTION_PLAN]', '').trim();

  const handleGenerateActionPlan = () => {
    if (onGeneratePlan) {
      // Mock plan data - in a real implementation, this would come from the AI
      const mockPlan = {
        ideaName: "AI-Powered Business Idea",
        score: 8.5,
        budget: "Budget range provided by user",
        userBase: "User base information from conversation",
        personas: true,
        phases: [
          {
            title: 'Phase 1: Validate Core Assumptions (Weeks 1-4)',
            description: 'Focus on testing your key business hypotheses',
            tasks: [
              'Define your value proposition hypothesis',
              'Identify and interview 20+ potential customers',
              'Create a simple landing page to test demand',
              'Set up basic analytics to track visitor behavior'
            ],
            budget: '$500-1,000',
            success_metrics: ['Customer interview completion rate', 'Landing page conversion rate', 'Email signups']
          },
          {
            title: 'Phase 2: Build MVP (Weeks 5-12)',
            description: 'Create your minimum viable product',
            tasks: [
              'Design core feature set based on customer feedback',
              'Build basic version with essential features only',
              'Implement user feedback collection system',
              'Launch to early beta users'
            ],
            budget: '$1,000-3,000',
            success_metrics: ['User activation rate', 'Feature usage analytics', 'Customer satisfaction scores']
          }
        ],
        recommendations: [
          'Start small and focus on one core problem',
          'Talk to customers every week',
          'Measure everything that matters',
          'Be prepared to pivot based on learnings'
        ]
      };
      onGeneratePlan(mockPlan);
    }
  };

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <AIAvatar isActionPlan={isActionPlanMode} />
        </div>
      )}
      
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : isActionPlanMode 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-foreground border border-blue-200'
                : 'bg-muted text-foreground'
          }`}
        >
          <MarkdownRenderer content={cleanMessageText} />
          
          {/* Action Plan Generation Button */}
          {hasActionPlanTrigger && isActionPlanMode && onGeneratePlan && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <Button 
                onClick={handleGenerateActionPlan}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Target className="mr-2 h-4 w-4" />
                Generate My Action Plan
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-2 px-2">
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && <CopyButton content={cleanMessageText} />}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <UserAvatar />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
