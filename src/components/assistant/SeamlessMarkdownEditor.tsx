import React, { useRef, useEffect, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import TextSelectionTooltip from './TextSelectionTooltip';
import FollowUpDialog from './FollowUpDialog';
import { useTextSelection } from '@/hooks/useTextSelection';
import { supabase } from '@/integrations/supabase/client';
import { marked } from 'marked';
import TurndownService from 'turndown';

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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState(content);
  const isInitializedRef = useRef(false);
  
  const { selectedText, selectionRect, isVisible, clearSelection } = useTextSelection(containerRef);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [preservedText, setPreservedText] = useState('');

  // Configure marked for consistent HTML output
  const configureMarked = useCallback(() => {
    marked.setOptions({
      breaks: true,
      gfm: true
    });
  }, []);

  // Configure turndown for consistent markdown output
  const createTurndownService = useCallback(() => {
    const service = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      fence: '```',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined',
      linkReferenceStyle: 'full'
    });
    
    // Add custom rules for better conversion
    service.addRule('lineBreak', {
      filter: 'br',
      replacement: () => '\n'
    });

    // Handle paragraphs properly
    service.addRule('paragraph', {
      filter: 'p',
      replacement: (content) => {
        return content ? '\n\n' + content + '\n\n' : '';
      }
    });
    
    return service;
  }, []);

  // Convert markdown to HTML for display - only called once on load
  const markdownToHtml = useCallback(async (markdown: string): Promise<string> => {
    if (!markdown.trim()) return '<p></p>';
    
    try {
      configureMarked();
      console.log('Converting markdown to HTML for display');
      const html = await marked(markdown.trim());
      return html;
    } catch (error) {
      console.error('Error converting markdown to HTML:', error);
      // Fallback: wrap in paragraph
      return `<p>${markdown}</p>`;
    }
  }, [configureMarked]);

  // Convert HTML back to markdown for storage - only called on save
  const htmlToMarkdown = useCallback((html: string): string => {
    if (!html.trim()) return '';
    
    try {
      console.log('Converting HTML to markdown for storage');
      const service = createTurndownService();
      const markdown = service.turndown(html);
      return markdown.trim();
    } catch (error) {
      console.error('Error converting HTML to markdown:', error);
      // Fallback: extract text content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    }
  }, [createTurndownService]);

  // Auto-save functionality with proper error handling
  const saveToServer = useCallback(async (markdownContent: string) => {
    if (!documentId || markdownContent === lastSavedContent) {
      console.log('Skipping save - no changes or no document ID');
      return;
    }
    
    console.log('Auto-saving content to server');
    setIsAutoSaving(true);
    
    try {
      const { error } = await supabase
        .from('canvas_documents')
        .update({ 
          content: markdownContent,
          title: title,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) {
        console.error('Auto-save failed:', error);
        throw error;
      }
      
      setLastSavedContent(markdownContent);
      console.log('Auto-save successful');
    } catch (error) {
      console.error('Auto-save error:', error);
      // Don't throw - just log the error to avoid breaking the UI
    } finally {
      setIsAutoSaving(false);
    }
  }, [documentId, lastSavedContent, title]);

  // Initialize editor content once when component mounts
  useEffect(() => {
    const initializeEditor = async () => {
      if (editorRef.current && content && !isInitializedRef.current) {
        try {
          console.log('Initializing editor with content:', content.substring(0, 100));
          const html = await markdownToHtml(content);
          editorRef.current.innerHTML = html;
          setLastSavedContent(content);
          isInitializedRef.current = true;
          console.log('Editor initialized successfully');
        } catch (error) {
          console.error('Failed to initialize editor:', error);
          // Fallback: set as plain text
          if (editorRef.current) {
            editorRef.current.textContent = content;
            isInitializedRef.current = true;
          }
        }
      }
    };

    initializeEditor();
  }, [content, markdownToHtml]);

  // Handle input changes with debounced saving
  useEffect(() => {
    const editorElement = editorRef.current;
    if (!editorElement) return;

    let saveTimeout: NodeJS.Timeout;

    const handleInput = () => {
      try {
        const htmlContent = editorElement.innerHTML;
        console.log('Content changed, processing...');
        
        // Convert to markdown for storage and parent update
        const markdownContent = htmlToMarkdown(htmlContent);
        
        // Immediately update parent component for AI interactions
        onContentChange(markdownContent);
        
        // Debounced auto-save to server
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          saveToServer(markdownContent);
        }, 2000); // 2 second delay for better UX
      } catch (error) {
        console.error('Error handling input change:', error);
      }
    };

    editorElement.addEventListener('input', handleInput);
    
    return () => {
      editorElement.removeEventListener('input', handleInput);
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [htmlToMarkdown, onContentChange, saveToServer]);

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
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded z-10">
          Saving...
        </div>
      )}

      {/* Main editable content */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-96 focus:outline-none prose prose-gray dark:prose-invert max-w-none"
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
