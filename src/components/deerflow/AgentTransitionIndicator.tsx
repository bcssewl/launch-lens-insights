/**
 * @file AgentTransitionIndicator.tsx
 * @description Component for visualizing agent handoffs in DeerFlow
 */

import React from 'react';
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, User, Brain, FileSearch, FileText } from "lucide-react";

interface AgentTransition {
  from: string;
  to: string;
  context?: any;
  timestamp: Date;
}

interface AgentTransitionIndicatorProps {
  transitions: AgentTransition[];
  currentAgent?: string;
  isStreaming?: boolean;
}

const AGENT_CONFIG = {
  coordinator: { 
    icon: User, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
    label: 'Coordinator'
  },
  planner: { 
    icon: Brain, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800',
    label: 'Planner'
  },
  researcher: { 
    icon: FileSearch, 
    color: 'text-green-600', 
    bg: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
    label: 'Researcher'
  },
  reporter: { 
    icon: FileText, 
    color: 'text-orange-600', 
    bg: 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800',
    label: 'Reporter'
  }
};

export const AgentTransitionIndicator = ({ 
  transitions, 
  currentAgent, 
  isStreaming = false 
}: AgentTransitionIndicatorProps) => {
  if (!transitions || transitions.length === 0) return null;

  const getAgentConfig = (agent: string) => 
    AGENT_CONFIG[agent as keyof typeof AGENT_CONFIG] || { 
      icon: User, 
      color: 'text-gray-600', 
      bg: 'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800',
      label: agent 
    };

  const renderAgentBadge = (agent: string, isActive = false) => {
    const config = getAgentConfig(agent);
    const Icon = config.icon;
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-xs font-medium ${config.bg} ${config.color} ${
          isActive ? 'ring-2 ring-offset-1 ring-current' : ''
        }`}
      >
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
        {isActive && isStreaming && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-current rounded-full"
          />
        )}
      </motion.div>
    );
  };

  const latestTransition = transitions[transitions.length - 1];

  return (
    <div className="space-y-2">
      {/* Current active transition */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-muted-foreground">Agent:</span>
        <div className="flex items-center space-x-2">
          {renderAgentBadge(latestTransition.from)}
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          {renderAgentBadge(latestTransition.to, true)}
        </div>
      </div>

      {/* Transition history (if more than one) */}
      {transitions.length > 1 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            View transition history ({transitions.length - 1} previous)
          </summary>
          <div className="mt-2 space-y-1 pl-2 border-l-2 border-muted">
            {transitions.slice(0, -1).reverse().map((transition, index) => (
              <div key={index} className="flex items-center space-x-2 text-muted-foreground">
                <span className="text-xs">
                  {transition.timestamp.toLocaleTimeString()}
                </span>
                <div className="flex items-center space-x-1">
                  {renderAgentBadge(transition.from)}
                  <ArrowRight className="h-2 w-2" />
                  {renderAgentBadge(transition.to)}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};