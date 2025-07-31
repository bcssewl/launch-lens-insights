import { Button } from "@/components/ui/button";
import { Plus, Settings, MessageSquare, Trash2, Languages, Github } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeerFlowStore } from "@/stores/deerFlowStore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const DeerFlowHeader = () => {
  const { 
    createNewThread, 
    clearMessages, 
    messages, 
    isResearchPanelOpen, 
    setResearchPanelOpen, 
    setSettingsOpen 
  } = useDeerFlowStore();
  const { toast } = useToast();

  const handleNewThread = () => {
    clearMessages();
    createNewThread();
    // Close research panel when starting new thread
    setResearchPanelOpen(false);
    toast({
      title: "New Thread Started",
      description: "Ready for a fresh conversation",
    });
  };

  return (
    <div className={cn(
      // Use platform's header styling
      "flex items-center justify-between",
      "px-4 sm:px-6 lg:px-8 py-4",
      "border-b border-border bg-background/95 backdrop-blur-sm",
      "min-h-[60px]" // Ensure consistent header height
    )}>
      {/* Left side - Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="w-4 h-4" />
        </div>
        <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          DeerFlow Research
        </h1>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Research Panel Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setResearchPanelOpen(!isResearchPanelOpen)}
          className={cn(
            "transition-colors duration-200",
            isResearchPanelOpen && "bg-muted text-foreground"
          )}
        >
          Research Panel
        </Button>

        {/* Clear Chat Button - only show if there are messages */}
        {messages.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewThread}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Clear Chat</span>
          </Button>
        )}

        {/* New Thread Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNewThread}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Thread</span>
        </Button>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Languages className="h-4 w-4" />
              <span className="sr-only">Language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>English</DropdownMenuItem>
            <DropdownMenuItem>Spanish</DropdownMenuItem>
            <DropdownMenuItem>French</DropdownMenuItem>
            <DropdownMenuItem>German</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* GitHub Link */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open("https://github.com", "_blank")}
        >
          <Github className="h-4 w-4" />
          <span className="sr-only">GitHub</span>
        </Button>
        
        {/* Settings */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="w-4 h-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </div>
  );
};