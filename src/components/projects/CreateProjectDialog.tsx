
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Rocket, ShoppingCart, Users, Briefcase } from 'lucide-react';
import { mockProjectTemplates } from '@/utils/mockProjectData';
import { ProjectTemplate } from '@/types/projects';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    industry: '',
    template: ''
  });

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'rocket':
        return <Rocket className="h-6 w-6" />;
      case 'shopping-cart':
        return <ShoppingCart className="h-6 w-6" />;
      case 'users':
        return <Users className="h-6 w-6" />;
      case 'briefcase':
        return <Briefcase className="h-6 w-6" />;
      default:
        return <Rocket className="h-6 w-6" />;
    }
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setProjectData(prev => ({ 
      ...prev, 
      template: template.id,
      industry: template.industry 
    }));
    setStep(2);
  };

  const handleCreateProject = () => {
    // Here you would normally create the project
    console.log('Creating project:', { ...projectData, template: selectedTemplate });
    
    // Reset and close
    setStep(1);
    setSelectedTemplate(null);
    setProjectData({ name: '', description: '', industry: '', template: '' });
    onOpenChange(false);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedTemplate(null);
    setProjectData({ name: '', description: '', industry: '', template: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>Choose a Project Template</DialogTitle>
              <DialogDescription>
                Select a template that best matches your business idea. You can customize it later.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {mockProjectTemplates.map(template => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg cursor-pointer hover:border-primary hover:shadow-md transition-all"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getTemplateIcon(template.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">{template.complexity}</Badge>
                        <span className="text-xs text-muted-foreground">{template.estimatedTimeline}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Project Details</DialogTitle>
              <DialogDescription>
                Provide basic information about your project.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              {selectedTemplate && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-primary/10 rounded text-primary">
                      {getTemplateIcon(selectedTemplate.icon)}
                    </div>
                    <span className="font-medium">{selectedTemplate.name}</span>
                    <Badge variant="outline">{selectedTemplate.complexity}</Badge>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your project name"
                  value={projectData.name}
                  onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your business idea"
                  value={projectData.description}
                  onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select 
                  value={projectData.industry} 
                  onValueChange={(value) => setProjectData(prev => ({ ...prev, industry: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={handleCreateProject}
                disabled={!projectData.name || !projectData.description}
              >
                Create Project
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
