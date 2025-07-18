
import React from 'react';
import { X, ExternalLink, FileText, Globe, Book } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Citation {
  name: string;
  url: string;
  type?: string;
}

interface SourcesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  citations: Citation[];
  className?: string;
}

const SourcesSidebar: React.FC<SourcesSidebarProps> = ({
  isOpen,
  onClose,
  citations,
  className
}) => {
  const getSourceIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
      case 'document':
        return FileText;
      case 'web':
      case 'website':
        return Globe;
      case 'article':
      case 'research':
        return Book;
      default:
        return ExternalLink;
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-full bg-background border-l border-border shadow-xl z-50 transition-transform duration-300 ease-in-out",
        "w-80 lg:w-96",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Sources ({citations.length})</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Sources List */}
          <div className="flex-1 overflow-y-auto">
            {citations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sources available</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {citations.map((citation, index) => {
                  const IconComponent = getSourceIcon(citation.type);
                  
                  return (
                    <div
                      key={index}
                      className="group bg-muted/30 hover:bg-muted/50 rounded-lg p-3 transition-colors border border-border/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-mono text-primary font-medium">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {citation.url ? (
                            <a
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block group-hover:text-primary transition-colors"
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm leading-snug break-words">
                                    {citation.name}
                                  </h4>
                                  {citation.type && (
                                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                                      {citation.type}
                                    </p>
                                  )}
                                </div>
                                <IconComponent className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-muted-foreground" />
                              </div>
                            </a>
                          ) : (
                            <div>
                              <h4 className="font-medium text-sm leading-snug text-foreground/80">
                                {citation.name}
                              </h4>
                              {citation.type && (
                                <p className="text-xs text-muted-foreground mt-1 capitalize">
                                  {citation.type}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SourcesSidebar;
