
import { TrendingUp, BarChart3, Award, Brain, Users, DollarSign, Target, Globe, TrendingDown } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export const DashboardPreview = () => {
  // Market size data for TAM/SAM/SOM chart
  const marketSizeData = [
    { name: 'TAM', value: 2400000000, fill: '#3B82F6' },
    { name: 'SAM', value: 180000000, fill: '#10B981' },
    { name: 'SOM', value: 12000000, fill: '#F59E0B' }
  ];

  // Growth trend data
  const growthData = [
    { month: 'Jan', growth: 12, revenue: 45000 },
    { month: 'Feb', growth: 18, revenue: 52000 },
    { month: 'Mar', growth: 25, revenue: 61000 },
    { month: 'Apr', growth: 32, revenue: 73000 },
    { month: 'May', growth: 28, revenue: 68000 },
    { month: 'Jun', growth: 35, revenue: 78000 }
  ];

  // Customer segments data
  const customerSegments = [
    { name: 'SME Tech', value: 35, fill: '#8B5CF6' },
    { name: 'Healthcare', value: 28, fill: '#06B6D4' },
    { name: 'Finance', value: 22, fill: '#10B981' },
    { name: 'Other', value: 15, fill: '#F59E0B' }
  ];

  // Competition radar data
  const competitionData = [
    { metric: 'Innovation', yourScore: 8.5, competitor: 6.2 },
    { metric: 'Market Reach', yourScore: 7.3, competitor: 8.1 },
    { metric: 'Pricing', yourScore: 9.1, competitor: 5.8 },
    { metric: 'Features', yourScore: 8.7, competitor: 7.4 },
    { metric: 'Support', yourScore: 8.9, competitor: 6.9 },
    { metric: 'Reliability', yourScore: 9.2, competitor: 7.8 }
  ];

  // Geographic opportunity data
  const geoData = [
    { region: 'North America', opportunity: 85, market: '$890M' },
    { region: 'Europe', opportunity: 72, market: '$650M' },
    { region: 'Asia Pacific', opportunity: 68, market: '$520M' },
    { region: 'Latin America', opportunity: 45, market: '$180M' }
  ];

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Preview Label */}
      <div className="text-center mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Brain className="w-3 h-3" />
          Live Analytics Dashboard Preview
        </span>
      </div>

      <div className="apple-card p-6 bg-gradient-to-br from-surface via-surface to-surface-elevated border border-border-subtle/50">
        {/* Top KPI Cards with Mini Charts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Validation Score with Gauge */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Validation Score</span>
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{ value: 87 }, { value: 13 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="100%"
                      startAngle={90}
                      endAngle={90 + (87/100) * 360}
                      dataKey="value"
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#E5E7EB" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-500">87</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">High potential</div>
                <div className="text-xs text-green-600">+12% vs avg</div>
              </div>
            </div>
          </div>

          {/* Market Size with Mini Bar Chart */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Market Size</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div className="text-lg font-bold text-blue-500 mb-2">$2.4B</div>
            <div className="h-6 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{tam: 100}, {sam: 7.5}, {som: 0.5}]}>
                  <Bar dataKey="tam" fill="#3B82F6" radius={2} />
                  <Bar dataKey="sam" fill="#10B981" radius={2} />
                  <Bar dataKey="som" fill="#F59E0B" radius={2} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-gray-500">TAM • Growing 15% annually</div>
          </div>

          {/* Revenue Projection */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Revenue Proj.</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-purple-500" />
              </div>
            </div>
            <div className="text-lg font-bold text-purple-500 mb-2">$1.2M</div>
            <div className="h-6 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData.slice(0, 4)}>
                  <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-green-600">+35% projected growth</div>
          </div>

          {/* Competition Score */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-orange-200/50 dark:border-orange-800/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Competitive Edge</span>
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            <div className="text-lg font-bold text-orange-500 mb-2">Strong</div>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`flex-1 h-1.5 rounded ${i <= 4 ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              ))}
            </div>
            <div className="text-xs text-gray-500">vs 12 competitors</div>
          </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Market Analysis Chart */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-border/20">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-blue-500" />
              Market Analysis (TAM/SAM/SOM)
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketSizeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    labelLine={false}
                  >
                    {marketSizeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Segments */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-border/20">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-green-500" />
              Customer Segments
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSegments}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Growth Trends */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-border/20">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Revenue Growth Trajectory
            </h3>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Competitive Radar */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-border/20">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-yellow-500" />
              Competitive Position
            </h3>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={competitionData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis domain={[0, 10]} />
                  <Radar
                    name="Your Product"
                    dataKey="yourScore"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Competition Avg"
                    dataKey="competitor"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.1}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Enhanced AI Insights Section */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
                AI Strategic Intelligence
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Real-time Analysis</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3 text-sm">
                Advanced analysis reveals <strong>exceptional market validation potential (87/100)</strong>. Your SaaS solution targets a <strong>$2.4B growing market</strong> with <strong>moderate competition density</strong> and shows <strong>35% projected revenue growth</strong> in target customer segments.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-green-600">High Growth Potential</div>
                    <div className="text-xs text-gray-500">35% projected increase</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Target className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-blue-600">Competitive Advantage</div>
                    <div className="text-xs text-gray-500">Strong positioning vs competitors</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <DollarSign className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-purple-600">Revenue Model</div>
                    <div className="text-xs text-gray-500">$1.2M projected ARR</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
