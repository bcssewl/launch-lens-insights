/**
 * @file AnimatedMarkdown.tsx
 * @description Animated markdown component with character-by-character streaming and link credibility checking
 */

import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface AnimatedMarkdownProps {
  children: string;
  animated?: boolean;
  checkLinkCredibility?: boolean;
  className?: string;
  animationSpeed?: number; // ms per character
}

const checkUrlCredibility = (url: string): boolean => {
  if (!url) return true;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    
    // Trusted domains
    const trustedDomains = [
      'wikipedia.org',
      'github.com',
      'stackoverflow.com',
      'developer.mozilla.org',
      'google.com',
      'microsoft.com',
      'apple.com',
      'reuters.com',
      'bbc.com',
      'npr.org',
      'arxiv.org',
      'nature.com',
      'science.org',
      'ieee.org',
      'acm.org',
      'springer.com',
      'pubmed.ncbi.nlm.nih.gov',
      'scholar.google.com',
      'medium.com',
      'forbes.com',
      'techcrunch.com',
      'wired.com',
      'theverge.com'
    ];
    
    // Suspicious patterns
    const suspiciousPatterns = [
      /bit\.ly/,
      /tinyurl/,
      /goo\.gl/,
      /t\.co/,
      /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/, // IP addresses
      /[^a-z0-9\-\.]/i, // Non-standard characters in domain
    ];
    
    const isTrusted = trustedDomains.some(trusted => 
      domain.includes(trusted) || domain.endsWith(trusted)
    );
    
    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(domain)
    );
    
    return isTrusted || !isSuspicious;
  } catch {
    return false;
  }
};

export const AnimatedMarkdown: React.FC<AnimatedMarkdownProps> = ({ 
  children, 
  animated = false, 
  checkLinkCredibility = false,
  className,
  animationSpeed = 20
}) => {
  const { theme } = useTheme();
  const [displayText, setDisplayText] = useState(animated ? '' : children);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (!animated || !children) {
      setDisplayText(children);
      setIsAnimating(false);
      return;
    }
    
    setIsAnimating(true);
    setCurrentIndex(0);
    setDisplayText('');
    
    const animateText = () => {
      let index = 0;
      const timer = setInterval(() => {
        if (index < children.length) {
          setDisplayText(children.slice(0, index + 1));
          setCurrentIndex(index + 1);
          index++;
        } else {
          clearInterval(timer);
          setIsAnimating(false);
        }
      }, animationSpeed);
      
      return () => clearInterval(timer);
    };
    
    const cleanup = animateText();
    return cleanup;
  }, [children, animated, animationSpeed]);
  
  // Reset animation when content changes
  useEffect(() => {
    if (animated && children) {
      setCurrentIndex(0);
      setDisplayText('');
    }
  }, [children, animated]);
  
  const components = useMemo(() => ({
    a: ({ href, children, ...props }: any) => {
      const isCredible = checkLinkCredibility ? checkUrlCredibility(href) : true;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "underline hover:no-underline transition-colors duration-200",
            isCredible 
              ? "text-primary hover:text-primary/80" 
              : "text-destructive hover:text-destructive/80"
          )}
          {...props}
        >
          {children}
          {!isCredible && (
            <AlertTriangle className="inline-block ml-1 h-3 w-3" />
          )}
        </a>
      );
    },
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (language) {
        return (
          <SyntaxHighlighter
            language={language}
            style={theme === 'dark' ? oneDark : oneLight}
            customStyle={{
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              margin: '1rem 0',
              background: theme === 'dark' ? 'hsl(var(--muted))' : 'hsl(var(--muted))',
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }
      
      return (
        <code
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
          {...props}
        >
          {children}
        </code>
      );
    },
    h1: ({ children, ...props }) => (
      <h1 className="text-2xl font-bold text-foreground mb-4 mt-6" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-xl font-semibold text-foreground mb-3 mt-5" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-lg font-medium text-foreground mb-2 mt-4" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p className="text-foreground mb-3 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul className="text-foreground mb-3 ml-6 space-y-1" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="text-foreground mb-3 ml-6 space-y-1" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="text-foreground" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote 
        className="border-l-4 border-primary/30 pl-4 py-2 bg-muted/50 rounded-r-md my-4 text-foreground italic"
        {...props}
      >
        {children}
      </blockquote>
    ),
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-border rounded-lg" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-muted" {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }) => (
      <th className="border border-border px-4 py-2 text-left font-medium text-foreground" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="border border-border px-4 py-2 text-foreground" {...props}>
        {children}
      </td>
    ),
  }), [checkLinkCredibility, theme]);
  
  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {displayText}
      </ReactMarkdown>
      {animated && isAnimating && (
        <span className="animate-pulse text-primary ml-1">|</span>
      )}
    </div>
  );
};