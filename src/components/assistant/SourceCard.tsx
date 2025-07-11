import React from 'react';
import { ExternalLink, Globe, FileText, Database } from 'lucide-react';

interface SourceCardProps {
  name: string;
  url: string;
  type: string;
  confidence: number;
  isClickable?: boolean;
}

const SourceCard: React.FC<SourceCardProps> = ({ 
  name, 
  url, 
  type, 
  confidence, 
  isClickable = true 
}) => {
  const handleClick = () => {
    if (isClickable && url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getSourceIcon = () => {
    switch (type.toLowerCase()) {
      case 'pdf':
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'database':
      case 'api':
        return <Database className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = () => {
    // Following the color guidelines from the quick reference
    if (confidence >= 90) return 'text-green-600 bg-green-50 border-green-200'; // High credibility - Green
    if (confidence >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';   // Medium credibility - Blue  
    if (confidence >= 60) return 'text-amber-600 bg-amber-50 border-amber-200'; // Low credibility - Amber
    return 'text-red-600 bg-red-50 border-red-200'; // Very low credibility - Red
  };

  const getCredibilityLabel = () => {
    if (confidence >= 90) return 'High';
    if (confidence >= 75) return 'Medium';
    if (confidence >= 60) return 'Low';
    return 'Very Low';
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative bg-white border border-gray-200 rounded-lg p-3 
        transition-all duration-200 hover:shadow-md hover:border-gray-300
        ${isClickable && url ? 'cursor-pointer' : 'cursor-default'}
        max-w-sm
      `}
    >
      {/* Source Info */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-gray-500 mt-0.5">
          {getSourceIcon()}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-5">
            {name}
          </h4>
          
          <div className="flex items-center gap-2 mt-2">
            {/* Type Badge */}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {type}
            </span>
            
            {/* Enhanced Credibility Badge with label */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getConfidenceColor()}`}>
              {getCredibilityLabel()} ({confidence}%)
            </span>
          </div>
        </div>
        
        {/* External Link Icon */}
        {isClickable && url && (
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SourceCard;
