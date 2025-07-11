import React from 'react';
import { Loader2, Search, Zap } from 'lucide-react';
import SourceCard from './SourceCard';

interface SourceCardProps {
  name: string;
  url: string;
  type: string;
  confidence: number;
}

interface StreamingProgressProps {
  currentPhase: string;
  progress: number;
  searchQueries?: string[];
  discoveredSources: SourceCardProps[];
  isVisible?: boolean;
}

const StreamingProgress: React.FC<StreamingProgressProps> = ({ 
  currentPhase, 
  progress, 
  searchQueries = [], 
  discoveredSources = [],
  isVisible = true 
}) => {
  if (!isVisible) return null;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 mb-4">
      {/* Header with Icon and Phase */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {currentPhase || 'Processing...'}
          </h3>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Research Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>

      {/* Search Queries */}
      {searchQueries.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Search Queries</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {searchQueries.slice(-3).map((query, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200"
              >
                {query}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Discovered Sources */}
      {discoveredSources.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">
              Sources Found ({discoveredSources.length})
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {discoveredSources.slice(-4).map((source, index) => (
              <SourceCard
                key={index}
                name={source.name}
                url={source.url}
                type={source.type}
                confidence={source.confidence}
                isClickable={false} // Don't allow clicking during streaming
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingProgress;
