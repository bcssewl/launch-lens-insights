
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Copy, Archive, Trash2, ArchiveRestore, MoreHorizontal } from 'lucide-react';
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

export interface Report {
  id: string;
  ideaName: string;
  score: number;
  maxScore: number;
  date: string;
  status: 'Validated' | 'Promising' | 'Caution' | 'High Risk' | 'Not Recommended' | 'Archived';
  preview: string;
}

interface ReportCardProps {
  report: Report;
  onReportUpdated?: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onReportUpdated }) => {
  const navigate = useNavigate();
  const { archiveIdea, deleteIdea, unarchiveIdea, loading } = useIdeaOperations();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'Validated':
        return 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 border-green-300 dark:border-green-700';
      case 'Promising':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 border-blue-300 dark:border-blue-700';
      case 'Caution':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800 border-yellow-300 dark:border-yellow-700';
      case 'High Risk':
      case 'Not Recommended':
        return 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 border-red-300 dark:border-red-700';
      case 'Archived':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700';
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleDuplicate = () => {
    navigate(`/dashboard/validate?duplicateId=${report.id}`);
  };

  const handleArchive = async () => {
    const success = await archiveIdea(report.id);
    if (success && onReportUpdated) {
      onReportUpdated();
    }
  };

  const handleUnarchive = async () => {
    const success = await unarchiveIdea(report.id);
    if (success && onReportUpdated) {
      onReportUpdated();
    }
  };

  const handleDelete = async () => {
    const success = await deleteIdea(report.id);
    if (success && onReportUpdated) {
      onReportUpdated();
    }
    setShowDeleteDialog(false);
  };

  const isArchived = report.status === 'Archived';

  return (
    <>
      <Card className={`group hover:shadow-lg transition-all duration-300 border hover:border-primary/20 ${isArchived ? 'opacity-75' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-foreground truncate">
                {report.ideaName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{report.date}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className={`text-2xl font-bold ${getScoreColor(report.score, report.maxScore)}`}>
                {report.score.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">/{report.maxScore}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isArchived ? (
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
          <Badge className={`${getStatusColor(report.status)} whitespace-nowrap`}>
            {report.status}
          </Badge>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {report.preview}
          </p>
          
          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline" size="sm" className="flex-1" disabled={isArchived}>
              <Link to={`/results/${report.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Report
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDuplicate}
              className="flex-1"
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate & Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Idea</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{report.ideaName}"? This action cannot be undone and will delete both the idea and its analysis report.
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

export default ReportCard;
