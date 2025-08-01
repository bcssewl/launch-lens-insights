import { Button } from "@/components/ui/button";
import { Plus, Settings, MessageSquare, Lightbulb, UserCircle, Settings as SettingsIcon, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDeerFlowStore } from "@/stores/deerFlowStore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Utility function to capitalize first letter
const capitalizeFirstLetter = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const DeerFlowHeader = () => {
  const { 
    createNewThread, 
    clearMessages, 
    isResearchPanelOpen, 
    setResearchPanelOpen, 
    setSettingsOpen 
  } = useDeerFlowStore();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

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

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className={cn(
      // Perplexity-style minimal header with perfect center positioning
      "flex items-center",
      "px-6 py-4",
      "h-16",
      "relative" // Enable absolute positioning for center element
    )}>
      {/* Left side - Logo */}
      <div className="flex items-center">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-7 w-7 text-primary flex-shrink-0" />
        </div>
      </div>

      {/* Middle - User Profile (perfectly centered) */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-3 p-2 rounded-md hover:bg-surface-elevated transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt="User Avatar" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-text-primary hidden md:block">
                {capitalizeFirstLetter(user?.user_metadata?.full_name || user?.email || 'User')}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="center" className="w-56 bg-surface-elevated border-border-subtle">
            <DropdownMenuLabel className="text-text-primary">
              {capitalizeFirstLetter(user?.user_metadata?.full_name || user?.email || 'User')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border-subtle" />
            <DropdownMenuItem asChild className="text-text-secondary hover:text-text-primary hover:bg-surface-elevated-2">
              <Link to="/dashboard/profile" className="flex items-center">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-text-secondary hover:text-text-primary hover:bg-surface-elevated-2">
              <Link to="/dashboard/settings" className="flex items-center">
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-text-secondary hover:text-text-primary hover:bg-surface-elevated-2">
              <Link to="/dashboard/billing" className="flex items-center">
                <Lightbulb className="mr-2 h-4 w-4" />
                <span>Billing / Upgrade</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border-subtle" />
            <DropdownMenuItem onClick={handleLogout} className="text-text-secondary hover:text-text-primary hover:bg-surface-elevated-2">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right side - Action buttons (positioned at the end) */}
      <div className="ml-auto flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleNewThread}
          className="h-9 w-9 rounded-lg hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setResearchPanelOpen(!isResearchPanelOpen)}
          className="h-9 w-9 rounded-lg hover:bg-muted"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setSettingsOpen(true)}
          className="h-9 w-9 rounded-lg hover:bg-muted"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};