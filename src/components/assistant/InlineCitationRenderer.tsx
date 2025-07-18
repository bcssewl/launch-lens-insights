
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

  // Custom component to handle citation links within markdown
  const CitationLink: React.FC<{ citationNumber: number }> = ({ citationNumber }) => {
    const citationIndex = citationNumber - 1;
    const citation = citations[citationIndex];
    
    if (!citation || !citation.url) {
      return <span>[{citationNumber}]</span>;
    }

    return (
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          // Allow both direct navigation and custom click handling
          onCitationClick?.(citation, citationIndex);
        }}
        className="citation-link text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium no-underline border-b border-current border-dotted pb-0.5 transition-colors cursor-pointer bg-transparent p-0 inline hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 rounded"
        title={`${citation.name} - Click to open source`}
      >
        [{citationNumber}]
      </a>
    );
  };

  // Process content to replace citation patterns with clickable links
  const processContentWithCitations = (text: string): React.ReactNode => {
    if (!citations || citations.length === 0) {
      return <MarkdownRenderer content={text} />;
    }

    // Create a custom markdown renderer that handles citations
    const MarkdownWithCitations: React.FC<{ content: string }> = ({ content }) => {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <MarkdownRenderer 
            content={content}
            className="[&_.citation-placeholder]:inline-block"
          />
        </div>
      );
    };

    // Replace citation patterns with React components after markdown processing
    const parts = text.split(/(\[\d+\])/g);
    
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {parts.map((part, index) => {
          const citationMatch = part.match(/^\[(\d+)\]$/);
          
          if (citationMatch) {
            const citationNumber = parseInt(citationMatch[1]);
            return <CitationLink key={index} citationNumber={citationNumber} />;
          }
          
          // Regular text part - render as markdown
          if (part.trim()) {
            return <MarkdownRenderer key={index} content={part} className="inline" />;
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
