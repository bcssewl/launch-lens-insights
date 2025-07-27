import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Send, 
  Sparkles, 
  Brain, 
  Search, 
  Settings, 
  FileText,
  Loader2 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeerFlowStore } from "@/stores/deerFlowStore";
import { useStreamingChat } from "@/hooks/useStreamingChat";

interface InputBoxProps {
  onSendMessage: (message: string) => void;
}

export const InputBox = ({ onSendMessage }: InputBoxProps) => {
  const {
    currentPrompt,
    setCurrentPrompt,
    isResponding,
    settings,
    updateSettings,
  } = useDeerFlowStore();

  const { enhancePrompt } = useStreamingChat();
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPrompt.trim() && !isResponding) {
      onSendMessage(currentPrompt);
      setCurrentPrompt("");
    }
  };

  const handleEnhancePrompt = async () => {
    if (!currentPrompt.trim()) return;
    
    setIsEnhancing(true);
    try {
      const enhancedPrompt = await enhancePrompt(currentPrompt);
      setCurrentPrompt(enhancedPrompt);
    } catch (error) {
      console.error("Error enhancing prompt:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent className="p-4 space-y-4">
        {/* Settings Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="deep-thinking"
                checked={settings.deepThinking}
                onCheckedChange={(checked) =>
                  updateSettings({ deepThinking: checked })
                }
              />
              <Label htmlFor="deep-thinking" className="flex items-center space-x-1">
                <Brain className="h-4 w-4" />
                <span>Deep Thinking</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="background-investigation"
                checked={settings.backgroundInvestigation}
                onCheckedChange={(checked) =>
                  updateSettings({ backgroundInvestigation: checked })
                }
              />
              <Label htmlFor="background-investigation" className="flex items-center space-x-1">
                <Search className="h-4 w-4" />
                <span>Background Investigation</span>
              </Label>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                {settings.reportStyle}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => updateSettings({ reportStyle: "detailed" })}
              >
                Detailed Report
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateSettings({ reportStyle: "summary" })}
              >
                Summary Report
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateSettings({ reportStyle: "technical" })}
              >
                Technical Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Textarea
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="min-h-[60px] max-h-[200px] resize-none pr-24"
              disabled={isResponding}
            />
            
            {/* Enhance Prompt Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-2 right-14"
              onClick={handleEnhancePrompt}
              disabled={!currentPrompt.trim() || isEnhancing || isResponding}
            >
              {isEnhancing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>

            {/* Send Button */}
            <Button
              type="submit"
              size="sm"
              className="absolute bottom-2 right-2"
              disabled={!currentPrompt.trim() || isResponding}
            >
              {isResponding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Input Status */}
          {isResponding && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};