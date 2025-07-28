import React from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Search, BarChart3, Lightbulb } from "lucide-react";

interface ConversationStarterProps {
  onSendMessage: (message: string) => void;
}

const starterPrompts = [
  {
    icon: MessageSquare,
    title: "Research Analysis",
    prompt: "Analyze the current trends in AI technology and their market impact",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Search,
    title: "Market Research",
    prompt: "Research the competitive landscape for sustainable energy solutions",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Data Analysis",
    prompt: "Analyze consumer behavior patterns in e-commerce post-pandemic",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: Lightbulb,
    title: "Strategic Planning",
    prompt: "Create a strategic plan for digital transformation in traditional retail",
    color: "from-orange-500 to-red-500",
  },
];

export const ConversationStarter = ({ onSendMessage }: ConversationStarterProps) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Welcome to DeerFlow
        </h2>
        <p className="text-muted-foreground text-lg">
          Your intelligent research assistant. Start a conversation or choose from the suggestions below.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {starterPrompts.map((starter, index) => {
          const IconComponent = starter.icon;
          return (
            <motion.div
              key={starter.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer transition-all duration-200 hover:shadow-lg border-muted/50 hover:border-primary/30"
                onClick={() => onSendMessage(starter.prompt)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${starter.color} text-white shadow-lg`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 text-foreground">{starter.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {starter.prompt}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};