
import { TrendingUp, BarChart3, Award, Brain } from "lucide-react";

export const DashboardPreview = () => (
  <div className="dashboard-preview max-w-4xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="metric-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Validation Score</span>
          <TrendingUp className="w-4 h-4 text-green-400" />
        </div>
        <div className="text-2xl font-bold text-green-400">87%</div>
        <div className="text-xs text-muted-foreground">High potential</div>
      </div>
      <div className="metric-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Market Size</span>
          <BarChart3 className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-blue-400">$2.4B</div>
        <div className="text-xs text-muted-foreground">TAM identified</div>
      </div>
      <div className="metric-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Competition</span>
          <Award className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="text-2xl font-bold text-yellow-400">Medium</div>
        <div className="text-xs text-muted-foreground">Opportunity exists</div>
      </div>
    </div>
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium">AI Insights</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your SaaS idea shows strong market validation potential. The identified target market of small businesses seeking automation tools represents a $2.4B opportunity with moderate competition density.
      </p>
    </div>
  </div>
);
