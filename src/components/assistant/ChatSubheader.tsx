
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Settings as SettingsIcon, LogOut, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import QuickActionsDropdown from '@/components/assistant/QuickActionsDropdown';
import ChatSessionsDropdown from '@/components/assistant/ChatSessionsDropdown';
import { Logo } from '@/components/icons';

// Utility function to capitalize first letter
const capitalizeFirstLetter = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

interface ChatSubheaderProps {
  isConfigured: boolean;
  currentSessionId?: string | null;
  onDownloadChat: () => void;
  onClearConversation: () => void;
  onSessionSelect: (sessionId: string) => void;
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

const ChatSubheader: React.FC<ChatSubheaderProps> = ({
  isConfigured,
  currentSessionId,
  onDownloadChat,
  onClearConversation,
  onSessionSelect,
  selectedModel,
  onModelSelect
}) => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex items-center w-full px-6 py-3 relative">
      {/* Optivise logo on the left */}
      <div className="flex items-center">
        <Logo className="flex-shrink-0" />
      </div>
      
      {/* User Profile - Perfectly centered */}
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

      {/* Control buttons on the right side */}
      <div className="ml-auto flex items-center space-x-2">
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
