
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Settings, Users, Globe, Calendar } from 'lucide-react';
import { useReportSharing } from '@/hooks/useReportSharing';
import { format } from 'date-fns';

interface ManageSharesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
}

const ManageSharesDialog: React.FC<ManageSharesDialogProps> = ({
  open,
  onOpenChange,
  reportId,
}) => {
  const { shares, loading, deleteShare, updateShareAccess } = useReportSharing(reportId);

  const handleDeleteShare = async (shareId: string) => {
    await deleteShare(shareId);
  };

  const handleUpdateAccess = async (shareId: string, newAccessLevel: string) => {
    await updateShareAccess(shareId, newAccessLevel);
  };

  const getShareTypeIcon = (sharedWith: string | undefined) => {
    return sharedWith ? (
      <Users className="h-4 w-4 text-blue-500" />
    ) : (
      <Globe className="h-4 w-4 text-green-500" />
    );
  };

  const getAccessLevelColor = (accessLevel: string) => {
    switch (accessLevel) {
      case 'view': return 'text-gray-600';
      case 'comment': return 'text-orange-600';
      case 'edit': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Report Shares
          </DialogTitle>
          <DialogDescription>
            View and manage who has access to this report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading shares...
            </div>
          ) : shares.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No shares found. Create a share link to get started.
            </div>
          ) : (
            shares.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getShareTypeIcon(share.shared_with)}
                  <div className="flex-1">
                    <div className="font-medium">
                      {share.shared_with ? 'Specific User' : 'Public Link'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {share.shared_with ? `Shared with: ${share.shared_with}` : 'Anyone with the link'}
                    </div>
                    {share.expires_at && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        Expires: {format(new Date(share.expires_at), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={share.access_level}
                    onValueChange={(value) => handleUpdateAccess(share.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View only</SelectItem>
                      <SelectItem value="comment">View & comment</SelectItem>
                      <SelectItem value="edit">View & edit</SelectItem>
                    </SelectContent>
                  </Select>

                  <span className={`text-sm font-medium ${getAccessLevelColor(share.access_level)}`}>
                    {share.access_level}
                  </span>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Share</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this share? This action cannot be undone and will immediately revoke access.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteShare(share.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageSharesDialog;
