
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, Copy, Archive, Trash2, ArchiveRestore, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useIdeaOperations } from '@/hooks/useIdeaOperations';

export interface BusinessIdea {
  id: string;
  ideaName: string;
  oneLineDescription: string;
  validationScore: number;
  dateValidated: string;
  completionPercentage: number;
  completedSections: number;
  totalSections: number;
  isArchived: boolean;
  status: string;
}

interface BusinessIdeaCardProps {
  idea: BusinessIdea;
  onIdeaUpdated?: () => void;
}

const BusinessIdeaCard: React.FC<BusinessIdeaCardProps> = ({ idea, onIdeaUpdated }) => {
  const navigate = useNavigate();
  const { archiveIdea, deleteIdea, unarchiveIdea, loading } = useIdeaOperations();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 dark:text-green-400';
    if (score >= 4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 7) return 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-700';
    if (score >= 4) return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
    return 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 border-red-300 dark:border-red-700';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 60) return 'bg-green-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleDuplicate = () => {
    navigate(`/dashboard/validate?duplicateId=${idea.id}`);
  };

  const handleArchive = async () => {
    const success = await archiveIdea(idea.id);
    if (success && onIdeaUpdated) {
      onIdeaUpdated();
    }
  };

  const handleUnarchive = async () => {
    const success = await unarchiveIdea(idea.id);
    if (success && onIdeaUpdated) {
      onIdeaUpdated();
    }
  };

  const handleDelete = async () => {
    const success = await deleteIdea(idea.id);
    if (success && onIdeaUpdated) {
      onIdeaUpdated();
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className={`group hover:shadow-lg transition-all duration-300 border hover:border-primary/20 ${idea.isArchived ? 'opacity-75' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-foreground truncate">
                {idea.ideaName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{idea.dateValidated}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge className={`${getScoreBadgeColor(idea.validationScore)} whitespace-nowrap`}>
                {idea.validationScore.toFixed(1)}/10
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {idea.isArchived ? (
                    <DropdownMenuItem onClick={handleUnarchive} disabled={loading}>
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                      Unarchive
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={handleArchive} disabled={loading}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate & Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)} 
                    disabled={loading}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {idea.oneLineDescription}
          </p>
          
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Progress: {idea.completedSections} of {idea.totalSections} sections</span>
              <span>{Math.round(idea.completionPercentage)}%</span>
            </div>
            <Progress 
              value={idea.completionPercentage} 
              className="h-2"
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button asChild variant="default" size="sm" className="flex-1" disabled={idea.isArchived}>
              <Link to={`/dashboard/business-idea/${idea.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business Idea</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{idea.ideaName}"? This action cannot be undone and will delete both the idea and its analysis data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BusinessIdeaCard;
