
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
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitializedRef = useRef(false);
  
  const { selectedText, selectionRect, isVisible, clearSelection } = useTextSelection(containerRef);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [preservedText, setPreservedText] = useState('');

  // Initialize conversion libraries
  const turndownService = useCallback(() => {
    const service = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
    
    // Configure turndown to handle common elements properly
    service.addRule('lineBreak', {
      filter: 'br',
      replacement: () => '\n'
    });
    
    return service;
  }, []);

  // Convert markdown to HTML for display
  const markdownToHtml = useCallback(async (markdown: string): Promise<string> => {
    try {
      console.log('Converting markdown to HTML:', markdown.substring(0, 100) + '...');
      
      // Configure marked for better HTML output
      marked.setOptions({
        breaks: true,
        gfm: true
      });
      
      const html = await marked(markdown);
      console.log('Converted HTML:', html.substring(0, 100) + '...');
      return html;
    } catch (error) {
      console.error('Error converting markdown to HTML:', error);
      // Fallback: return the original markdown wrapped in a paragraph
      return `<p>${markdown}</p>`;
    }
  }, []);

  // Convert HTML back to markdown
  const htmlToMarkdown = useCallback((html: string): string => {
    try {
      console.log('Converting HTML to markdown:', html.substring(0, 100) + '...');
      
      const service = turndownService();
      const markdown = service.turndown(html);
      
      console.log('Converted markdown:', markdown.substring(0, 100) + '...');
      return markdown.trim();
    } catch (error) {
      console.error('Error converting HTML to markdown:', error);
      // Fallback: try to extract text content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || html;
    }
  }, [turndownService]);

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
        throw error;
      } else {
        setLastSavedContent(contentToSave);
        console.log('SeamlessMarkdownEditor: Auto-save successful');
      }
    } catch (error) {
      console.error('SeamlessMarkdownEditor: Auto-save error:', error);
      throw error;
    } finally {
      setIsAutoSaving(false);
    }
  }, [documentId, lastSavedContent, title]);

  // Initialize editor content only once
  useEffect(() => {
    const initializeEditor = async () => {
      if (editorRef.current && content && !isInitializedRef.current) {
        try {
          const html = await markdownToHtml(content);
          editorRef.current.innerHTML = html;
          setLastSavedContent(content);
          isInitializedRef.current = true;
          console.log('SeamlessMarkdownEditor: Editor initialized with HTML');
        } catch (error) {
          console.error('SeamlessMarkdownEditor: Failed to initialize editor:', error);
          // Fallback: set content as plain text
          if (editorRef.current) {
            editorRef.current.textContent = content;
            isInitializedRef.current = true;
          }
        }
      }
    };

    initializeEditor();
  }, [content, markdownToHtml]);

  // Set up input event listener for uncontrolled editing
  useEffect(() => {
    const editorElement = editorRef.current;
    if (!editorElement) return;

    let saveTimeout: NodeJS.Timeout;

    const handleInput = () => {
      try {
        const htmlContent = editorElement.innerHTML;
        console.log('SeamlessMarkdownEditor: Content changed, converting to markdown');
        
        const markdownContent = htmlToMarkdown(htmlContent);
        
        // Update parent component immediately for AI interactions
        onContentChange(markdownContent);
        
        // Debounced auto-save
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(async () => {
          try {
            await saveToServer(markdownContent);
          } catch (error) {
            console.error('SeamlessMarkdownEditor: Save failed:', error);
          }
        }, 1000);
      } catch (error) {
        console.error('SeamlessMarkdownEditor: Error handling input:', error);
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
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          Saving...
        </div>
      )}

      {/* Main editable content - now uncontrolled */}
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
