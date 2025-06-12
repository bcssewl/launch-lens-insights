
import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/constants/aiAssistant';

const createInitialMessage = (report: any): Message => ({
  id: uuidv4(),
  text: `Hello! I'm your Lean Startup Specialist, and I'm here to help you create a comprehensive action plan for "${report.idea_name || 'your business idea'}".

I've already reviewed your validation report with a score of ${report.overall_score || 'N/A'}/10. Now, let's work together to create a practical, step-by-step action plan following lean methodology principles.

To get started, I'd love to learn more about your situation:

**What's your available budget for this venture?** This will help me recommend the right approach - from bootstrap strategies to funded growth plans.

Feel free to share any range (e.g., "under $5k", "$10k-50k", "well-funded", etc.) or let me know if you prefer to start without significant investment.`,
  sender: 'ai',
  timestamp: new Date(),
});

export const useActionPlanAgent = (report: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStage, setConversationStage] = useState<'budget' | 'users' | 'personas' | 'generation' | 'complete'>('budget');
  const [collectedData, setCollectedData] = useState({
    budget: '',
    userBase: '',
    wantsPersonas: '',
  });
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setMessages([createInitialMessage(report)]);
  }, [report]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateMockPlan = () => {
    return {
      ideaName: report.idea_name || 'Your Business Idea',
      score: report.overall_score || 0,
      budget: collectedData.budget,
      userBase: collectedData.userBase,
      personas: collectedData.wantsPersonas === 'yes',
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
          budget: collectedData.budget.includes('5k') ? '$500-1,000' : '$1,000-3,000',
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
          budget: collectedData.budget.includes('5k') ? '$1,000-2,000' : '$3,000-8,000',
          success_metrics: ['User activation rate', 'Feature usage analytics', 'Customer satisfaction scores']
        },
        {
          title: 'Phase 3: Measure & Learn (Weeks 13-20)',
          description: 'Collect data and iterate based on learnings',
          tasks: [
            'Analyze user behavior and feedback',
            'Identify key improvement areas',
            'A/B test major changes',
            'Plan next iteration or pivot if needed'
          ],
          budget: collectedData.budget.includes('5k') ? '$500-1,000' : '$2,000-5,000',
          success_metrics: ['Customer retention rate', 'Revenue per user', 'Net Promoter Score']
        }
      ],
      recommendations: [
        'Start small and focus on one core problem',
        'Talk to customers every week',
        'Measure everything that matters',
        'Be prepared to pivot based on learnings'
      ]
    };
  };

  const getNextQuestion = (stage: string, userMessage: string) => {
    switch (stage) {
      case 'budget':
        setCollectedData(prev => ({ ...prev, budget: userMessage }));
        setConversationStage('users');
        return `Great! I understand your budget situation. 

Now, let's talk about your potential users. **Do you already have any potential customers or users identified?** 

For example:
- Have you talked to people who might use this?
- Do you have an email list or social media following?
- Are there existing communities where your target users hang out?
- Or are you starting completely from scratch?

Understanding your current user base will help me recommend the right customer discovery approach.`;

      case 'users':
        setCollectedData(prev => ({ ...prev, userBase: userMessage }));
        setConversationStage('personas');
        return `Perfect! That gives me good insight into your user base situation.

One last question: **Would you like me to include specific customer persona suggestions in your action plan?**

I can create detailed profiles of your ideal customers including:
- Demographics and behavior patterns
- Pain points and motivations  
- Where to find them and how to reach them
- Messaging that resonates with each persona

Just let me know if you'd like personas included, or if you prefer to focus on other aspects of the action plan.`;

      case 'personas':
        setCollectedData(prev => ({ ...prev, wantsPersonas: userMessage }));
        setConversationStage('generation');
        return `Excellent! I now have everything I need to create your personalized lean startup action plan.

Based on our conversation:
- Budget: ${collectedData.budget}
- User base: ${collectedData.userBase}  
- Customer personas: ${userMessage.toLowerCase().includes('yes') ? 'Included' : 'Not included'}

I'll create a comprehensive plan with:
✅ **Build-Measure-Learn cycles** tailored to your budget
✅ **Specific timelines and milestones**
✅ **Budget allocation for each phase**
✅ **Success metrics to track progress**
✅ **Actionable tasks you can start immediately**
${userMessage.toLowerCase().includes('yes') ? '✅ **Detailed customer personas with targeting strategies**' : ''}

Ready to generate your action plan? Click the button below to create your personalized lean startup roadmap!

[GENERATE_ACTION_PLAN]`;

      default:
        return "I'm here to help with any questions about your action plan!";
    }
  };

  const handleSendMessage = async (text?: string, messageText?: string) => {
    const finalMessageText = text || messageText;
    if (!finalMessageText || finalMessageText.trim() === '') return;

    const newUserMessage: Message = {
      id: uuidv4(),
      text: finalMessageText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const aiResponseText = getNextQuestion(conversationStage, finalMessageText);
    
    const aiResponse: Message = {
      id: uuidv4(),
      text: aiResponseText,
      sender: 'ai',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleClearConversation = () => {
    setMessages([createInitialMessage(report)]);
    setConversationStage('budget');
    setCollectedData({ budget: '', userBase: '', wantsPersonas: '' });
  };

  const handleDownloadChat = () => {
    const chatContent = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.sender.toUpperCase()}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `action-plan-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    messages,
    isTyping,
    viewportRef,
    handleSendMessage,
    handleClearConversation,
    handleDownloadChat,
    isConfigured: true,
    conversationStage,
    generateMockPlan
  };
};
