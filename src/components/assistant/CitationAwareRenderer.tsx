
import React from 'react';
import InlineCitationRenderer from './InlineCitationRenderer';
import SourcesButton from './SourcesButton';

interface Citation {
  name: string;
  url: string;
  type?: string;
}

interface CitationAwareRendererProps {
  content: string;
  citations: Citation[];
  onSourcesClick?: () => void;
  onCitationClick?: (citation: Citation, index: number) => void;
  className?: string;
}

const CitationAwareRenderer: React.FC<CitationAwareRendererProps> = ({
  content,
  citations,
  onSourcesClick,
  onCitationClick,
  className
}) => {
  console.log('📎 CitationAwareRenderer: Rendering with citations', {
    contentLength: content.length,
    citationsCount: citations.length,
    hasOnSourcesClick: !!onSourcesClick,
    citationsPreview: citations.slice(0, 3).map(c => ({ name: c.name, url: c.url }))
  });

  const handleCitationClick = (citation: Citation, index: number) => {
    console.log('📎 Citation clicked:', { citation: citation.name, index, url: citation.url });
    
    // Open the citation URL if available
    if (citation.url) {
      window.open(citation.url, '_blank', 'noopener,noreferrer');
    }
    
    // Also call the optional callback
    onCitationClick?.(citation, index);
  };

  return (
    <div className={className}>
      {/* Render content with clickable inline citations */}
      <InlineCitationRenderer
        content={content}
        citations={citations}
        onCitationClick={handleCitationClick}
      />
      
      {/* Sources button at the bottom */}
      {citations && citations.length > 0 && onSourcesClick && (
        <div className="mt-3">
          <SourcesButton 
            citations={citations} 
            onClick={onSourcesClick}
          />
        </div>
      )}
    </div>
  );
};

export default CitationAwareRenderer;
