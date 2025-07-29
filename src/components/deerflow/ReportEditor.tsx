import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Eye, Save, X, Undo2, Redo2, Type, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportEditorProps {
  content: string;
  onMarkdownChange: (markdown: string) => void;
  isStreaming?: boolean;
  className?: string;
}

// Enhanced markdown with link credibility checking
const EnhancedMarkdown: React.FC<{ children: string; animated?: boolean; checkLinkCredibility?: boolean }> = ({ 
  children, 
  animated = false, 
  checkLinkCredibility = false 
}) => {
  // Simple link credibility check (in real implementation, this would call an API)
  const checkLinkSafety = (url: string): 'safe' | 'suspicious' | 'unknown' => {
    if (!url) return 'unknown';
    
    // Simple heuristics for demo
    if (url.includes('.edu') || url.includes('.gov') || url.includes('wikipedia.org')) {
      return 'safe';
    }
    if (url.includes('bit.ly') || url.includes('tinyurl') || url.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/)) {
      return 'suspicious';
    }
    return 'unknown';
  };

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 10 } : {}}
      animate={animated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="prose prose-lg max-w-none dark:prose-invert"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Enhanced link component with credibility checking
          a: ({ href, children, ...props }) => {
            const safety = checkLinkCredibility ? checkLinkSafety(href || '') : 'unknown';
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "text-primary hover:text-primary/80 underline transition-colors",
                  checkLinkCredibility && safety === 'suspicious' && "text-orange-500 hover:text-orange-600",
                  checkLinkCredibility && safety === 'safe' && "text-green-600 hover:text-green-700"
                )}
                title={checkLinkCredibility ? `Link safety: ${safety}` : undefined}
                {...props}
              >
                {children}
                {checkLinkCredibility && safety === 'suspicious' && (
                  <span className="text-orange-500 text-xs ml-1">⚠️</span>
                )}
                {checkLinkCredibility && safety === 'safe' && (
                  <span className="text-green-600 text-xs ml-1">✓</span>
                )}
              </a>
            );
          },
          // Enhanced code blocks
          pre: ({ children, ...props }) => (
            <pre
              className="bg-muted p-4 rounded-lg overflow-x-auto border border-border"
              {...props}
            >
              {children}
            </pre>
          ),
          // Enhanced tables
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-border rounded-lg" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-border bg-muted p-3 text-left font-semibold" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border p-3" {...props}>
              {children}
            </td>
          ),
          // Enhanced headings with animations
          h1: ({ children, ...props }) => (
            <h1
              className="text-3xl font-bold mb-4 mt-8 first:mt-0"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="text-2xl font-semibold mb-3 mt-6"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className="text-xl font-medium mb-2 mt-4"
              {...props}
            >
              {children}
            </h3>
          ),
          // Enhanced paragraphs
          p: ({ children, ...props }) => (
            <p
              className="mb-4 leading-relaxed"
              {...props}
            >
              {children}
            </p>
          )
        }}
      >
        {children}
      </ReactMarkdown>
    </motion.div>
  );
};

export const ReportEditor: React.FC<ReportEditorProps> = ({ 
  content, 
  onMarkdownChange, 
  isStreaming = false,
  className 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('preview');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update edit content when content prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditContent(content);
      if (content !== history[historyIndex]) {
        setHistory([...history.slice(0, historyIndex + 1), content]);
        setHistoryIndex(historyIndex + 1);
      }
    }
  }, [content, isEditing]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(editContent !== content);
  }, [editContent, content]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          handleSave();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          handleCancel();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, editContent, historyIndex]);

  const handleSave = useCallback(() => {
    onMarkdownChange(editContent);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  }, [editContent, onMarkdownChange]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        return;
      }
    }
    setEditContent(content);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  }, [content, hasUnsavedChanges]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setEditContent(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setEditContent(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const addToHistory = useCallback((newContent: string) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newContent];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleContentChange = useCallback((value: string) => {
    setEditContent(value);
    
    // Add to history on significant changes (debounced)
    const timer = setTimeout(() => {
      if (value !== history[historyIndex]) {
        addToHistory(value);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [history, historyIndex, addToHistory]);

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={cn("space-y-4", className)}
      >
        {/* Editor Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Edit Report</h3>
            {hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-950 px-2 py-1 rounded-full"
              >
                Unsaved changes
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" onClick={handleCancel} size="sm">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {/* Editor Tabs */}
        <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="split" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Split
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className="min-h-[500px] font-mono text-sm resize-none"
              placeholder="Edit your markdown content here..."
            />
            <div className="text-sm text-muted-foreground">
              You can use Markdown syntax for formatting. Press Ctrl+S to save, Esc to cancel.
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-2">
            <Card className="p-6 min-h-[500px] border-dashed">
              <EnhancedMarkdown animated checkLinkCredibility>
                {editContent || '*Preview will appear here as you type...*'}
              </EnhancedMarkdown>
            </Card>
          </TabsContent>

          <TabsContent value="split" className="space-y-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Editor</h4>
                <Textarea
                  value={editContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[500px] font-mono text-sm resize-none"
                  placeholder="Edit your markdown content here..."
                />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Preview</h4>
                <Card className="p-4 min-h-[500px] overflow-auto border-dashed">
                  <EnhancedMarkdown checkLinkCredibility>
                    {editContent || '*Preview will appear here as you type...*'}
                  </EnhancedMarkdown>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-4", className)}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Research Report</h3>
        <Button variant="outline" onClick={() => setIsEditing(true)} size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit Report
        </Button>
      </div>
      
      <div className="relative">
        <EnhancedMarkdown animated checkLinkCredibility>
          {content}
        </EnhancedMarkdown>
        
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 my-8 text-muted-foreground"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm">Generating report...</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};