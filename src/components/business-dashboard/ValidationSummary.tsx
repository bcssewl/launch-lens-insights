
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ValidationSummaryProps {
  report: any;
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({ report }) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {report.idea_name || 'Untitled Idea'}
          </h2>
          <p className="text-gray-600 mb-4">
            {report.one_line_description || 'No description available'}
          </p>
          <div className="flex items-center gap-4">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1">
              Validated
            </Badge>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              Updated {report.completed_at 
                ? new Date(report.completed_at).toLocaleDateString()
                : new Date(report.created_at).toLocaleDateString()
              }
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-4xl font-bold mb-2">
            <span className={getScoreColor(report.overall_score || 0)}>
              {(report.overall_score || 0).toFixed(1)}
            </span>
            <span className="text-lg text-gray-400">/10</span>
          </div>
          <p className="text-sm text-gray-500">Validation Score</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-900 mb-2">Recommendation</h3>
        <p className="text-gray-600 mb-4">
          {report.recommendation || 'Analysis completed successfully.'}
        </p>
        
        <div className="flex gap-3">
          <Button asChild>
            <Link to={`/results/${report.id}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Report
            </Link>
          </Button>
          <Button variant="outline">
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ValidationSummary;
