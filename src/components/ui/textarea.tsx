
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoExpand?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoExpand = false, onChange, onInput, ...props }, ref) => {
    const autoResize = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoExpand) {
        const target = e.target;
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
      }
    }, [autoExpand]);

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
      autoResize(e);
    }, [onChange, autoResize]);

    const handleInput = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInput?.(e);
      autoResize(e);
    }, [onInput, autoResize]);

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          autoExpand && "resize-none overflow-hidden",
          className
        )}
        ref={ref}
        onChange={handleChange}
        onInput={handleInput}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
