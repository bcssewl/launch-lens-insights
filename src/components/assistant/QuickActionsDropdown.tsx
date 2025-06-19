
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Link } from 'react-router-dom';
import { 
  Lightbulb, 
  FileText, 
  Download, 
  Trash2, 
  Settings,
  PlayCircle
} from 'lucide-react';
import TutorialVideoDialog from '@/components/tutorial/TutorialVideoDialog';

interface QuickActionsDropdownProps {
  onDownloadChat: () => void;
  onClearConversation: () => void;
}

const QuickActionsDropdown: React.FC<QuickActionsDropdownProps> = ({
  onDownloadChat,
  onClearConversation
}) => {
  const [tutorialOpen, setTutorialOpen] = useState(false);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Quick actions"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64 p-2" 
          align="end"
          side="bottom"
          sideOffset={8}
        >
          <div className="space-y-1">
            <Button 
              className="w-full justify-start h-9 px-3" 
              variant="ghost"
              asChild
            >
              <Link to="/dashboard/validate">
                <Lightbulb className="mr-3 h-4 w-4" />
                Analyze New Idea
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start h-9 px-3"
              onClick={() => setTutorialOpen(true)}
            >
              <PlayCircle className="mr-3 h-4 w-4" />
              View Tutorial
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start h-9 px-3"
              asChild
            >
              <Link to="/dashboard/reports">
                <FileText className="mr-3 h-4 w-4" />
                View My Reports
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start h-9 px-3"
              onClick={onDownloadChat}
            >
              <Download className="mr-3 h-4 w-4" />
              Download Chat
            </Button>
            
            <div className="my-1 h-px bg-border" />
            
            <Button 
              variant="ghost" 
              className="w-full justify-start h-9 px-3 text-destructive hover:text-destructive"
              onClick={onClearConversation}
            >
              <Trash2 className="mr-3 h-4 w-4" />
              Clear Current Chat
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <TutorialVideoDialog 
        open={tutorialOpen}
        onOpenChange={setTutorialOpen}
      />
    </>
  );
};

export default QuickActionsDropdown;
