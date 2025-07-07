import React, { useRef, useEffect, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import TextSelectionTooltip from './TextSelectionTooltip';
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
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { selectedText, selectionRect, isVisible, clearSelection, tooltipRef } = useTextSelection(containerRef);

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
    
    service.addRule('lineBreak', {
      filter: 'br',
      replacement: () => '\n'
    });

    service.addRule('paragraph', {
      filter: 'p',
      replacement: (content) => {
        return content ? '\n\n' + content + '\n\n' : '';
      }
    });
    
    return service;
  }, []);

  // Convert markdown to HTML for display
  const markdownToHtml = useCallback(async (markdown: string): Promise<string> => {
    if (!markdown.trim()) return '<p></p>';
    
    try {
      configureMarked();
      console.log('Converting markdown to HTML for display');
      const html = await marked(markdown.trim());
      return html;
    } catch (error) {
      console.error('Error converting markdown to HTML:', error);
      return `<p>${markdown}</p>`;
    }
  }, [configureMarked]);

  // Convert HTML back to markdown for storage
  const htmlToMarkdown = useCallback((html: string): string => {
    if (!html.trim()) return '';
    
    try {
      console.log('Converting HTML to markdown for storage');
      const service = createTurndownService();
      const markdown = service.turndown(html);
      return markdown.trim();
    } catch (error) {
      console.error('Error converting HTML to markdown:', error);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    }
  }, [createTurndownService]);

  // Auto-save functionality with proper error handling
  const saveToServer = useCallback(async (markdownContent: string) => {
    if (!documentId) {
      console.log('No document ID available for saving');
      return;
    }

    if (markdownContent === lastSavedContent) {
      console.log('No changes detected, skipping save');
      return;
    }
    
    console.log('Auto-saving content to server, document ID:', documentId);
    setIsAutoSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated for saving');
        return;
      }

      const { error } = await supabase
        .from('canvas_documents')
        .update({ 
          content: markdownContent,
          title: title,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .eq('created_by', user.id);

      if (error) {
        console.error('Auto-save failed:', error);
        throw error;
      }
      
      setLastSavedContent(markdownContent);
      console.log('Auto-save successful for document:', documentId);
    } catch (error) {
      console.error('Auto-save error:', error);
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

    const handleInput = () => {
      try {
        const htmlContent = editorElement.innerHTML;
        console.log('Content changed in editor');
        
        // Convert to markdown for storage and parent update
        const markdownContent = htmlToMarkdown(htmlContent);
        console.log('Converted to markdown, length:', markdownContent.length);
        
        // Immediately update parent component
        onContentChange(markdownContent);
        
        // Clear existing timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        
        // Set new debounced save
        saveTimeoutRef.current = setTimeout(() => {
          console.log('Triggering auto-save after debounce');
          saveToServer(markdownContent);
        }, 1000);
      } catch (error) {
        console.error('Error handling input change:', error);
      }
    };

    editorElement.addEventListener('input', handleInput);
    
    return () => {
      editorElement.removeEventListener('input', handleInput);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [htmlToMarkdown, onContentChange, saveToServer]);

  // Handle follow-up inline input
  const handleFollowUp = (question: string) => {
    if (onSendMessage && selectedText) {
      const formattedMessage = `Regarding: "${selectedText}"\n\n${question}`;
      onSendMessage(formattedMessage);
    }
    clearSelection();
  };

  const handleClose = () => {
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
      {isVisible && selectionRect && selectedText && onSendMessage && (
        <TextSelectionTooltip
          rect={selectionRect}
          onFollowUp={handleFollowUp}
          onClose={handleClose}
          tooltipRef={tooltipRef}
        />
      )}
    </div>
  );
};

export default SeamlessMarkdownEditor;
