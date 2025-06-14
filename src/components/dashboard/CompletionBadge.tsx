
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompletionBadgeProps {
  status: 'completed' | 'in-progress' | 'pending' | 'failed';
  text?: string;
  size?: 'sm' | 'md';
}

const CompletionBadge: React.FC<CompletionBadgeProps> = ({ 
  status, 
  text,
  size = 'sm' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          className: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300',
          defaultText: 'Complete'
        };
      case 'in-progress':
        return {
          icon: Clock,
          className: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300',
          defaultText: 'In Progress'
        };
      case 'pending':
        return {
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300',
          defaultText: 'Pending'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          className: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300',
          defaultText: 'Failed'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;
  const displayText = text || config.defaultText;

  return (
    <Badge className={cn(config.className, size === 'sm' && 'text-xs px-2 py-0.5')}>
      <IconComponent className={cn(
        'mr-1',
        size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
      )} />
      {displayText}
    </Badge>
  );
};

export default CompletionBadge;
