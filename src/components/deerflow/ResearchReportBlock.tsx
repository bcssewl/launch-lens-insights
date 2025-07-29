import React, { useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { useDeerFlowMessageStore, useMessage } from '@/stores/deerFlowMessageStore';
import { ReportEditor } from './ReportEditor';
import { LoadingAnimation } from './LoadingAnimation';
import { ReportControls } from './ReportControls';
import { useToast } from '@/hooks/use-toast';

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
  const { updateMessage, listenToPodcast } = useDeerFlowMessageStore();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(editing);
  const [copied, setCopied] = useState(false);
  
  const handleMarkdownChange = useCallback((markdown: string) => {
    if (message) {
      updateMessage(message.id, { content: markdown });
    }
  }, [message, updateMessage]);
  
  const isCompleted = message?.isStreaming === false && message?.content !== "";
  const isStreaming = message?.isStreaming || false;

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleCopy = async () => {
    if (message?.content) {
      try {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Copied to clipboard",
          description: "Report content has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "Unable to copy to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const handleGeneratePodcast = async () => {
    if (researchId) {
      try {
        toast({
          title: "API Key Required",
          description: "Please add your ElevenLabs API key to generate podcasts.",
          variant: "destructive",
        });
        // await listenToPodcast(researchId);
      } catch (error) {
        console.error('Podcast generation failed:', error);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative w-full pt-4 pb-8 ${className || ''}`}
    >
      {/* Report Controls */}
      {isCompleted && (
        <ReportControls
          reportId={messageId}
          content={message?.content || ''}
          title={`Research Report ${messageId.slice(0, 8)}`}
          editing={isEditing}
          onToggleEdit={handleToggleEdit}
          onCopy={handleCopy}
          onGeneratePodcast={handleGeneratePodcast}
          copied={copied}
        />
      )}
      
      {/* Report Content */}
      {isCompleted && isEditing ? (
        <ReportEditor
          content={message?.content || ''}
          onMarkdownChange={handleMarkdownChange}
        />
      ) : (
        <>
          <ReportEditor
            content={message?.content || ''}
            onMarkdownChange={handleMarkdownChange}
            isStreaming={isStreaming}
            animated={isStreaming}
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