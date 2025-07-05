
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Calendar, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ClientTasksProps {
  client: {
    name: string;
  };
}

const mockTasks = [
  {
    id: 1,
    title: 'Complete market size analysis for European expansion',
    description: 'Analyze total addressable market for electric vehicles in EU',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2024-12-25',
    assignee: 'AI Agent',
    category: 'AI Generated',
  },
  {
    id: 2,
    title: 'Review competitive pricing strategy',
    description: 'Compare Tesla pricing with main competitors in target markets',
    priority: 'medium',
    status: 'pending',
    dueDate: '2024-12-28',
    assignee: 'Manual',
    category: 'Manual Task',
  },
  {
    id: 3,
    title: 'Prepare client presentation for Q1 strategy',
    description: 'Create comprehensive presentation with findings and recommendations',
    priority: 'high',
    status: 'completed',
    dueDate: '2024-12-20',
    assignee: 'Manual',
    category: 'Manual Task',
  },
  {
    id: 4,
    title: 'Generate financial projections report',
    description: 'AI-generated 5-year financial forecasting based on market data',
    priority: 'medium',
    status: 'completed',
    dueDate: '2024-12-18',
    assignee: 'AI Agent',
    category: 'AI Generated',
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'low':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'in_progress':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'pending':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const ClientTasks: React.FC<ClientTasksProps> = ({ client }) => {
  const completedTasks = mockTasks.filter(task => task.status === 'completed').length;
  const totalTasks = mockTasks.length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tasks & Action Plans</h2>
          <p className="text-muted-foreground">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Task Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {mockTasks.filter(task => task.status === 'in_progress').length}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-red-600">
              {mockTasks.filter(task => task.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {mockTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Checkbox 
                  checked={task.status === 'completed'}
                  className="mt-1"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <p className="text-muted-foreground text-sm">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority} priority
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.assignee}
                    </div>
                    <Badge variant="outline">{task.category}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Action Plans */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Action Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h4 className="font-semibold">Market Expansion Strategy</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Based on market analysis report, recommended next steps:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Conduct detailed competitor pricing analysis</li>
              <li>• Identify key partnership opportunities in EU</li>
              <li>• Develop localized marketing strategy</li>
              <li>• Assess regulatory requirements per country</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold">Financial Optimization</h4>
            <p className="text-sm text-muted-foreground mb-2">
              AI-identified opportunities for cost reduction:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Optimize supply chain logistics (Est. 15% savings)</li>
              <li>• Renegotiate vendor contracts for better terms</li>
              <li>• Implement energy-efficient manufacturing processes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientTasks;
