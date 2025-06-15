
import React from 'react';
import { cn } from '@/lib/utils';

interface SkipNavProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const SkipNav = React.forwardRef<HTMLAnchorElement, SkipNavProps>(
  ({ href, children, className }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          "skip-nav fixed left-[-9999px] z-[9999] px-4 py-2 bg-surface text-text-primary border-2 border-focus-ring rounded-md text-sm font-medium transition-all duration-200",
          "focus:left-2 focus:top-2",
          className
        )}
      >
        {children}
      </a>
    );
  }
);

SkipNav.displayName = "SkipNav";

export { SkipNav };
