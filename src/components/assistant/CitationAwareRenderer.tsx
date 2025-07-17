
import React from 'react';
import { ExternalLink } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface Citation {
  name: string;
  url: string;
  type?: string;
}

interface CitationAwareRendererProps {
  content: string;
  citations: Citation[];
  className?: string;
}

const CitationAwareRenderer: React.FC<CitationAwareRendererProps> = ({
  content,
  citations,
  className
}) => {
  console.log('📎 CitationAwareRenderer: Processing content with citations', {
    contentLength: content.length,
    citationsCount: citations.length,
    citationNames: citations.map(c => c.name)
  });

  // Process content to make numbered citations clickable
  const processContentWithCitations = (text: string): string => {
    if (!citations || citations.length === 0) {
      console.log('📎 No citations to process');
      return text;
    }

    console.log('📎 Processing citations in text:', {
      originalText: text.substring(0, 200),
      citationsAvailable: citations.length
    });

    // Replace numbered citations [1], [2], etc. with clickable markdown links
    const processedText = text.replace(/\[(\d+)\]/g, (match, number) => {
      const citationIndex = parseInt(number) - 1;
      const citation = citations[citationIndex];
      
      if (citation && citation.url) {
        console.log(`📎 Linking citation [${number}] to:`, citation.name);
        // Create markdown link with target="_blank" and title
        return `<a href="${citation.url}" target="_blank" rel="noopener noreferrer" class="citation-link text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium no-underline border-b border-current border-dotted pb-0.5 transition-colors" title="${citation.name}">[${number}]</a>`;
      }
      
      console.log(`📎 Citation [${number}] not found or missing URL`);
      return match; // Return original if citation not found
    });

    console.log('📎 Text processing complete:', {
      hasChanges: processedText !== text,
      processedLength: processedText.length
    });

    return processedText;
  };

  const processedContent = processContentWithCitations(content);

  return (
    <div className={className}>
      {/* Render the processed content with clickable citations */}
      <div 
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
      
      {/* Citations list at the bottom */}
      {citations && citations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border/30">
          <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Sources ({citations.length})
          </div>
          <div className="space-y-2">
            {citations.map((citation, index) => (
              <div key={index} className="flex items-start gap-3 text-xs bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <span className="text-muted-foreground font-mono min-w-[1.5rem] mt-0.5 text-xs">
                  [{index + 1}]
                </span>
                <div className="flex-1 min-w-0">
                  {citation.url ? (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary transition-colors flex items-start gap-2 group"
                    >
                      <span className="flex-1 font-medium break-words">{citation.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                    </a>
                  ) : (
                    <span className="text-foreground/80 font-medium">{citation.name}</span>
                  )}
                  {citation.type && (
                    <div className="text-muted-foreground mt-1 text-xs">
                      {citation.type}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitationAwareRenderer;
