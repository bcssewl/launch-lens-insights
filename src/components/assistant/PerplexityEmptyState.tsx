
import React from 'react';
import EnhancedChatInput from './EnhancedChatInput';
import { Lightbulb, TrendingUp, Users, Target } from 'lucide-react';

interface PerplexityEmptyStateProps {
  onSendMessage: (message: string) => void;
}

const PerplexityEmptyState: React.FC<PerplexityEmptyStateProps> = ({ onSendMessage }) => {
  const quickActions = [
    {
      icon: Lightbulb,
      title: "Validate Your Idea",
      description: "Get comprehensive market analysis and validation insights",
      prompt: "Help me validate my business idea and analyze the market opportunity"
    },
    {
      icon: TrendingUp,
      title: "Market Research",
      description: "Discover trends, competitors, and opportunities in your industry",
      prompt: "What are the current market trends and opportunities in my industry?"
    },
    {
      icon: Users,
      title: "Customer Insights",
      description: "Understand your target audience and customer segments",
      prompt: "Help me identify and understand my target customer segments"
    },
    {
      icon: Target,
      title: "Strategy Planning",
      description: "Develop go-to-market strategies and business plans",
      prompt: "Help me create a go-to-market strategy for my startup"
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Your AI Business
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Assistant
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Get expert insights, validate ideas, and accelerate your startup journey with AI-powered guidance
          </p>
        </div>

        {/* Enhanced Chat Input */}
        <div className="w-full mb-12">
          <EnhancedChatInput 
            onSendMessage={onSendMessage} 
            isTyping={false}
            isCompact={false}
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="w-full max-w-4xl">
          <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
            Popular starting points
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => onSendMessage(action.prompt)}
                  className="group p-6 text-left rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/20 transition-all duration-200 backdrop-blur-sm"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerplexityEmptyState;
