
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

// Safe Syntax Highlighter Component
const SafeSyntaxHighlighter: React.FC<{
  language: string;
  children: string;
}> = ({ language, children }) => {
  try {
    // Try to dynamically import syntax highlighter
    const [SyntaxHighlighter, setSyntaxHighlighter] = React.useState<any>(null);
    const [style, setStyle] = React.useState<any>(null);

    React.useEffect(() => {
      const loadHighlighter = async () => {
        try {
          const { Prism } = await import('react-syntax-highlighter');
          const { oneDark } = await import('react-syntax-highlighter/dist/esm/styles/prism');
          setSyntaxHighlighter(() => Prism);
          setStyle(oneDark);
        } catch (error) {
          console.warn('Failed to load syntax highlighter:', error);
          // Fallback will be used
        }
      };
      loadHighlighter();
    }, []);

    if (SyntaxHighlighter && style) {
      return (
        <SyntaxHighlighter
          style={style}
          language={language}
          PreTag="div"
          className="text-xs rounded-md"
          customStyle={{
            margin: '8px 0',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            lineHeight: '1rem'
          }}
        >
          {children}
        </SyntaxHighlighter>
      );
    }

    // Safe fallback
    return (
      <div className="my-2 overflow-x-auto bg-muted rounded-md border">
        <pre className="p-3 text-xs font-mono">
          <code>{children}</code>
        </pre>
      </div>
    );
  } catch (error) {
    console.warn('SafeSyntaxHighlighter error:', error);
    return (
      <div className="my-2 overflow-x-auto bg-muted rounded-md border">
        <pre className="p-3 text-xs font-mono">
          <code>{children}</code>
        </pre>
      </div>
    );
  }
};

interface Citation {
  name: string;
  url: string;
  type?: string;
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
  citations?: Citation[];
  onCitationClick?: (citation: Citation, index: number) => void;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className, 
  citations = [], 
  onCitationClick 
}) => {
  // Process citations in text content
  const processCitationsInText = (text: string): React.ReactNode => {
    if (!citations.length) return text;
    
    const citationPattern = /\[(\d+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    
    while ((match = citationPattern.exec(text)) !== null) {
      const citationNumber = parseInt(match[1]);
      const citationIndex = citationNumber - 1;
      const citation = citations[citationIndex];
      
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      if (citation && citation.url) {
        // Add citation element
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
          // Headings
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-1">{children}</h3>,
          
          // Paragraphs with citation processing
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed">
              {React.Children.map(children, child => 
                typeof child === 'string' ? processCitationsInText(child) : child
              )}
            </p>
          ),
          
          // Lists
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => (
            <li className="leading-relaxed">
              {React.Children.map(children, child => 
                typeof child === 'string' ? processCitationsInText(child) : child
              )}
            </li>
          ),
          
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
              <SafeSyntaxHighlighter language={match[1]}>
                {String(children).replace(/\n$/, '')}
              </SafeSyntaxHighlighter>
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
          
          // Enhanced Tables with proper styling and responsive design
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 border border-muted rounded-lg shadow-sm">
              <table className="min-w-full border-collapse bg-background">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-muted">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/20 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold text-sm text-foreground border-b border-muted">
              {React.Children.map(children, child => 
                typeof child === 'string' ? processCitationsInText(child) : child
              )}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-foreground border-b border-muted/50">
              {React.Children.map(children, child => 
                typeof child === 'string' ? processCitationsInText(child) : child
              )}
            </td>
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

export default MarkdownRenderer;
