import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Send, Sparkles, ChevronDown } from 'lucide-react';
import { useDeerFlowStore } from '@/stores/deerFlowStore';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { ResourceSuggestion } from './ResourceSuggestion';

interface EnhancedMessageInputProps {
  onSendMessage: (message: string) => void;
}

export const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({ onSendMessage }) => {
  const { 
    isResponding, 
    settings, 
    updateSettings,
    researchActivities 
  } = useDeerFlowStore();
  const { enhancePrompt } = useStreamingChat();

  // Mock resource search - in real implementation, this would search through research activities and documents
  const handleResourceSearch = useCallback(async (query: string) => {
    // Filter research activities based on query
    const matchingActivities = researchActivities
      .filter(activity => 
        activity.title.toLowerCase().includes(query.toLowerCase()) ||
        (activity.content && JSON.stringify(activity.content).toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 5)
      .map(activity => ({
        id: activity.id,
        title: activity.title,
        type: 'search_result' as const,
        url: activity.toolType === 'web-search' ? 'Web Search Result' : undefined
      }));

    // Add some default suggestions if no matches
    if (matchingActivities.length === 0 && query.length > 0) {
      return [
        {
          id: 'search-' + query,
          title: `Search for "${query}"`,
          type: 'search_result' as const
        }
      ];
    }

    return matchingActivities;
  }, [researchActivities]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        horizontalRule: false,
        listItem: false,
        orderedList: false,
        bulletList: false,
      }),
      Placeholder.configure({
        placeholder: 'Ask me anything or use @ to cite research results...',
      }),
      ResourceSuggestion.configure({
        onSearch: handleResourceSearch,
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[100px] p-4',
      },
    },
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editor) return;
    
    const content = editor.getText().trim();
    if (!content || isResponding) return;
    
    onSendMessage(content);
    editor.commands.clearContent();
  }, [editor, isResponding, onSendMessage]);

  const handleEnhancePrompt = useCallback(async () => {
    if (!editor) return;
    
    const content = editor.getText().trim();
    if (!content) return;
    
    try {
      const enhanced = await enhancePrompt(content);
      if (enhanced) {
        editor.commands.setContent(enhanced);
      }
    } catch (error) {
      console.error('Failed to enhance prompt:', error);
    }
  }, [editor, enhancePrompt]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const reportStyleOptions = [
    { value: 'academic', label: 'Academic' },
    { value: 'popular_science', label: 'Popular Science' },
    { value: 'news', label: 'News' },
    { value: 'social_media', label: 'Social Media' }
  ];

  return (
    <Card className="border-t border-border/40 rounded-none bg-background/80 backdrop-blur-sm">
      <div className="p-4 space-y-4">
        {/* Settings Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="deep-thinking"
                checked={settings.deepThinking}
                onCheckedChange={(checked) => updateSettings({ deepThinking: checked })}
                disabled={isResponding}
              />
              <Label htmlFor="deep-thinking" className="text-sm font-medium">
                Deep Thinking
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="background-investigation"
                checked={settings.backgroundInvestigation}
                onCheckedChange={(checked) => updateSettings({ backgroundInvestigation: checked })}
                disabled={isResponding}
              />
              <Label htmlFor="background-investigation" className="text-sm font-medium">
                Background Investigation
              </Label>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                {reportStyleOptions.find(opt => opt.value === settings.reportStyle)?.label}
                <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border border-border z-50">
              {reportStyleOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => updateSettings({ reportStyle: option.value as any })}
                  className="hover:bg-accent hover:text-accent-foreground"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div 
            className="min-h-[100px] rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
            onKeyDown={handleKeyDown}
          >
            <EditorContent editor={editor} />
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEnhancePrompt}
              disabled={isResponding || !editor?.getText().trim()}
              className="h-8"
            >
              <Sparkles className="mr-2 h-3 w-3" />
              Enhance Prompt
            </Button>
            
            <Button
              type="submit"
              disabled={isResponding || !editor?.getText().trim()}
              size="sm"
              className="h-8"
            >
              {isResponding ? (
                <span className="text-sm">AI is thinking...</span>
              ) : (
                <>
                  <Send className="mr-2 h-3 w-3" />
                  Send
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};