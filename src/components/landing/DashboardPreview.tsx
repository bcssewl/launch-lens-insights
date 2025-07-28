import { TrendingUp, BarChart3, Award, Brain, Users, DollarSign } from "lucide-react";
export const DashboardPreview = () => <div className="max-w-5xl mx-auto">
    {/* Preview Label */}
    <div className="text-center mb-6">
      
    </div>

    <div className="apple-card p-8 bg-gradient-to-br from-surface via-surface to-surface-elevated border border-border-subtle/50">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Validation Score</span>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <div className="text-3xl font-bold text-green-500">87</div>
            <div className="text-sm text-gray-500 mb-1">/100</div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div className="bg-green-500 h-2 rounded-full" style={{
            width: '87%'
          }}></div>
          </div>
          <div className="text-xs text-gray-500">High potential • Strong market fit</div>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Market Size</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <div className="text-3xl font-bold text-blue-500">$2.4B</div>
          </div>
          <div className="text-xs text-gray-500">TAM • Growing 15% annually</div>
          <div className="flex gap-2 mt-3">
            <div className="flex-1 text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm font-semibold text-blue-600">$180M</div>
              <div className="text-xs text-gray-500">SAM</div>
            </div>
            <div className="flex-1 text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm font-semibold text-blue-600">$12M</div>
              <div className="text-xs text-gray-500">SOM</div>
            </div>
          </div>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-yellow-200/50 dark:border-yellow-800/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Competition</span>
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-yellow-500 mb-2">Medium</div>
          <div className="text-xs text-gray-500 mb-3">12 direct competitors found</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className={`flex-1 h-2 rounded ${i <= 3 ? 'bg-yellow-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>)}
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              AI Strategic Insights
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Live Analysis</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Your SaaS idea shows <strong>strong market validation potential</strong>. The identified target market of small businesses seeking automation tools represents a <strong>$2.4B opportunity</strong> with moderate competition density.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-green-600">Target Audience</div>
                  <div className="text-xs text-gray-500">SMBs, 10-50 employees</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-600">Revenue Model</div>
                  <div className="text-xs text-gray-500">SaaS subscription</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;