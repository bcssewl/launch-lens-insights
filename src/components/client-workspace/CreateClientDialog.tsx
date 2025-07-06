
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building2, Loader2 } from 'lucide-react';
import { useClientOperations } from '@/hooks/useClientOperations';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CreateClientDialogProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
}

const industryOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Automotive',
  'Consumer Goods',
  'FinTech',
  'Hospitality',
  'Energy',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Education',
  'Other'
];

const CreateClientDialog: React.FC<CreateClientDialogProps> = ({ children, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: ''
  });

  const { createClient } = useClientOperations();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Client name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const clientId = await createClient(formData);
      
      toast({
        title: "Success",
        description: `Client "${formData.name}" has been created successfully`,
      });

      // Reset form
      setFormData({ name: '', industry: '', description: '' });
      setOpen(false);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Navigate to the new client workspace
      navigate(`/dashboard/client/${clientId}`);
      
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Client
          </DialogTitle>
          <DialogDescription>
            Add a new client to your workspace. You'll be able to manage their files, projects, and communications from their dedicated workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client-name">Client Name *</Label>
            <Input
              id="client-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter client name..."
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label htmlFor="client-industry">Industry</Label>
            <Select 
              value={formData.industry} 
              onValueChange={(value) => handleInputChange('industry', value)}
              disabled={loading}
            >
              <SelectTrigger id="client-industry">
                <SelectValue placeholder="Select industry..." />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="client-description">Description</Label>
            <Textarea
              id="client-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the client and engagement..."
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Client
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientDialog;
