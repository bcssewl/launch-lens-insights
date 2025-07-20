
import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

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

  // Process content to make numbered citations clickable
  const processContentWithCitations = (text: string): React.ReactNode => {
    if (!citations || citations.length === 0) {
      return <MarkdownRenderer content={text} />;
    }

    // Split text by citation patterns [1], [2], etc.
    const parts = text.split(/(\[\d+\])/g);
    
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {parts.map((part, index) => {
          const citationMatch = part.match(/^\[(\d+)\]$/);
          
          if (citationMatch) {
            const citationNumber = parseInt(citationMatch[1]);
            const citationIndex = citationNumber - 1;
            const citation = citations[citationIndex];
            
            if (citation && citation.url) {
              return (
                <span
                  key={index}
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
            }
          }
          
          // Regular text part
          if (part.trim()) {
            return <MarkdownRenderer key={index} content={part} />;
          }
          
          return null;
        })}
      </div>
    );
  };

  return (
    <div className={className}>
      {processContentWithCitations(content)}
    </div>
  );
};

export default InlineCitationRenderer;
