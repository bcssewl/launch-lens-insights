import React, { forwardRef, useMemo, useCallback } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import { Extension } from '@tiptap/core';
import { useDebouncedCallback } from 'use-debounce';
import { useDeerFlowMessageStore } from '@/stores/deerFlowMessageStore';
import { cn } from '@/lib/utils';

export interface NovelMessageInputRef {
  focus: () => void;
  submit: () => void;
  setContent: (content: string) => void;
}

export interface Resource {
  uri: string;
  title: string;
}

export interface NovelMessageInputProps {
  className?: string;
  placeholder?: string;
  loading?: boolean;
  onChange?: (markdown: string) => void;
  onEnter?: (message: string, resources: Array<Resource>) => void;
  onUserInput?: () => void;
}

interface JSONContent {
  type?: string;
  text?: string;
  content?: JSONContent[];
  attrs?: Record<string, any>;
}

function formatMessage(content: JSONContent): {
  text: string;
  resources: Array<Resource>;
} {
  if (content.content) {
    const output: {
      text: string;
      resources: Array<Resource>;
    } = {
      text: "",
      resources: [],
    };
    for (const node of content.content) {
      const { text, resources } = formatMessage(node);
      output.text += text;
      output.resources.push(...resources);
    }
    return output;
  } else {
    return formatItem(content);
  }
}

function formatItem(item: JSONContent): {
  text: string;
  resources: Array<Resource>;
} {
  if (item.type === "text") {
    return { text: item.text ?? "", resources: [] };
  }
  if (item.type === "mention") {
    return {
      text: `[${item.attrs?.label}](${item.attrs?.id})`,
      resources: [
        { uri: item.attrs?.id ?? "", title: item.attrs?.label ?? "" },
      ],
    };
  }
  if (item.type === "paragraph" || item.type === "doc") {
    const output = { text: "", resources: [] as Resource[] };
    if (item.content) {
      for (const child of item.content) {
        const { text, resources } = formatItem(child);
        output.text += text;
        output.resources.push(...resources);
      }
    }
    if (item.type === "paragraph") {
      output.text += "\n";
    }
    return output;
  }
  return { text: "", resources: [] };
}

const NovelMessageInput = forwardRef<NovelMessageInputRef, NovelMessageInputProps>(
  (
    { className, loading, onChange, onEnter, onUserInput, placeholder = "What can I do for you?" }: NovelMessageInputProps,
    ref,
  ) => {
    const { isResponding } = useDeerFlowMessageStore();
    
    const debouncedUpdates = useDebouncedCallback(
      async (editor: Editor) => {
        if (onChange) {
          // Get the plain text content for prompt enhancement
          const { text } = formatMessage(editor.getJSON() ?? {});
          onChange(text);
        }
      },
      200,
    );

    const extensions = useMemo(() => {
      const extensions = [
        StarterKit,
        Placeholder.configure({
          placeholder: placeholder,
          emptyEditorClass: 'is-editor-empty',
        }),
        Extension.create({
          name: "keyboardHandler",
          addKeyboardShortcuts() {
            return {
              'Enter': () => {
                if (onEnter && this.editor) {
                  const { text, resources } = formatMessage(
                    this.editor.getJSON() ?? {},
                  );
                  if (text.trim()) {
                    onEnter(text.trim(), resources);
                    this.editor.commands.clearContent();
                    return true;
                  }
                }
                return false;
              },
              'Shift-Enter': () => {
                return this.editor?.commands.first([
                  () => this.editor.commands.newlineInCode(),
                  () => this.editor.commands.splitBlock(),
                ]) ?? false;
              },
            };
          },
        }),
      ];
      
      // Add mention support for enhanced features
      extensions.push(
        Mention.configure({
          HTMLAttributes: {
            class: "mention",
          },
          suggestion: {
            items: ({ query }: { query: string }) => {
              return [
                { id: 'research-assistant', label: 'Research Assistant' },
                { id: 'data-analysis', label: 'Data Analysis' },
                { id: 'market-research', label: 'Market Research' },
                { id: 'competitive-analysis', label: 'Competitive Analysis' },
                { id: 'report-generation', label: 'Report Generation' }
              ].filter(item => item.label.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
            },
          },
        }),
      );
      
      return extensions;
    }, [placeholder, onEnter]);

    const editor = useEditor({
      extensions,
      editorProps: {
        attributes: {
          class:
            'prose prose-sm dark:prose-invert focus:outline-none max-w-full min-h-[2rem] max-h-[12rem] overflow-y-auto resize-none',
        },
      },
      onUpdate: ({ editor }) => {
        debouncedUpdates(editor);
        // Call onUserInput when user starts typing
        if (onUserInput && editor.getHTML() !== '<p></p>') {
          onUserInput();
        }
      },
    }, [extensions]);

    React.useImperativeHandle(ref, () => ({
      focus: () => {
        editor?.view.focus();
      },
      submit: () => {
        if (onEnter && editor) {
          const { text, resources } = formatMessage(
            editor.getJSON() ?? {},
          );
          if (text.trim()) {
            onEnter(text.trim(), resources);
            editor.commands.clearContent();
          }
        }
      },
      setContent: (content: string) => {
        if (editor) {
          editor.commands.setContent(content);
        }
      },
    }));

    if (loading) {
      return (
        <div className={className}>
          <div className="flex items-center justify-center h-12 text-muted-foreground">
            Loading...
          </div>
        </div>
      );
    }

    return (
      <div className={cn("w-full", className)}>
        <EditorContent 
          editor={editor}
          className="novel-editor-content"
        />
      </div>
    );
  },
);

NovelMessageInput.displayName = "NovelMessageInput";

export default NovelMessageInput;
