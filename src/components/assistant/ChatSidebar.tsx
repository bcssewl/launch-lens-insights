
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Lightbulb, FileText, Download, Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import { useChatSessions, ChatSession } from '@/hooks/useChatSessions';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  recentTopics: string[];
  onDownloadChat: () => void;
  onClearConversation: () => void;
  currentSessionId?: string | null;
  onSessionSelect?: (sessionId: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  recentTopics, 
  onDownloadChat, 
  onClearConversation,
  currentSessionId,
  onSessionSelect
}) => {
  const { sessions, createSession, updateSessionTitle, deleteSession } = useChatSessions();
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreateSession = async () => {
    const newSession = await createSession();
    if (newSession && onSessionSelect) {
      onSessionSelect(newSession.id);
    }
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

  return (
    <aside className="w-80 border-l border-border bg-card flex flex-col h-full">
      <div className="p-4 space-y-4 flex flex-col h-full">
        {/* Quick Actions */}
        <Card className="border-0 shadow-none bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start h-8 text-sm" asChild>
              <Link to="/dashboard/validate">
                <Lightbulb className="mr-2 h-3 w-3" /> Analyze New Idea
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start h-8 text-sm" asChild>
              <Link to="/dashboard/reports">
                <FileText className="mr-2 h-3 w-3" /> View Reports
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start h-8 text-sm" onClick={onDownloadChat}>
              <Download className="mr-2 h-3 w-3" /> Download Chat
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start h-8 text-sm text-destructive hover:text-destructive" onClick={onClearConversation}>
              <Trash2 className="mr-2 h-3 w-3" /> Clear Chat
            </Button>
          </CardContent>
        </Card>

        {/* Chat Sessions */}
        <Card className="flex-1 flex flex-col min-h-0 border-0 shadow-none bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Chat History</CardTitle>
            <Button size="sm" variant="outline" onClick={handleCreateSession} className="h-7 w-7 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6 pb-6">
              {sessions.length > 0 ? (
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "group p-2 rounded-md cursor-pointer border transition-colors text-sm",
                        currentSessionId === session.id 
                          ? "bg-primary/10 border-primary/20" 
                          : "hover:bg-accent border-transparent"
                      )}
                      onClick={() => onSessionSelect?.(session.id)}
                    >
                      {editingSession === session.id ? (
                        <div className="flex items-center space-x-1">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="h-5 text-xs border-0 p-0 focus-visible:ring-0"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave();
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" onClick={handleEditSave} className="h-5 w-5 p-0">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleEditCancel} className="h-5 w-5 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{session.title}</p>
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
                              className="h-5 w-5 p-0"
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
                              className="h-5 w-5 p-0 text-destructive hover:text-destructive"
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
                <p className="text-sm text-muted-foreground">No chat sessions yet.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};

export default ChatSidebar;
