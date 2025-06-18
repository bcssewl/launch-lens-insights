import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import ChatArea from '@/components/assistant/ChatArea';
import { Message } from '@/constants/aiAssistant';

interface FloatingChatWidgetProps {
  messages: Message[];
  isTyping: boolean;
  viewportRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (message: string) => void;
  onClose: () => void;
  ideaName: string;
}

const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  messages,
  isTyping,
  viewportRef,
  onSendMessage,
  onClose,
  ideaName
}) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 350, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  // Load position from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('chatWidgetPosition');
    if (savedPosition) {
      const parsed = JSON.parse(savedPosition);
      setPosition(parsed);
    }
  }, []);

  // Save position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chatWidgetPosition', JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep widget within viewport bounds
      const maxX = window.innerWidth - 320; // widget width
      const maxY = window.innerHeight - (isMinimized ? 60 : 500); // widget height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div
      ref={widgetRef}
      className="fixed bg-background border border-border rounded-2xl shadow-2xl z-50 transition-all duration-200"
      style={{
        left: position.x,
        top: position.y,
        width: '320px',
        height: isMinimized ? '60px' : '500px',
        userSelect: isDragging ? 'none' : 'auto'
      }}
    >
      {/* Header - Draggable Area */}
      <div
        className="flex items-center justify-between p-3 border-b border-border bg-muted/30 rounded-t-2xl cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm truncate">Report Advisor</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={toggleMinimize} className="h-6 w-6 p-0">
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex flex-col h-[440px]">
          {/* Subtitle */}
          <div className="px-3 py-2 border-b border-border/50 bg-muted/10">
            <p className="text-xs text-muted-foreground truncate">
              Discussing: {ideaName}
            </p>
          </div>

          {/* Chat Area */}
          <div className="flex-1 min-h-0">
            <ChatArea
              messages={messages}
              isTyping={isTyping}
              viewportRef={viewportRef}
              onSendMessage={onSendMessage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatWidget;
