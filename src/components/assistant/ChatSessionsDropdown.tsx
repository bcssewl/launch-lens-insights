
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X 
} from 'lucide-react';
import { useChatSessions, ChatSession } from '@/hooks/useChatSessions';
import { cn } from '@/lib/utils';

interface ChatSessionsDropdownProps {
  currentSessionId?: string | null;
  onSessionSelect?: (sessionId: string) => void;
}

const ChatSessionsDropdown: React.FC<ChatSessionsDropdownProps> = ({
  currentSessionId,
  onSessionSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { sessions, createSession, updateSessionTitle, deleteSession } = useChatSessions();
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreateSession = async () => {
    const newSession = await createSession();
    if (newSession && onSessionSelect) {
      onSessionSelect(newSession.id);
    }
    setIsOpen(false);
  };

  const handleEditStart = (session: ChatSession) => {
    setEditingSession(session.id);
    setEditTitle(session.title);
  };

  const handleEditSave = async () => {
    if (editingSession && editTitle.trim()) {
      await updateSessionTitle(editingSession, editTitle.trim());
      setEditingSession(null);
    }
  };

  const handleEditCancel = () => {
    setEditingSession(null);
    setEditTitle('');
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    if (currentSessionId === sessionId && onSessionSelect) {
      onSessionSelect('');
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    onSessionSelect?.(sessionId);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
          aria-label="Chat sessions"
        >
          <MessageSquare className="h-4 w-4" />
          {currentSessionId && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm">Chat Sessions</h3>
            <Button size="sm" variant="ghost" onClick={handleCreateSession}>
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-64">
          <div className="p-2">
            {sessions.length > 0 ? (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "group p-2 rounded-md cursor-pointer border transition-colors",
                      currentSessionId === session.id 
                        ? "bg-primary/10 border-primary" 
                        : "hover:bg-accent border-transparent"
                    )}
                    onClick={() => handleSessionSelect(session.id)}
                  >
                    {editingSession === session.id ? (
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-6 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave();
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={handleEditSave} className="h-6 w-6 p-0">
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleEditCancel} className="h-6 w-6 p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{session.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStart(session);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No chat sessions yet. Create one to get started!
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default ChatSessionsDropdown;
