
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import InlineEditableElement from './InlineEditableElement';
import TextSelectionTooltip from './TextSelectionTooltip';
import FollowUpDialog from './FollowUpDialog';
import { useTextSelection } from '@/hooks/useTextSelection';

interface InlineMarkdownEditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
  onSendMessage?: (message: string) => void;
  className?: string;
}

interface MarkdownSection {
  id: string;
  type: 'h1' | 'h2' | 'h3' | 'p' | 'li' | 'raw';
  content: string;
  originalLine: string;
}

const InlineMarkdownEditor: React.FC<InlineMarkdownEditorProps> = ({
  content,
  onContentChange,
  onSendMessage,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedText, selectionRect, isVisible, clearSelection, tooltipRef } = useTextSelection(containerRef);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [preservedText, setPreservedText] = useState('');

  // Parse markdown content into editable sections
  const sections = useMemo(() => {
    const lines = content.split('\n');
    const parsedSections: MarkdownSection[] = [];
    let currentId = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('# ')) {
        parsedSections.push({
          id: `section-${currentId++}`,
          type: 'h1',
          content: trimmedLine.substring(2),
          originalLine: line
        });
      } else if (trimmedLine.startsWith('## ')) {
        parsedSections.push({
          id: `section-${currentId++}`,
          type: 'h2',
          content: trimmedLine.substring(3),
          originalLine: line
        });
      } else if (trimmedLine.startsWith('### ')) {
        parsedSections.push({
          id: `section-${currentId++}`,
          type: 'h3',
          content: trimmedLine.substring(4),
          originalLine: line
        });
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        parsedSections.push({
          id: `section-${currentId++}`,
          type: 'li',
          content: trimmedLine.substring(2),
          originalLine: line
        });
      } else if (trimmedLine && !trimmedLine.startsWith('```')) {
        parsedSections.push({
          id: `section-${currentId++}`,
          type: 'p',
          content: trimmedLine,
          originalLine: line
        });
      } else {
        // Keep raw content for code blocks, empty lines, etc.
        parsedSections.push({
          id: `section-${currentId++}`,
          type: 'raw',
          content: line,
          originalLine: line
        });
      }
    });

    return parsedSections;
  }, [content]);

  // Update a specific section and rebuild the markdown
  const updateSection = useCallback((sectionId: string, newContent: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        let newLine = '';
        switch (section.type) {
          case 'h1':
            newLine = `# ${newContent}`;
            break;
          case 'h2':
            newLine = `## ${newContent}`;
            break;
          case 'h3':
            newLine = `### ${newContent}`;
            break;
          case 'li':
            newLine = `- ${newContent}`;
            break;
          case 'p':
            newLine = newContent;
            break;
          default:
            newLine = newContent;
        }
        return { ...section, content: newContent, originalLine: newLine };
      }
      return section;
    });

    const newMarkdown = updatedSections.map(s => s.originalLine).join('\n');
    onContentChange(newMarkdown);
  }, [sections, onContentChange]);

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

  const handleFollowUpSubmit = (question: string) => {
    if (onSendMessage && selectedText) {
      const formattedMessage = `Regarding: "${selectedText}"\n\n${question}`;
      onSendMessage(formattedMessage);
    }
    clearSelection();
  };

  const handleTooltipClose = () => {
    clearSelection();
  };

  return (
    <div 
      ref={containerRef}
      className={cn("inline-markdown-editor", className)}
      style={{ 
        userSelect: 'text',
        WebkitUserSelect: 'text',
        MozUserSelect: 'text',
        msUserSelect: 'text'
      }}
    >
      <div className="space-y-1">
        {sections.map((section) => {
          if (section.type === 'raw') {
            // Render raw content (code blocks, empty lines, etc.) as-is
            if (section.content.trim() === '') {
              return <div key={section.id} className="h-4" />;
            }
            return (
              <pre key={section.id} className="whitespace-pre-wrap font-mono text-sm bg-muted p-2 rounded">
                {section.content}
              </pre>
            );
          }

          if (section.type === 'li') {
            return (
              <div key={section.id} className="flex items-start">
                <span className="mr-2 mt-1">•</span>
                <InlineEditableElement
                  content={section.content}
                  element={section.type}
                  onSave={(newContent) => updateSection(section.id, newContent)}
                  className="flex-1"
                />
              </div>
            );
          }

          return (
            <InlineEditableElement
              key={section.id}
              content={section.content}
              element={section.type}
              onSave={(newContent) => updateSection(section.id, newContent)}
            />
          );
        })}
      </div>

      {/* Text Selection Tooltip */}
      {isVisible && selectionRect && selectedText && !showFollowUpDialog && onSendMessage && (
        <TextSelectionTooltip
          rect={selectionRect}
          onFollowUp={handleFollowUpSubmit}
          onClose={handleTooltipClose}
          tooltipRef={tooltipRef}
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

export default InlineMarkdownEditor;
