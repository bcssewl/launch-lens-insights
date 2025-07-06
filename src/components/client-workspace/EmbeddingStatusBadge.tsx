
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface EmbeddingStatusBadgeProps {
  status: string;
  totalChunks?: number;
  onReprocess?: () => void;
  isProcessing?: boolean;
}

const EmbeddingStatusBadge: React.FC<EmbeddingStatusBadgeProps> = ({
  status,
  totalChunks,
  onReprocess,
  isProcessing = false
}) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'AI Ready',
          variant: 'default' as const,
          description: `${totalChunks || 0} chunks processed`
        };
      case 'processing':
        return {
          icon: <RefreshCw className="h-3 w-3 animate-spin" />,
          label: 'Processing',
          variant: 'secondary' as const,
          description: 'Generating embeddings...'
        };
      case 'partial':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Partial',
          variant: 'destructive' as const,
          description: 'Some chunks failed'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Error',
          variant: 'destructive' as const,
          description: 'Processing failed'
        };
      case 'pending':
      default:
        return {
          icon: <Clock className="h-3 w-3" />,
          label: 'Pending',
          variant: 'outline' as const,
          description: 'Not processed for AI search'
        };
    }
  };

  const { icon, label, variant, description } = getStatusInfo(status);

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant} className="flex items-center gap-1">
        {isProcessing ? <RefreshCw className="h-3 w-3 animate-spin" /> : icon}
        {isProcessing ? 'Processing...' : label}
      </Badge>
      
      {onReprocess && (status === 'error' || status === 'pending') && !isProcessing && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onReprocess}
          className="h-6 px-2 text-xs"
          title={description}
        >
          <Brain className="h-3 w-3 mr-1" />
          Process
        </Button>
      )}
    </div>
  );
};

export default EmbeddingStatusBadge;
