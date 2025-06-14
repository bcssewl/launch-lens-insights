
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    if (score >= 7) return 'text-green-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
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
      <Card className={`group hover:shadow-lg transition-all duration-300 border hover:border-primary/20 ${idea.isArchived ? 'opacity-75' : ''} relative`}>
        <CardContent className="p-6">
          {/* Header with Score and Menu */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-bold ${getScoreColor(idea.validationScore)}`}>
                {idea.validationScore.toFixed(1)}
                <span className="text-lg font-normal text-muted-foreground">/10</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                Validated
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
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

          {/* Title and Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
              {idea.ideaName}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {idea.oneLineDescription}
            </p>
          </div>

          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Progress</span>
              <span className="text-sm font-medium text-foreground">{Math.round(idea.completionPercentage)}%</span>
            </div>
            <Progress 
              value={idea.completionPercentage} 
              className="h-2 mb-2"
            />
            <p className="text-xs text-muted-foreground">
              {idea.completedSections} of {idea.totalSections} sections
            </p>
          </div>

          {/* Action Button */}
          <div className="mb-4">
            <Button asChild className="w-full bg-primary hover:bg-primary/90" disabled={idea.isArchived}>
              <Link to={`/dashboard/business-idea/${idea.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Date */}
          <div className="text-xs text-muted-foreground text-center">
            {idea.dateValidated}
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
