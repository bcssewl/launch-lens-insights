
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { Lightbulb, FileText, Download, Trash2 } from 'lucide-react';

interface ChatSidebarProps {
  recentTopics: string[];
  onDownloadChat: () => void;
  onClearConversation: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  recentTopics, 
  onDownloadChat, 
  onClearConversation
}) => {
  return (
    <aside className="w-full md:w-72 lg:w-80 border-l bg-card hidden md:flex md:flex-col h-screen">
      <div className="p-4 space-y-6 flex flex-col h-full">
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" asChild>
              <Link to="/dashboard/validate">
                <Lightbulb className="mr-2" /> Analyze New Idea
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/reports">
                <FileText className="mr-2" /> View My Reports
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={onDownloadChat}>
              <Download className="mr-2" /> Download Chat
            </Button>
             <Button variant="destructive" className="w-full justify-start sm:hidden" onClick={onClearConversation}>
              <Trash2 className="mr-2" /> Clear Chat (Mobile)
            </Button>
          </CardContent>
        </Card>

        
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader>
            <CardTitle className="text-lg">Recent Topics</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-6 pt-0">
              {recentTopics.length > 0 ? (
                <ul className="space-y-2">
                  {recentTopics.map((topic, index) => (
                    <li key={index} className="text-sm p-2 rounded-md hover:bg-accent cursor-pointer">
                      {topic}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recent topics yet.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};

export default ChatSidebar;
