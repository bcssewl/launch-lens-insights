"use client";

import { useState, useEffect, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useToast } from "@/hooks/use-toast";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Link,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Sparkles,
  ArrowDownWideNarrow,
  WrapText,
  RefreshCcwDot,
  Loader2,
  Check,
  X,
  Languages
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReportEditorProps {
  content?: string;
  onMarkdownChange?: (markdown: string) => void;
}

const ReportEditor = ({ content = "", onMarkdownChange }: ReportEditorProps) => {
  const [editorContent, setEditorContent] = useState(content);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [selectedText, setSelectedText] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [showAIPopover, setShowAIPopover] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [translateLanguage, setTranslateLanguage] = useState("english");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const debouncedUpdates = useDebouncedCallback(
    (newContent: string) => {
      if (onMarkdownChange) {
        onMarkdownChange(newContent);
      }
      setSaveStatus("Saved");
    },
    500,
  );

  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  const handleContentChange = (newContent: string) => {
    setEditorContent(newContent);
    setSaveStatus("Unsaved");
    debouncedUpdates(newContent);
  };

  const handleSelectionChange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = editorContent.substring(start, end);

    setSelectionStart(start);
    setSelectionEnd(end);
    setSelectedText(selected);
    
    // Show AI popover if there's selected text
    if (selected.length > 0) {
      setShowAIPopover(true);
    } else {
      setShowAIPopover(false);
    }
  };

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorContent.substring(start, end);
    
    const beforeText = editorContent.substring(0, start);
    const afterText = editorContent.substring(end);
    
    const newContent = beforeText + prefix + selectedText + suffix + afterText;
    setEditorContent(newContent);
    handleContentChange(newContent);

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // AI Enhancement Functions
  const enhanceTextWithAI = async (action: string, customCommand?: string) => {
    if (!selectedText.trim()) {
      toast({
        title: "No text selected",
        description: "Please select some text to enhance with AI",
        variant: "destructive"
      });
      return;
    }

    setAiLoading(true);
    try {
      // Prepare the request payload based on the action
      let option = "";
      let command = "";
      
      switch (action) {
        case "improve":
          option = "polish";
          break;
        case "shorter":
          option = "summarize";
          break;
        case "longer":
          option = "expand";
          break;
        case "translate":
          option = "translate";
          command = translateLanguage;
          break;
        case "custom":
          option = "rewrite";
          command = customCommand || "";
          break;
        default:
          option = "polish";
      }

      // Make actual API call to /api/prose/generate
      const response = await fetch('/api/prose/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: selectedText, // The exact selected text
          option: option,       // The transformation type
          ...(command && { command: command }) // Optional extra instruction
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      // The API returns a single string with the generated prose
      const enhancedText = await response.text();
      
      setAiSuggestion(enhancedText);
      
    } catch (error) {
      console.error('AI Enhancement Error:', error);
      toast({
        title: "AI Enhancement Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = () => {
    if (!aiSuggestion) return;

    const beforeText = editorContent.substring(0, selectionStart);
    const afterText = editorContent.substring(selectionEnd);
    const newContent = beforeText + aiSuggestion + afterText;
    
    setEditorContent(newContent);
    handleContentChange(newContent);
    
    setAiSuggestion("");
    setShowAIPopover(false);
    
    toast({
      title: "AI suggestion applied",
      description: "Your text has been enhanced"
    });
  };

  const discardAISuggestion = () => {
    setAiSuggestion("");
    setCustomPrompt("");
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertFormatting("**", "**"), title: "Bold" },
    { icon: Italic, action: () => insertFormatting("*", "*"), title: "Italic" },
    { icon: Underline, action: () => insertFormatting("<u>", "</u>"), title: "Underline" },
    { icon: Strikethrough, action: () => insertFormatting("~~", "~~"), title: "Strikethrough" },
    { icon: Code, action: () => insertFormatting("`", "`"), title: "Inline Code" },
    { icon: Heading1, action: () => insertFormatting("# "), title: "Heading 1" },
    { icon: Heading2, action: () => insertFormatting("## "), title: "Heading 2" },
    { icon: Heading3, action: () => insertFormatting("### "), title: "Heading 3" },
    { icon: List, action: () => insertFormatting("- "), title: "Bullet List" },
    { icon: ListOrdered, action: () => insertFormatting("1. "), title: "Numbered List" },
    { icon: Quote, action: () => insertFormatting("> "), title: "Quote" },
    { icon: Link, action: () => insertFormatting("[", "](url)"), title: "Link" },
  ];

  const aiActions = [
    { id: "improve", label: "Polish writing", icon: RefreshCcwDot },
    { id: "shorter", label: "Summarize", icon: ArrowDownWideNarrow },
    { id: "longer", label: "Expand details", icon: WrapText },
    { id: "translate", label: "Translate to English", icon: Languages },
  ];

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-4 p-2 border-b">
        <h4 className="text-lg font-semibold">Edit Report</h4>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${saveStatus === "Saved" ? "text-green-600" : "text-yellow-600"}`}>
            {saveStatus}
          </span>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="border border-muted bg-background/95 backdrop-blur rounded-t-lg flex items-center gap-1 p-2 flex-wrap">
        {toolbarButtons.map((button, index) => (
          <div key={index} className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={button.action}
              title={button.title}
              className="h-8 w-8 p-0"
            >
              <button.icon className="h-4 w-4" />
            </Button>
            {(index === 4 || index === 7 || index === 10) && (
              <Separator orientation="vertical" className="h-6 mx-1" />
            )}
          </div>
        ))}
        
        {/* AI Enhancement Button */}
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Popover open={showAIPopover} onOpenChange={setShowAIPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!selectedText}
              className={cn(
                "h-8 gap-1 text-purple-600",
                selectedText && "bg-purple-50 dark:bg-purple-950/20"
              )}
            >
              <Sparkles className="h-4 w-4" />
              Ask AI
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4">
              {aiSuggestion ? (
                // AI Suggestion Display
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-sm">AI Suggestion</span>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md text-sm">
                    {aiSuggestion}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={applyAISuggestion} className="flex-1">
                      <Check className="h-4 w-4 mr-1" />
                      Apply
                    </Button>
                    <Button size="sm" variant="outline" onClick={discardAISuggestion}>
                      <X className="h-4 w-4 mr-1" />
                      Discard
                    </Button>
                  </div>
                </div>
              ) : (
                // AI Actions Menu
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-sm">Enhance with AI</span>
                  </div>
                  
                  {aiLoading ? (
                    <div className="flex items-center gap-2 p-3 text-sm text-purple-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI is thinking...
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        {aiActions.map((action) => (
                          <div key={action.id}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => enhanceTextWithAI(action.id)}
                              className="w-full justify-start gap-2"
                            >
                              <action.icon className="h-4 w-4 text-purple-600" />
                              {action.label}
                            </Button>
                            {action.id === "translate" && (
                              <div className="ml-6 mt-1">
                                <select
                                  value={translateLanguage}
                                  onChange={(e) => setTranslateLanguage(e.target.value)}
                                  className="w-full p-1 border rounded text-xs"
                                >
                                  <option value="english">English</option>
                                  <option value="spanish">Spanish</option>
                                  <option value="french">French</option>
                                  <option value="german">German</option>
                                  <option value="chinese">Chinese</option>
                                  <option value="japanese">Japanese</option>
                                  <option value="arabic">Arabic</option>
                                </select>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Custom instruction..."
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customPrompt.trim()) {
                              enhanceTextWithAI("custom", customPrompt);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => enhanceTextWithAI("custom", customPrompt)}
                          disabled={!customPrompt.trim()}
                          className="w-full"
                        >
                          Apply custom instruction
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="report-editor"
          value={editorContent}
          onChange={(e) => handleContentChange(e.target.value)}
          onSelect={handleSelectionChange}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          className={cn(
            "w-full min-h-[500px] p-4 border border-t-0 border-muted rounded-b-lg",
            "bg-background text-foreground",
            "resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "font-mono text-sm leading-relaxed",
            "transition-colors duration-200"
          )}
          placeholder="Start editing your research report... Select text and use the AI button to enhance it with artificial intelligence."
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
        />
      </div>

      {/* Help text */}
      <div className="mt-2 text-xs text-muted-foreground">
        <p>💡 <strong>AI Enhancement:</strong> Select any text and click "Ask AI" to improve, shorten, expand, or apply custom instructions.</p>
        <p>📝 <strong>Markdown:</strong> Type directly (e.g., **bold**, *italic*, `code`) or use toolbar buttons.</p>
      </div>
    </div>
  );
};

export default ReportEditor;
