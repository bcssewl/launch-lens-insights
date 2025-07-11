import React from 'react';
import { Loader2, Search, Zap, Users, CheckCircle } from 'lucide-react';
import SourceCard from './SourceCard';

interface SourceCardProps {
  name: string;
  url: string;
  type: string;
  confidence: number;
}

interface Agent {
  name: string;
  status: 'active' | 'complete' | 'waiting' | 'error';
  progress: number;
}

interface StreamingProgressProps {
  currentPhase: string;
  progress: number;
  searchQueries?: string[];
  discoveredSources: SourceCardProps[];
  activeAgents?: Agent[];
  collaborationMode?: 'sequential' | 'parallel' | 'hierarchical' | null;
  isVisible?: boolean;
}

const StreamingProgress: React.FC<StreamingProgressProps> = ({ 
  currentPhase, 
  progress, 
  searchQueries = [], 
  discoveredSources = [],
  activeAgents = [],
  collaborationMode = null,
  isVisible = true 
}) => {
  if (!isVisible) return null;

  // Get credibility color for enhanced source display
  const getCredibilityColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50 border-green-200'; // High credibility
    if (confidence >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';   // Medium credibility  
    if (confidence >= 60) return 'text-amber-600 bg-amber-50 border-amber-200'; // Low credibility
    return 'text-red-600 bg-red-50 border-red-200'; // Very low credibility
  };

  const getAgentStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />;
      case 'complete': return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'error': return <div className="w-3 h-3 rounded-full bg-red-500" />;
      default: return <div className="w-3 h-3 rounded-full bg-gray-300" />;
    }
  };

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
          {collaborationMode && (
            <p className="text-xs text-gray-500 mt-1">
              Agent collaboration: {collaborationMode}
            </p>
          )}
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

      {/* Active Agents */}
      {activeAgents.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Active Agents</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeAgents.map((agent, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                {getAgentStatusIcon(agent.status)}
                <span className="text-xs font-medium flex-1">{agent.name}</span>
                <span className="text-xs text-gray-500">{agent.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
