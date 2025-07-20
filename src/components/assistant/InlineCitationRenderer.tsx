
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

    // Create placeholders for citations to avoid splitting markdown
    const citationPlaceholders: { [key: string]: React.ReactNode } = {};
    let processedText = text;
    
    // Replace citation patterns with unique placeholders
    const citationPattern = /\[(\d+)\]/g;
    let match;
    const replacements: Array<{ original: string; placeholder: string; element: React.ReactNode }> = [];
    
    while ((match = citationPattern.exec(text)) !== null) {
      const citationNumber = parseInt(match[1]);
      const citationIndex = citationNumber - 1;
      const citation = citations[citationIndex];
      
      if (citation && citation.url) {
        const placeholder = `__CITATION_${citationNumber}_${Math.random().toString(36).substr(2, 9)}__`;
        const citationElement = (
          <span
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
        
        replacements.push({
          original: match[0],
          placeholder,
          element: citationElement
        });
        
        citationPlaceholders[placeholder] = citationElement;
      }
    }
    
    // Replace citations with placeholders for markdown processing
    replacements.forEach(({ original, placeholder }) => {
      processedText = processedText.replace(original, placeholder);
    });
    
    // Process markdown first, then replace placeholders
    const markdownContent = <MarkdownRenderer content={processedText} />;
    
    // If no citations to replace, return markdown as-is
    if (Object.keys(citationPlaceholders).length === 0) {
      return markdownContent;
    }
    
    // For now, return the markdown content - we'll need to post-process this
    // This is a simplified approach that should fix the dot issue
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {processedText.split(/(__CITATION_\d+_[a-z0-9]+__)/g).map((part, index) => {
          if (citationPlaceholders[part]) {
            return <React.Fragment key={index}>{citationPlaceholders[part]}</React.Fragment>;
          }
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
