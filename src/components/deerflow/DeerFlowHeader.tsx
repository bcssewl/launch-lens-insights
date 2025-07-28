import { Settings, Github, Languages, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useDeerFlowStore } from "@/stores/deerFlowStore";

export const DeerFlowHeader = () => {
  const { setSettingsOpen, clearMessages, createNewThread, messages } = useDeerFlowStore();
  const { toast } = useToast();

  const handleClearChat = () => {
    clearMessages();
    createNewThread();
    toast({
      title: "Chat Cleared",
      description: "Started a new conversation",
    });
  };

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            DeerFlow
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Clear Chat Button - only show if there are messages */}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Clear Chat</span>
            </Button>
          )}

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
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>
    </header>
  );
};