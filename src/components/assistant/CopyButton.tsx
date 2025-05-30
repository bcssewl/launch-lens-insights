
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  content: string;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ content, className }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        description: "Message copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to copy message",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={cn(
        "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted/80",
        className
      )}
      aria-label="Copy message"
    >
      {copied ? (
        <Check className="h-3 w-3" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
};

export default CopyButton;
