
export interface Project {
  id: string;
  name: string;
  description: string;
  industry: string;
  stage: 'ideation' | 'validation' | 'development' | 'launch';
  template: string;
  members: TeamMember[];
  agentOutputs: AgentOutput[];
  progress: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  color: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface AgentOutput {
  id: string;
  projectId: string;
  agentType: 'validation' | 'financial' | 'market' | 'competitor' | 'swot' | 'business-plan' | 'risk';
  agentName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  results: any;
  relationships: string[];
  score?: number;
  created_at: string;
  updated_at: string;
  duration?: number;
  insights: string[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  recommendedAgents: string[];
  estimatedTimeline: string;
  complexity: 'simple' | 'medium' | 'complex';
  icon: string;
}

export interface AgentType {
  id: string;
  name: string;
  description: string;
  category: 'analysis' | 'research' | 'planning' | 'validation';
  estimatedDuration: string;
  dependencies: string[];
  outputs: string[];
  icon: string;
}
