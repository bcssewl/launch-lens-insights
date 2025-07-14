// Enhanced Stratix Streaming Event Types
// Matches backend specification for professional streaming experience

export interface StratixStreamingEvent {
  type: 'connection_confirmed' | 'routing_analysis' | 'research_progress' | 
        'source_discovered' | 'sources_complete' | 'expert_analysis_started' |
        'expert_analysis_complete' | 'synthesis_progress' | 'partial_result' | 
        'complete' | 'error' | 'ping';
  timestamp: string;
  message: string;
  agent?: string;
  agent_name?: string;
  connection_id?: string;
  data?: {
    // Agent routing
    agents?: string[];
    collaboration_pattern?: 'parallel' | 'sequential' | 'collaborative';
    complexity?: 'simple' | 'medium' | 'complex';
    reasoning?: string;
    
    // Research progress
    content_preview?: string;
    status?: string;
    progress?: number;
    current_phase?: string;
    
    // Source discovery
    source_name?: string;
    source_url?: string;
    source_type?: string;
    clickable?: boolean;
    sources_found?: number;
    sources?: StratixSource[];
    
    // Expert analysis
    confidence?: 'Low' | 'Medium' | 'High';
    sources_used?: number;
    
    // Synthesis and partial results
    model?: string;
    task_type?: string;
    total_sections?: number;
    text?: string; // For partial_result streaming
    
    // Final completion
    final_answer?: string;
    methodology?: string;
    analysis_depth?: 'basic' | 'comprehensive' | 'expert';
    session_id?: string;
  };
}

export interface StratixSource {
  name: string;
  url: string;
  type: 'research' | 'news' | 'academic' | 'industry' | 'web';
  confidence: number;
  clickable: boolean;
  discoveredBy?: string; // Agent name
  timestamp?: string;
}

export interface StratixAgent {
  id: string; // Use deterministic names for consistent mapping
  name: string;
  role: 'market_research' | 'business_strategy' | 'financial_analysis' | 'technical_analysis';
  status: 'idle' | 'analyzing' | 'searching' | 'complete' | 'error';
  progress?: number;
}

export interface StratixStreamingState {
  isStreaming: boolean;
  currentPhase: string;
  overallProgress: number;
  activeAgents: StratixAgent[];
  collaborationMode?: 'parallel' | 'sequential' | 'collaborative';
  discoveredSources: StratixSource[];
  synthesisModel?: string;
  partialText: string; // For ChatGPT-like streaming
  error: string | null;
  connectionId?: string;
  lastHeartbeat?: number;
}

// Progress phase definitions for consistent UX
export const PROGRESS_PHASES = {
  CONNECTION: { range: [0, 5], label: 'Connecting' },
  ROUTING: { range: [5, 15], label: 'Selecting Specialists' },
  RESEARCH: { range: [15, 70], label: 'Multi-Agent Research' },
  ANALYSIS: { range: [70, 85], label: 'Expert Analysis' },
  SYNTHESIS: { range: [85, 95], label: 'Synthesizing Insights' },
  COMPLETION: { range: [95, 100], label: 'Finalizing Report' }
} as const;

// Agent role configurations for consistent mapping
export const AGENT_CONFIGS = {
  market_research: {
    name: 'Market Research Specialist',
    color: '#10b981', // Green
    icon: 'TrendingUp'
  },
  business_strategy: {
    name: 'Strategic Business Consultant',
    color: '#8b5cf6', // Purple
    icon: 'Target'
  },
  financial_analysis: {
    name: 'Financial Analysis Expert',
    color: '#f59e0b', // Amber
    icon: 'DollarSign'
  },
  technical_analysis: {
    name: 'Technical Analysis Specialist',
    color: '#3b82f6', // Blue
    icon: 'Cpu'
  }
} as const;

// Source type configurations
export const SOURCE_TYPE_CONFIGS = {
  research: { icon: 'FileText', color: '#10b981' },
  news: { icon: 'Newspaper', color: '#f59e0b' },
  academic: { icon: 'GraduationCap', color: '#8b5cf6' },
  industry: { icon: 'Building2', color: '#3b82f6' },
  web: { icon: 'Globe', color: '#6b7280' }
} as const;
