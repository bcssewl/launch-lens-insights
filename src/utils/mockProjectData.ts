
import { Project, AgentOutput, ProjectTemplate, AgentType, TeamMember } from '@/types/projects';

export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Founder',
    avatar: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    role: 'Co-founder',
    avatar: '/placeholder.svg'
  }
];

export const mockAgentOutputs: AgentOutput[] = [
  {
    id: '1',
    projectId: '1',
    agentType: 'validation',
    agentName: 'Idea Validation Agent',
    status: 'completed',
    results: { score: 8.2, recommendation: 'Proceed with development' },
    relationships: ['2', '3'],
    score: 8.2,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    duration: 30,
    insights: ['Strong market demand', 'Clear value proposition', 'Competitive advantage identified']
  },
  {
    id: '2',
    projectId: '1',
    agentType: 'financial',
    agentName: 'Financial Analysis Agent',
    status: 'completed',
    results: { breakEvenMonth: 12, totalCost: 50000 },
    relationships: ['1'],
    score: 7.5,
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
    duration: 60,
    insights: ['Reasonable startup costs', 'Quick path to profitability', 'Low financial risk']
  },
  {
    id: '3',
    projectId: '1',
    agentType: 'market',
    agentName: 'Market Research Agent',
    status: 'in-progress',
    results: null,
    relationships: ['1'],
    created_at: '2024-01-17T08:00:00Z',
    updated_at: '2024-01-17T08:00:00Z',
    insights: []
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'EcoTrack - Carbon Footprint App',
    description: 'A mobile app that helps individuals track and reduce their carbon footprint through gamification and social features.',
    industry: 'Environmental Tech',
    stage: 'validation',
    template: 'saas',
    members: [mockTeamMembers[0], mockTeamMembers[1]],
    agentOutputs: mockAgentOutputs.filter(output => output.projectId === '1'),
    progress: 65,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-17T10:00:00Z',
    tags: ['mobile', 'sustainability', 'b2c'],
    color: '#10b981'
  },
  {
    id: '2',
    name: 'AI Recipe Generator',
    description: 'An AI-powered platform that creates personalized recipes based on dietary restrictions, available ingredients, and taste preferences.',
    industry: 'Food Tech',
    stage: 'ideation',
    template: 'marketplace',
    members: [mockTeamMembers[0]],
    agentOutputs: [],
    progress: 20,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-12T15:00:00Z',
    tags: ['ai', 'food', 'personalization'],
    color: '#f59e0b'
  },
  {
    id: '3',
    name: 'RemoteWork Hub',
    description: 'A comprehensive platform for remote teams with integrated project management, communication, and wellness tracking.',
    industry: 'Productivity',
    stage: 'development',
    template: 'saas',
    members: mockTeamMembers,
    agentOutputs: [],
    progress: 85,
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-01-18T14:00:00Z',
    tags: ['remote-work', 'productivity', 'b2b'],
    color: '#3b82f6'
  }
];

export const mockProjectTemplates: ProjectTemplate[] = [
  {
    id: 'saas',
    name: 'SaaS Application',
    description: 'Software as a Service business model with recurring revenue',
    industry: 'Technology',
    recommendedAgents: ['validation', 'financial', 'market', 'competitor'],
    estimatedTimeline: '3-6 months',
    complexity: 'medium',
    icon: 'rocket'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'Online retail business selling physical or digital products',
    industry: 'Retail',
    recommendedAgents: ['validation', 'market', 'competitor', 'financial'],
    estimatedTimeline: '2-4 months',
    complexity: 'simple',
    icon: 'shopping-cart'
  },
  {
    id: 'marketplace',
    name: 'Marketplace Platform',
    description: 'Two-sided marketplace connecting buyers and sellers',
    industry: 'Platform',
    recommendedAgents: ['validation', 'market', 'business-plan', 'financial'],
    estimatedTimeline: '6-12 months',
    complexity: 'complex',
    icon: 'users'
  },
  {
    id: 'service',
    name: 'Service Business',
    description: 'Professional services or consulting business',
    industry: 'Services',
    recommendedAgents: ['validation', 'market', 'financial'],
    estimatedTimeline: '1-3 months',
    complexity: 'simple',
    icon: 'briefcase'
  }
];

export const mockAgentTypes: AgentType[] = [
  {
    id: 'validation',
    name: 'Idea Validation Agent',
    description: 'Analyzes market demand, feasibility, and overall viability of your business idea',
    category: 'validation',
    estimatedDuration: '15-30 minutes',
    dependencies: [],
    outputs: ['Viability score', 'Market analysis', 'Risk assessment', 'Recommendations'],
    icon: 'lightbulb'
  },
  {
    id: 'financial',
    name: 'Financial Analysis Agent',
    description: 'Projects revenue, costs, break-even analysis, and funding requirements',
    category: 'analysis',
    estimatedDuration: '20-40 minutes',
    dependencies: ['validation'],
    outputs: ['Financial projections', 'Break-even analysis', 'Funding needs', 'Cost structure'],
    icon: 'dollar-sign'
  },
  {
    id: 'market',
    name: 'Market Research Agent',
    description: 'Deep dive into target market, customer segments, and market size',
    category: 'research',
    estimatedDuration: '30-60 minutes',
    dependencies: ['validation'],
    outputs: ['Market size analysis', 'Customer personas', 'Market trends', 'Growth opportunities'],
    icon: 'target'
  },
  {
    id: 'competitor',
    name: 'Competitor Analysis Agent',
    description: 'Identifies and analyzes direct and indirect competitors',
    category: 'research',
    estimatedDuration: '25-45 minutes',
    dependencies: ['validation', 'market'],
    outputs: ['Competitor landscape', 'Competitive advantages', 'Market positioning', 'Differentiation strategy'],
    icon: 'sword'
  },
  {
    id: 'swot',
    name: 'SWOT Analysis Agent',
    description: 'Comprehensive strengths, weaknesses, opportunities, and threats analysis',
    category: 'analysis',
    estimatedDuration: '20-35 minutes',
    dependencies: ['validation', 'market', 'competitor'],
    outputs: ['SWOT matrix', 'Strategic recommendations', 'Risk mitigation', 'Growth strategies'],
    icon: 'shield'
  },
  {
    id: 'business-plan',
    name: 'Business Plan Generator',
    description: 'Creates a comprehensive business plan based on all previous analyses',
    category: 'planning',
    estimatedDuration: '45-90 minutes',
    dependencies: ['validation', 'financial', 'market', 'competitor'],
    outputs: ['Executive summary', 'Business model canvas', 'Go-to-market strategy', 'Implementation roadmap'],
    icon: 'book-open'
  },
  {
    id: 'risk',
    name: 'Risk Assessment Agent',
    description: 'Identifies potential risks and develops mitigation strategies',
    category: 'analysis',
    estimatedDuration: '15-30 minutes',
    dependencies: ['validation', 'financial', 'market'],
    outputs: ['Risk matrix', 'Mitigation strategies', 'Contingency plans', 'Success factors'],
    icon: 'alert-triangle'
  }
];

export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find(project => project.id === id);
};

export const getAgentOutputsForProject = (projectId: string): AgentOutput[] => {
  return mockAgentOutputs.filter(output => output.projectId === projectId);
};

export const getProjectsByStage = (stage: Project['stage']): Project[] => {
  return mockProjects.filter(project => project.stage === stage);
};

export const getProjectsByIndustry = (industry: string): Project[] => {
  return mockProjects.filter(project => project.industry === industry);
};
