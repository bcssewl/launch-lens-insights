
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useValidationReports } from '@/hooks/useValidationReports';
import { Loader2, FileText } from 'lucide-react';

interface ProjectSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onAttach: (projectId: string, projectName: string) => void;
}

const ProjectSelectionModal: React.FC<ProjectSelectionModalProps> = ({
  open,
  onClose,
  onAttach,
}) => {
  const { reports, loading } = useValidationReports();
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  const completedReports = reports.filter(report => report.status === 'completed');

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleAttachSelected = () => {
    selectedProjects.forEach(projectId => {
      const report = completedReports.find(r => r.validation_id === projectId);
      if (report) {
        onAttach(projectId, report.idea_name || 'Untitled Project');
      }
    });
    setSelectedProjects(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelectedProjects(new Set());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Projects from Database</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading projects...</span>
            </div>
          ) : completedReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No completed projects found</p>
              <p className="text-sm">Visit the Business Ideas page to create your first project.</p>
            </div>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {completedReports.map(report => (
                  <div
                    key={report.validation_id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleProjectToggle(report.validation_id)}
                  >
                    <Checkbox
                      checked={selectedProjects.has(report.validation_id)}
                      onChange={() => handleProjectToggle(report.validation_id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm truncate">
                          {report.idea_name || 'Untitled Project'}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {report.overall_score || 0}/10
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {report.one_line_description || 'No description'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAttachSelected}
                  disabled={selectedProjects.size === 0}
                >
                  Attach Selected ({selectedProjects.size})
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSelectionModal;
