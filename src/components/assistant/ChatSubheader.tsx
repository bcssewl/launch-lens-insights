
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Settings as SettingsIcon, LogOut, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import QuickActionsDropdown from '@/components/assistant/QuickActionsDropdown';
import ChatSessionsDropdown from '@/components/assistant/ChatSessionsDropdown';
import ModelSelectionDropdown, { AIModel } from '@/components/assistant/ModelSelectionDropdown';
import ResearchTypeSelector from '@/components/assistant/ResearchTypeSelector';
import { Logo } from '@/components/icons';

interface ChatSubheaderProps {
  isConfigured: boolean;
  currentSessionId?: string | null;
  onDownloadChat: () => void;
  onClearConversation: () => void;
  onSessionSelect: (sessionId: string) => void;
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  selectedResearchType?: string;
  onResearchTypeChange?: (type: string) => void;
}

const ChatSubheader: React.FC<ChatSubheaderProps> = ({
  isConfigured,
  currentSessionId,
  onDownloadChat,
  onClearConversation,
  onSessionSelect,
  selectedModel,
  onModelSelect,
  selectedResearchType,
  onResearchTypeChange
}) => {
  const { user, signOut } = useAuth();

  const handleModelSelect = (model: AIModel) => {
    onModelSelect(model.id);
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex items-center justify-between w-full px-6 py-3">
      {/* Optivise logo on the left */}
      <div className="flex items-center">
        <Logo className="flex-shrink-0" />
      </div>
      
      {/* Profile button in the center */}
      <div className="flex items-center">
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
                {user?.user_metadata?.full_name || user?.email || 'User'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="center" className="w-56 bg-surface-elevated border-border-subtle">
            <DropdownMenuLabel className="text-text-primary">
              {user?.user_metadata?.full_name || user?.email || 'User'}
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
      
      {/* Control buttons moved to the far right */}
      <div className="flex items-center space-x-2">
        <ModelSelectionDropdown
          selectedModel={selectedModel}
          onModelSelect={handleModelSelect}
        />
        <QuickActionsDropdown 
          onDownloadChat={onDownloadChat}
          onClearConversation={onClearConversation}
        />
        <ChatSessionsDropdown 
          currentSessionId={currentSessionId}
          onSessionSelect={onSessionSelect}
        />
      </div>
    </div>
  );
};

export default ChatSubheader;
