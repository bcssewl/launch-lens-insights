
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Lightbulb, FileText, Download, Trash2, Plus, Edit2, Check, X, Menu } from 'lucide-react';
import { useChatSessions, ChatSession } from '@/hooks/useChatSessions';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

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
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { sessions, createSession, updateSessionTitle, deleteSession } = useChatSessions();
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreateSession = async () => {
    console.log('ChatSidebar: Creating new session...');
    const newSession = await createSession();
    if (newSession && onSessionSelect) {
      console.log('ChatSidebar: Notifying parent of new session:', newSession.id);
      onSessionSelect(newSession.id);
    }
    if (isMobile) {
      setIsMobileMenuOpen(false);
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

  const handleSessionSelectMobile = (sessionId: string) => {
    onSessionSelect?.(sessionId);
    setIsMobileMenuOpen(false);
  };

  const handleClearConversationMobile = () => {
    onClearConversation();
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="p-4 space-y-6 flex flex-col h-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full justify-start" asChild>
            <Link to="/dashboard/validate" onClick={() => isMobile && setIsMobileMenuOpen(false)}>
              <Lightbulb className="mr-2" /> Analyze New Idea
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/dashboard/reports" onClick={() => isMobile && setIsMobileMenuOpen(false)}>
              <FileText className="mr-2" /> View My Reports
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => {
            onDownloadChat();
            isMobile && setIsMobileMenuOpen(false);
          }}>
            <Download className="mr-2" /> Download Chat
          </Button>
          <Button variant="destructive" className="w-full justify-start" onClick={isMobile ? handleClearConversationMobile : onClearConversation}>
            <Trash2 className="mr-2" /> Clear Current Chat
          </Button>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Chat Sessions</CardTitle>
          <Button size="sm" onClick={handleCreateSession}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-6 pt-0">
            {sessions.length > 0 ? (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "group p-2 rounded-md cursor-pointer border transition-colors",
                      currentSessionId === session.id 
                        ? "bg-primary/10 border-primary" 
                        : "hover:bg-accent border-transparent"
                    )}
                    onClick={() => isMobile ? handleSessionSelectMobile(session.id) : onSessionSelect?.(session.id)}
                  >
                    {editingSession === session.id ? (
                      <div className="flex items-center space-x-1">
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
              <p className="text-sm text-muted-foreground">No chat sessions yet. Create one to get started!</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-16 right-4 z-40">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="bg-background border-border shadow-md"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Drawer */}
        <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <DrawerContent className="h-[85vh] bg-background border-t border-border">
            <DrawerHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-lg font-semibold">Chat History & Actions</DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            
            <div className="flex-1 overflow-hidden">
              <SidebarContent />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop version
  return (
    <aside className="w-full md:w-72 lg:w-80 border-l bg-card hidden md:flex md:flex-col h-screen">
      <SidebarContent />
    </aside>
  );
};

export default ChatSidebar;
