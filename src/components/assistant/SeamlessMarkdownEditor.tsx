
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import TextSelectionTooltip from './TextSelectionTooltip';
import FollowUpDialog from './FollowUpDialog';
import { useTextSelection } from '@/hooks/useTextSelection';
import { supabase } from '@/integrations/supabase/client';

interface SeamlessMarkdownEditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
  onSendMessage?: (message: string) => void;
  className?: string;
  documentId?: string;
  title?: string;
}

const SeamlessMarkdownEditor: React.FC<SeamlessMarkdownEditorProps> = ({
  content,
  onContentChange,
  onSendMessage,
  className,
  documentId,
  title = "AI Report"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [draftContent, setDraftContent] = useState(content);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState(content);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { selectedText, selectionRect, isVisible, clearSelection } = useTextSelection(containerRef);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [preservedText, setPreservedText] = useState('');

  // Convert markdown to HTML for display
  const markdownToHtml = useCallback((markdown: string) => {
    return markdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^\- (.+)$/gm, '<ul><li>$1</li></ul>')
      .replace(/^\* (.+)$/gm, '<ul><li>$1</li></ul>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/<\/ul>\s*<ul>/g, '') // Merge consecutive lists
      .replace(/<p><h([1-6])>/g, '<h$1>') // Fix headers wrapped in p tags
      .replace(/<\/h([1-6])><\/p>/g, '</h$1>');
  }, []);

  // Convert HTML back to markdown
  const htmlToMarkdown = useCallback((html: string) => {
    return html
      .replace(/<h1[^>]*>(.+?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.+?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.+?)<\/h3>/gi, '### $1\n\n')
      .replace(/<strong[^>]*>(.+?)<\/strong>/gi, '**$1**')
      .replace(/<em[^>]*>(.+?)<\/em>/gi, '*$1*')
      .replace(/<code[^>]*>(.+?)<\/code>/gi, '`$1`')
      .replace(/<li[^>]*>(.+?)<\/li>/gi, '- $1\n')
      .replace(/<ul[^>]*>|<\/ul>/gi, '')
      .replace(/<p[^>]*>(.+?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .trim();
  }, []);

  // Auto-save functionality
  const saveToServer = useCallback(async (contentToSave: string) => {
    if (!documentId || contentToSave === lastSavedContent) return;
    
    console.log('SeamlessMarkdownEditor: Auto-saving content');
    setIsAutoSaving(true);
    
    try {
      const { error } = await supabase
        .from('canvas_documents')
        .update({ 
          content: contentToSave,
          title: title,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) {
        console.error('SeamlessMarkdownEditor: Auto-save failed:', error);
      } else {
        setLastSavedContent(contentToSave);
        console.log('SeamlessMarkdownEditor: Auto-save successful');
      }
    } catch (error) {
      console.error('SeamlessMarkdownEditor: Auto-save error:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [documentId, lastSavedContent, title]);

  // Debounced auto-save
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (draftContent !== lastSavedContent) {
      saveTimeoutRef.current = setTimeout(() => {
        saveToServer(draftContent);
      }, 1000); // 1 second debounce
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [draftContent, saveToServer, lastSavedContent]);

  // Update content when prop changes
  useEffect(() => {
    if (content !== draftContent && content !== lastSavedContent) {
      setDraftContent(content);
      setLastSavedContent(content);
      if (editorRef.current) {
        editorRef.current.innerHTML = markdownToHtml(content);
      }
    }
  }, [content, draftContent, lastSavedContent, markdownToHtml]);

  // Handle input changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      const markdownContent = htmlToMarkdown(htmlContent);
      setDraftContent(markdownContent);
      onContentChange(markdownContent);
    }
  }, [htmlToMarkdown, onContentChange]);

  // Handle follow-up dialog
  const handleFollowUp = () => {
    setPreservedText(selectedText);
    setShowFollowUpDialog(true);
  };

  const handleSubmitQuestion = (question: string) => {
    if (onSendMessage && preservedText) {
      const formattedMessage = `Regarding: "${preservedText}"\n\n${question}`;
      onSendMessage(formattedMessage);
    }
    handleDialogClose();
  };

  const handleDialogClose = () => {
    setShowFollowUpDialog(false);
    setPreservedText('');
    clearSelection();
  };

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = markdownToHtml(content);
    }
  }, [content, markdownToHtml]);

  return (
    <div 
      ref={containerRef}
      className={cn("seamless-markdown-editor relative", className)}
      style={{ 
        userSelect: 'text',
        WebkitUserSelect: 'text',
        MozUserSelect: 'text',
        msUserSelect: 'text'
      }}
    >
      {/* Auto-save indicator */}
      {isAutoSaving && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          Saving...
        </div>
      )}

      {/* Main editable content */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-96 focus:outline-none prose prose-gray dark:prose-invert max-w-none"
        onInput={handleInput}
        style={{
          fontSize: '16px',
          lineHeight: '1.7',
        }}
      />

      {/* Text Selection Tooltip */}
      {isVisible && selectionRect && selectedText && !showFollowUpDialog && onSendMessage && (
        <TextSelectionTooltip
          rect={selectionRect}
          onFollowUp={handleFollowUp}
        />
      )}

      {/* Follow-up Dialog */}
      {onSendMessage && (
        <FollowUpDialog
          isOpen={showFollowUpDialog}
          onClose={handleDialogClose}
          selectedText={preservedText}
          onSubmit={handleSubmitQuestion}
        />
      )}
    </div>
  );
};

export default SeamlessMarkdownEditor;
