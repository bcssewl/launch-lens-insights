import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '@/lib/utils';

interface ResourceMentionsProps {
  items: Array<{
    id: string;
    title: string;
    url?: string;
    type: 'document' | 'search_result' | 'citation';
  }>;
  command: (item: any) => void;
}

export interface ResourceMentionsRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const ResourceMentions = forwardRef<ResourceMentionsRef, ResourceMentionsProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    };

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length);
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          upHandler();
          return true;
        }

        if (event.key === 'ArrowDown') {
          downHandler();
          return true;
        }

        if (event.key === 'Enter') {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    return (
      <div className="z-50 w-72 max-h-60 overflow-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
        {items.length ? (
          items.map((item, index) => (
            <button
              key={item.id}
              className={cn(
                'flex w-full items-center space-x-2 rounded-md px-2 py-1.5 text-left text-sm',
                'hover:bg-accent hover:text-accent-foreground',
                index === selectedIndex ? 'bg-accent text-accent-foreground' : 'transparent'
              )}
              onClick={() => selectItem(index)}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-muted text-xs">
                {item.type === 'document' ? '📄' : item.type === 'search_result' ? '🔍' : '📝'}
              </div>
              <div className="flex-1 truncate">
                <div className="font-medium truncate">{item.title}</div>
                {item.url && (
                  <div className="text-xs text-muted-foreground truncate">{item.url}</div>
                )}
              </div>
            </button>
          ))
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No results found</div>
        )}
      </div>
    );
  }
);

ResourceMentions.displayName = 'ResourceMentions';