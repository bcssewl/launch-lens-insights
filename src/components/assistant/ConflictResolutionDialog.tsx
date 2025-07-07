
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, Users } from 'lucide-react';

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (resolvedContent: string) => void;
  currentContent: string;
  latestContent: string;
  onAcceptLatest: () => void;
}

const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
  isOpen,
  onClose,
  onResolve,
  currentContent,
  latestContent,
  onAcceptLatest
}) => {
  const [mergedContent, setMergedContent] = useState(currentContent);
  const [activeTab, setActiveTab] = useState<'current' | 'latest' | 'merged'>('merged');

  const handleResolve = () => {
    onResolve(mergedContent);
    onClose();
  };

  const handleAcceptLatest = () => {
    onAcceptLatest();
    onClose();
  };

  const handleUseCurrent = () => {
    onResolve(currentContent);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Merge Conflict Detected
          </DialogTitle>
        </DialogHeader>

        <Alert className="mb-4">
          <Users className="h-4 w-4" />
          <AlertDescription>
            Another user has modified this document while you were editing. 
            Choose how to resolve the conflict below.
          </AlertDescription>
        </Alert>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Tab Navigation */}
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'current'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Your Changes
            </button>
            <button
              onClick={() => setActiveTab('latest')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'latest'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Latest Version
            </button>
            <button
              onClick={() => setActiveTab('merged')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'merged'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Merge Editor
            </button>
          </div>

          {/* Content Display */}
          <div className="flex-1 min-h-0">
            {activeTab === 'current' && (
              <div className="h-full">
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  Your unsaved changes
                </div>
                <Textarea
                  value={currentContent}
                  readOnly
                  className="h-full resize-none font-mono text-sm"
                />
              </div>
            )}

            {activeTab === 'latest' && (
              <div className="h-full">
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  Latest saved version
                </div>
                <Textarea
                  value={latestContent}
                  readOnly
                  className="h-full resize-none font-mono text-sm"
                />
              </div>
            )}

            {activeTab === 'merged' && (
              <div className="h-full">
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                  <AlertTriangle className="h-4 w-4" />
                  Manually merge the changes
                </div>
                <Textarea
                  value={mergedContent}
                  onChange={(e) => setMergedContent(e.target.value)}
                  className="h-full resize-none font-mono text-sm"
                  placeholder="Edit this content to merge your changes with the latest version..."
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleUseCurrent}>
              Use My Changes
            </Button>
            <Button variant="outline" onClick={handleAcceptLatest}>
              Use Latest Version
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!mergedContent.trim()}>
              Save Merged Content
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConflictResolutionDialog;
