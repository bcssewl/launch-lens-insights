import React, { useCallback } from 'react';
import { motion } from 'motion/react';
import { useDeerFlowMessageStore, useMessage } from '@/stores/deerFlowMessageStore';
import { ReportEditor } from './ReportEditor';
import { LoadingAnimation } from './LoadingAnimation';

interface ResearchReportBlockProps {
  messageId: string;
  editing?: boolean;
  researchId?: string;
  className?: string;
}

export const ResearchReportBlock: React.FC<ResearchReportBlockProps> = ({ 
  messageId, 
  editing = false, 
  researchId,
  className 
}) => {
  const message = useMessage(messageId);
  const { updateMessage } = useDeerFlowMessageStore();
  
  const handleMarkdownChange = useCallback((markdown: string) => {
    if (message) {
      updateMessage(message.id, { content: markdown });
    }
  }, [message, updateMessage]);
  
  const isCompleted = message?.isStreaming === false && message?.content !== "";
  const isStreaming = message?.isStreaming || false;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`w-full pt-4 pb-8 ${className || ''}`}
    >
      {isCompleted && editing ? (
        <ReportEditor
          content={message?.content || ''}
          onMarkdownChange={handleMarkdownChange}
          isStreaming={isStreaming}
        />
      ) : (
        <>
          <ReportEditor
            content={message?.content || ''}
            onMarkdownChange={handleMarkdownChange}
            isStreaming={isStreaming}
          />
          
          {isStreaming && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-8"
            >
              <LoadingAnimation />
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};