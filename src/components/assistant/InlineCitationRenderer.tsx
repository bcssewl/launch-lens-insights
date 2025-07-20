import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

interface Citation {
  name: string;
  url: string;
  type?: string;
}

interface InlineCitationRendererProps {
  content: string;
  citations: Citation[];
  onCitationClick?: (citation: Citation, index: number) => void;
  className?: string;
}

const InlineCitationRenderer: React.FC<InlineCitationRendererProps> = ({
  content,
  citations,
  onCitationClick,
  className
}) => {
  console.log('📎 InlineCitationRenderer: Processing content with citations', {
    contentLength: content.length,
    citationsCount: citations.length
  });

  // Custom text renderer that handles citations inline
  const renderTextWithCitations = (text: string): React.ReactNode => {
    if (!citations || citations.length === 0) {
      return text;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const citationPattern = /\[(\d+)\]/g;
    let match;

    while ((match = citationPattern.exec(text)) !== null) {
      const citationNumber = parseInt(match[1]);
      const citationIndex = citationNumber - 1;
      const citation = citations[citationIndex];
      
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Add citation element if valid
      if (citation && citation.url) {
        parts.push(
          <span
            key={`citation-${citationNumber}-${match.index}`}
            onClick={() => onCitationClick?.(citation, citationIndex)}
            className="citation inline-block text-xs text-muted-foreground opacity-75 hover:opacity-100 bg-muted/20 hover:bg-muted/40 px-1 py-0.5 rounded align-super cursor-pointer transition-all duration-200"
            title={citation.name}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCitationClick?.(citation, citationIndex);
              }
            }}
            aria-label={`Citation ${citationNumber}: ${citation.name}`}
          >
            {citationNumber}
          </span>
        );
      } else {
        // Keep original citation text if no valid citation found
        parts.push(match[0]);
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 1 ? <>{parts}</> : text;
  };

  return (
    <div className={cn("markdown-content prose prose-gray dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Override text rendering to handle citations
          text: ({ children }) => renderTextWithCitations(String(children)),
          
          // Headings
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-1">{children}</h3>,
          
          // Paragraphs
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          
          // Lists
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          
          // Emphasis
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          
          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:text-blue-400 underline"
            >
              {children}
            </a>
          ),
          
          // Inline code
          code: ({ children, className }) => {
            const match = /language-(\w+)/.exec(className || '');
            
            if (!match) {
              return (
                <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            
            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="text-xs rounded-md"
                customStyle={{
                  margin: '8px 0',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  lineHeight: '1rem'
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },
          
          // Code blocks
          pre: ({ children }) => (
            <div className="my-2 overflow-hidden rounded-md border bg-muted">
              {children}
            </div>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-2">
              {children}
            </blockquote>
          ),
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border border-muted rounded">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-muted bg-muted px-2 py-1 text-left font-semibold text-xs">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-muted px-2 py-1 text-xs">{children}</td>
          ),
          
          // Horizontal rule
          hr: () => <hr className="my-3 border-muted" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default InlineCitationRenderer;
