
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

  // Check if content contains tables
  const hasTable = /\|.*\|.*\n.*\|.*\|/.test(content);

  // If no citations or content has tables, render markdown directly
  if (!citations || citations.length === 0 || hasTable) {
    return (
      <div className={className}>
        <MarkdownRenderer 
          content={content} 
          citations={citations}
          onCitationClick={onCitationClick}
        />
      </div>
    );
  }

  // For content without tables, use the enhanced citation processing
  const processContentWithCitations = (text: string): React.ReactNode => {
    // Create a ref to store the rendered content
    const contentRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
      if (contentRef.current && citations.length > 0) {
        // Process citations after markdown has been rendered
        const citationPattern = /\[(\d+)\]/g;
        const walker = document.createTreeWalker(
          contentRef.current,
          NodeFilter.SHOW_TEXT,
          null
        );

        const textNodes: Text[] = [];
        let node: Node | null;
        
        while (node = walker.nextNode()) {
          textNodes.push(node as Text);
        }

        textNodes.forEach(textNode => {
          const text = textNode.textContent || '';
          if (citationPattern.test(text)) {
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            let match;
            
            citationPattern.lastIndex = 0;
            while ((match = citationPattern.exec(text)) !== null) {
              const citationNumber = parseInt(match[1]);
              const citationIndex = citationNumber - 1;
              const citation = citations[citationIndex];
              
              if (citation && citation.url) {
                // Add text before citation
                if (match.index > lastIndex) {
                  fragment.appendChild(
                    document.createTextNode(text.slice(lastIndex, match.index))
                  );
                }
                
                // Create citation element
                const citationSpan = document.createElement('span');
                citationSpan.className = 'citation inline-block text-xs text-muted-foreground opacity-75 hover:opacity-100 bg-muted/20 hover:bg-muted/40 px-1 py-0.5 rounded align-super cursor-pointer transition-all duration-200';
                citationSpan.textContent = citationNumber.toString();
                citationSpan.title = citation.name;
                citationSpan.setAttribute('role', 'button');
                citationSpan.setAttribute('tabIndex', '0');
                citationSpan.setAttribute('aria-label', `Citation ${citationNumber}: ${citation.name}`);
                
                citationSpan.addEventListener('click', () => {
                  onCitationClick?.(citation, citationIndex);
                });
                
                citationSpan.addEventListener('keydown', (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCitationClick?.(citation, citationIndex);
                  }
                });
                
                fragment.appendChild(citationSpan);
                lastIndex = match.index + match[0].length;
              }
            }
            
            // Add remaining text
            if (lastIndex < text.length) {
              fragment.appendChild(
                document.createTextNode(text.slice(lastIndex))
              );
            }
            
            textNode.parentNode?.replaceChild(fragment, textNode);
          }
        });
      }
    }, [text, citations, onCitationClick]);

    return (
      <div ref={contentRef}>
        <MarkdownRenderer content={text} />
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
