
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MoreHorizontal, Eye, Archive, Trash2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface BusinessIdea {
  id: string;
  ideaName: string;
  score: number;
  maxScore: number;
  date: string;
  status: 'Validated' | 'Promising' | 'Caution' | 'High Risk' | 'Not Recommended' | 'Archived';
  preview: string;
  progressPercentage: number;
  completedSections: string[];
  totalSections: number;
}

interface BusinessIdeaCardProps {
  idea: BusinessIdea;
  onIdeaUpdated?: () => void;
}

const BusinessIdeaCard: React.FC<BusinessIdeaCardProps> = ({ idea, onIdeaUpdated }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validated':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Promising':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Caution':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High Risk':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Not Recommended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-blue-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="enhanced-card hover-lift hover-glow group h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {idea.ideaName}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-2xl font-bold ${getScoreColor(idea.score)}`}>
                {idea.score}
              </span>
              <span className="text-sm text-muted-foreground">/{idea.maxScore}</span>
              <Badge variant="outline" className={getStatusColor(idea.status)}>
                {idea.status}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/idea/${idea.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Archive className="mr-2 h-4 w-4" />
                Archive Idea
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {idea.preview}
        </p>
        
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{idea.progressPercentage}% complete</span>
          </div>
          <Progress value={idea.progressPercentage} className="h-2" />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>{idea.completedSections.length} of {idea.totalSections} sections</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">{idea.date}</span>
          <Button size="sm" className="hover-lift" asChild>
            <Link to={`/dashboard/idea/${idea.id}`}>
              View Dashboard
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessIdeaCard;
