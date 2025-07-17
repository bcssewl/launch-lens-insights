
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
  // Process content to make numbered citations clickable
  const processContentWithCitations = (text: string): string => {
    if (!citations || citations.length === 0) {
      return text;
    }

    // Replace numbered citations [1], [2], etc. with clickable links
    return text.replace(/\[(\d+)\]/g, (match, number) => {
      const citationIndex = parseInt(number) - 1;
      const citation = citations[citationIndex];
      
      if (citation && citation.url) {
        return `[${number}](${citation.url} "${citation.name}")`;
      }
      
      return match; // Return original if citation not found
    });
  };

  const processedContent = processContentWithCitations(content);

  return (
    <div className={className}>
      <MarkdownRenderer content={processedContent} />
      
      {/* Citations list at the bottom */}
      {citations && citations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/30">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Sources:
          </div>
          <div className="space-y-1">
            {citations.map((citation, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground font-mono min-w-[1.5rem]">
                  [{index + 1}]
                </span>
                {citation.url ? (
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-1 group"
                  >
                    <span className="flex-1">{citation.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <span className="text-foreground/80">{citation.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitationAwareRenderer;
