
import React, { useState, useEffect, useCallback } from 'react';
import { X, Maximize2, Minimize2, Download, History, Edit3, Save, Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';
import { useCanvasDocuments, CanvasDocument, CanvasVersion } from '@/hooks/useCanvasDocuments';

interface AdvancedCanvasViewProps {
  isOpen: boolean;
  mode: 'compact' | 'expanded';
  onClose: () => void;
  onToggleMode: () => void;
  documentId: string;
  onDownload?: () => void;
  onPrint?: () => void;
}

const AdvancedCanvasView: React.FC<AdvancedCanvasViewProps> = ({
  isOpen,
  mode,
  onClose,
  onToggleMode,
  documentId,
  onDownload,
  onPrint
}) => {
  const [document, setDocument] = useState<CanvasDocument | null>(null);
  const [versions, setVersions] = useState<CanvasVersion[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const { getDocument, getDocumentVersions, updateDocument, isLoading } = useCanvasDocuments();

  // Load document and versions
  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument();
      loadVersions();
    }
  }, [isOpen, documentId]);

  const loadDocument = async () => {
    const doc = await getDocument(documentId);
    if (doc) {
      setDocument(doc);
      setEditTitle(doc.title);
      setEditContent(doc.content);
    }
  };

  const loadVersions = async () => {
    const versionData = await getDocumentVersions(documentId);
    setVersions(versionData);
    setCurrentVersionIndex(0);
  };

  const handleSave = async () => {
    if (!document) return;

    const success = await updateDocument(documentId, editTitle, editContent, true);
    if (success) {
      await loadDocument();
      await loadVersions();
      setIsEditing(false);
    }
  };

  const handleVersionChange = (index: number) => {
    if (versions[index]) {
      const version = versions[index];
      setEditTitle(version.title);
      setEditContent(version.content);
      setCurrentVersionIndex(index);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!document) return;

    const element = document.createElement('a');
    const file = new Blob([document.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${document.title}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [document]);

  if (!isOpen || !document) return null;

  const currentVersion = versions[currentVersionIndex];
  const displayContent = isEditing ? editContent : (currentVersion?.content || document.content);
  const displayTitle = isEditing ? editTitle : (currentVersion?.title || document.title);

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'business_analysis': return '📊';
      case 'market_research': return '🎯';
      case 'financial_analysis': return '💰';
      default: return '📋';
    }
  };

  const baseClasses = "bg-background border border-border rounded-lg shadow-2xl flex flex-col";
  const compactClasses = "fixed bottom-4 right-4 z-40 w-96 h-80 animate-scale-in";
  const expandedClasses = "fixed inset-4 z-50 animate-scale-in";

  return (
    <div className={cn(baseClasses, mode === 'compact' ? compactClasses : expandedClasses)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-background/95 rounded-t-lg">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg">{getDocumentTypeIcon(document.document_type)}</span>
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-sm font-medium bg-transparent border-none p-0 h-auto focus-visible:ring-0"
            />
          ) : (
            <h3 className="text-sm font-medium text-foreground truncate">
              {displayTitle}
            </h3>
          )}
          {versions.length > 1 && (
            <Badge variant="secondary" className="text-xs">
              v{currentVersion?.version_number || 1} of {versions.length}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {versions.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className="h-7 w-7 p-0 hover:bg-muted"
              title="Version history"
            >
              <History className="h-3 w-3" />
            </Button>
          )}
          
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                className="h-7 w-7 p-0 hover:bg-muted"
                title="Save changes"
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(document.title);
                  setEditContent(document.content);
                }}
                className="h-7 w-7 p-0 hover:bg-muted"
                title="Cancel editing"
              >
                <Undo className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-7 w-7 p-0 hover:bg-muted"
              title="Edit document"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 w-7 p-0 hover:bg-muted"
            title="Download as Markdown"
          >
            <Download className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMode}
            className="h-7 w-7 p-0 hover:bg-muted"
            title={mode === 'compact' ? 'Expand' : 'Minimize'}
          >
            {mode === 'compact' ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 hover:bg-muted"
            title="Close"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Version History */}
      {showVersionHistory && versions.length > 1 && (
        <div className="border-b border-border bg-muted/30 p-2">
          <div className="flex items-center gap-2 flex-wrap">
            {versions.map((version, index) => (
              <Button
                key={version.id}
                variant={index === currentVersionIndex ? "default" : "outline"}
                size="sm"
                onClick={() => handleVersionChange(index)}
                className="h-6 text-xs"
              >
                v{version.version_number}
                {version.created_by_user && <span className="ml-1">👤</span>}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full p-4 bg-transparent border-none resize-none focus:outline-none font-mono text-sm"
            placeholder="Write your content in Markdown..."
          />
        ) : (
          <div className="p-4 bg-background">
            <div className="prose prose-sm prose-gray dark:prose-invert max-w-none">
              <MarkdownRenderer 
                content={displayContent} 
                className="advanced-canvas-content"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {mode === 'expanded' && (
        <div className="flex items-center justify-between p-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          <span>
            Created: {new Date(document.created_at).toLocaleDateString()}
          </span>
          <span>
            Modified: {new Date(document.updated_at).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default AdvancedCanvasView;
