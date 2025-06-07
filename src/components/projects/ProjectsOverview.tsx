
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search as SearchIcon, Filter } from 'lucide-react';
import ProjectCard from './ProjectCard';
import CreateProjectDialog from './CreateProjectDialog';
import ProjectFilters from './ProjectFilters';
import { mockProjects } from '@/utils/mockProjectData';
import { Project } from '@/types/projects';

const ProjectsOverview: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projects] = useState<Project[]>(mockProjects);

  // Filter and search projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'all' || project.stage === filterStage;
    const matchesIndustry = filterIndustry === 'all' || project.industry === filterIndustry;
    
    return matchesSearch && matchesStage && matchesIndustry;
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'progress':
        return b.progress - a.progress;
      case 'stage':
        return a.stage.localeCompare(b.stage);
      case 'recent':
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  const projectStats = {
    total: projects.length,
    ideation: projects.filter(p => p.stage === 'ideation').length,
    validation: projects.filter(p => p.stage === 'validation').length,
    development: projects.filter(p => p.stage === 'development').length,
    launch: projects.filter(p => p.stage === 'launch').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">All Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all your business ideas in one place
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-lg p-4 border">
          <div className="text-2xl font-bold text-foreground">{projectStats.total}</div>
          <div className="text-sm text-muted-foreground">Total Projects</div>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <div className="text-2xl font-bold text-yellow-600">{projectStats.ideation}</div>
          <div className="text-sm text-muted-foreground">Ideation</div>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <div className="text-2xl font-bold text-blue-600">{projectStats.validation}</div>
          <div className="text-sm text-muted-foreground">Validation</div>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <div className="text-2xl font-bold text-purple-600">{projectStats.development}</div>
          <div className="text-sm text-muted-foreground">Development</div>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <div className="text-2xl font-bold text-green-600">{projectStats.launch}</div>
          <div className="text-sm text-muted-foreground">Launched</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="ideation">Ideation</SelectItem>
            <SelectItem value="validation">Validation</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="launch">Launch</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterIndustry} onValueChange={setFilterIndustry}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            <SelectItem value="Environmental Tech">Environmental Tech</SelectItem>
            <SelectItem value="Food Tech">Food Tech</SelectItem>
            <SelectItem value="Productivity">Productivity</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="stage">Stage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      {sortedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
            <PlusCircle className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || filterStage !== 'all' || filterIndustry !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first project to get started.'
            }
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      )}

      {/* Create Project Dialog */}
      <CreateProjectDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};

export default ProjectsOverview;
