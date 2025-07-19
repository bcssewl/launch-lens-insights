
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

  return (
    <div className="mt-4 pt-3 border-t border-white/10">
      <p className="text-sm font-medium text-muted-foreground mb-2">Sources:</p>
      <div className="flex flex-wrap gap-2">
        {citations.map((citation, index) => (
          <a
            key={index}
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span className="font-medium">[{index + 1}]</span>
            <span className="truncate max-w-[200px]">{citation.name}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default SimpleCitations;
