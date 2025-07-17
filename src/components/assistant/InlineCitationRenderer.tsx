
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
  console.log('📎 InlineCitationRenderer: Processing content', {
    contentLength: content.length,
    citationsCount: citations.length,
    contentPreview: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
    hasOnCitationClick: !!onCitationClick
  });

  // Process content to make numbered citations clickable
  const processContentWithCitations = (text: string): React.ReactNode => {
    if (!citations || citations.length === 0) {
      console.log('📎 No citations available, using regular markdown');
      return <MarkdownRenderer content={text} />;
    }

    // Split text by citation patterns [1], [2], etc.
    const citationRegex = /(\[\d+\])/g;
    const parts = text.split(citationRegex);
    
    console.log('📎 Split content into parts:', {
      totalParts: parts.length,
      citationMatches: parts.filter(part => citationRegex.test(part))
    });

    const processedParts: React.ReactNode[] = [];
    
    parts.forEach((part, index) => {
      const citationMatch = part.match(/^\[(\d+)\]$/);
      
      if (citationMatch) {
        const citationNumber = parseInt(citationMatch[1]);
        const citationIndex = citationNumber - 1;
        const citation = citations[citationIndex];
        
        console.log('📎 Processing citation:', {
          citationNumber,
          citationIndex,
          hasCitation: !!citation,
          citationName: citation?.name
        });
        
        if (citation) {
          processedParts.push(
            <button
              key={index}
              onClick={() => onCitationClick?.(citation, citationIndex)}
              className="citation-link text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium no-underline border-b border-current border-dotted pb-0.5 transition-colors cursor-pointer bg-transparent p-0 inline"
              title={citation.name}
            >
              [{citationNumber}]
            </button>
          );
        } else {
          // Citation number but no corresponding citation data
          processedParts.push(
            <span key={index} className="text-muted-foreground">
              [{citationNumber}]
            </span>
          );
        }
      } else if (part.trim()) {
        // Regular text part - render as markdown
        processedParts.push(
          <MarkdownRenderer key={index} content={part} />
        );
      }
    });

    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {processedParts}
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
