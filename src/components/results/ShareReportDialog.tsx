
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Check, Globe, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShareReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  reportTitle: string;
}

const ShareReportDialog: React.FC<ShareReportDialogProps> = ({
  open,
  onOpenChange,
  reportId,
  reportTitle,
}) => {
  const [accessLevel, setAccessLevel] = useState('view');
  const [expirationDays, setExpirationDays] = useState('30');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createShare = async () => {
    setLoading(true);
    try {
      console.log('Creating share with params:', {
        p_report_id: reportId,
        p_shared_with: null, // Always null for public sharing
        p_access_level: accessLevel,
        p_expires_in_days: parseInt(expirationDays),
      });

      const { data, error } = await supabase.rpc('create_report_share', {
        p_report_id: reportId,
        p_shared_with: null, // Always public
        p_access_level: accessLevel,
        p_expires_in_days: parseInt(expirationDays),
      });

      console.log('RPC response:', { data, error });

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const shareData = data[0];
        console.log('Share data received:', shareData);
        
        // Create the public share URL using the share token
        if (shareData.share_token) {
          const shareUrl = `${window.location.origin}/shared-report/${shareData.share_token}`;
          setShareUrl(shareUrl);
          toast({
            title: 'Share link created',
            description: 'Public share link generated',
          });
        } else {
          throw new Error('No share token returned from function');
        }
      } else {
        throw new Error('No share data returned from function');
      }
    } catch (error) {
      console.error('Error creating share:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create share link',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Share link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setShareUrl('');
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Share Report
          </DialogTitle>
          <DialogDescription>
            Create a public link to share "{reportTitle}" with anyone
          </DialogDescription>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-6">
            {/* Access Level */}
            <div className="space-y-2">
              <Label htmlFor="access-level">Access level</Label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View only</SelectItem>
                  <SelectItem value="comment">View and comment</SelectItem>
                  <SelectItem value="edit">View and edit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label htmlFor="expiration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Expires in
              </Label>
              <Select value={expirationDays} onValueChange={setExpirationDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          /* Share URL Display */
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Share link</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="font-mono text-sm" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This link will expire in {expirationDays} days and provides {accessLevel} access.
            </p>
          </div>
        )}

        <DialogFooter>
          {!shareUrl ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={createShare}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Share Link'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareReportDialog;
