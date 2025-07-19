
import React from 'react';
import { ExternalLink } from 'lucide-react';

interface Citation {
  name: string;
  url: string;
  type?: string;
}

interface SimpleCitationsProps {
  citations: Citation[];
}

const SimpleCitations: React.FC<SimpleCitationsProps> = ({ citations }) => {
  if (!citations || citations.length === 0) {
    return null;
  }

  console.log('📋 SimpleCitations: Rendering citations:', citations);

  return (
    <div className="mt-4 pt-3 border-t border-white/10">
      <p className="text-sm font-medium text-muted-foreground mb-2">Sources:</p>
      <div className="flex flex-wrap gap-2">
        {citations.map((citation, index) => {
          // Ensure we have a valid URL, fallback to # if missing
          const citationUrl = citation.url && citation.url !== '#' ? citation.url : '#';
          const citationName = citation.name || `Source ${index + 1}`;
          
          return (
            <a
              key={index}
              href={citationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md border border-white/10"
              onClick={(e) => {
                if (citationUrl === '#') {
                  e.preventDefault();
                  console.warn('Citation URL not available:', citation);
                }
              }}
            >
              <span className="font-medium">[{index + 1}]</span>
              <span className="truncate max-w-[200px]" title={citationName}>
                {citationName}
              </span>
              {citationUrl !== '#' && <ExternalLink className="w-3 h-3 flex-shrink-0" />}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleCitations;
