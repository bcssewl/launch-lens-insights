
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ComposedChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, Calculator, PiggyBank } from 'lucide-react';

interface FinancialData {
  startupCosts: Array<{ category: string; amount: number; description: string }>;
  operatingCosts: Array<{ month: number; total: number; development: number; marketing: number; operations: number }>;
  revenueProjections: Array<{ month: number; revenue: number; users: number }>;
  breakEvenAnalysis: Array<{ month: number; revenue: number; costs: number; profit: number }>;
  fundingRequirements: Array<{ category: string; amount: number; percentage: number; fill: string }>;
  keyMetrics: {
    totalStartupCost: number;
    monthlyBurnRate: number;
    breakEvenMonth: number;
    fundingNeeded: number;
  };
}

interface FinancialAnalysisTabContentProps {
  data: FinancialData;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  costs: {
    label: "Costs",
    color: "hsl(var(--destructive))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--success))",
  },
  development: {
    label: "Development",
    color: "hsl(var(--primary))",
  },
  marketing: {
    label: "Marketing",
    color: "hsl(var(--primary) / 0.8)",
  },
  operations: {
    label: "Operations",
    color: "hsl(var(--primary) / 0.6)",
  },
};

const FinancialAnalysisTabContent: React.FC<FinancialAnalysisTabContentProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 w-full overflow-hidden">
      {/* Key Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Startup Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.keyMetrics.totalStartupCost)}</div>
            <p className="text-xs text-muted-foreground">Initial investment needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Burn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.keyMetrics.monthlyBurnRate)}</div>
            <p className="text-xs text-muted-foreground">Average monthly expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Break-even Point</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Month {data.keyMetrics.breakEvenMonth}</div>
            <p className="text-xs text-muted-foreground">When costs = revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funding Required</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.keyMetrics.fundingNeeded)}</div>
            <p className="text-xs text-muted-foreground">To reach profitability</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Startup Costs Breakdown */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Startup Costs Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="w-full h-[300px] overflow-hidden">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.startupCosts} margin={{ top: 5, right: 5, left: 5, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      interval={0}
                      fontSize={12}
                    />
                    <YAxis tickFormatter={formatCurrency} fontSize={12} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => [formatCurrency(value), "Amount"]}
                    />
                    <Bar dataKey="amount" fill="var(--color-development)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Operating Costs */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Monthly Operating Costs</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="w-full h-[300px] overflow-hidden">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.operatingCosts} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis tickFormatter={formatCurrency} fontSize={12} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => [formatCurrency(value), ""]}
                    />
                    <Area dataKey="development" stackId="1" stroke="var(--color-development)" fill="var(--color-development)" />
                    <Area dataKey="marketing" stackId="1" stroke="var(--color-marketing)" fill="var(--color-marketing)" />
                    <Area dataKey="operations" stackId="1" stroke="var(--color-operations)" fill="var(--color-operations)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Projections */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Revenue Projections</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="w-full h-[300px] overflow-hidden">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.revenueProjections} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis tickFormatter={formatCurrency} fontSize={12} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--color-revenue)" 
                      strokeWidth={3}
                      dot={{ fill: "var(--color-revenue)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Break-even Analysis */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Break-even Analysis</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="w-full h-[300px] overflow-hidden">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.breakEvenAnalysis} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis tickFormatter={formatCurrency} fontSize={12} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => [formatCurrency(value), ""]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--color-revenue)" 
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="costs" 
                      stroke="var(--color-costs)" 
                      strokeWidth={2}
                      name="Total Costs"
                    />
                    <Bar dataKey="profit" fill="var(--color-profit)" name="Profit/Loss" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funding Requirements */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Funding Requirements Allocation</CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <div className="w-full h-[300px] overflow-hidden">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <Pie
                      data={data.fundingRequirements}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {data.fundingRequirements.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => [formatCurrency(value), "Amount"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            
            <div className="space-y-4 w-full">
              <h4 className="font-semibold">Funding Breakdown</h4>
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {data.fundingRequirements.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-sm truncate">{item.category}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-medium">{formatCurrency(item.amount)}</div>
                      <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Insights */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Key Financial Insights</CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Strengths</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Moderate initial investment required</li>
                <li>Scalable revenue model</li>
                <li>Clear path to profitability</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600">Considerations</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Customer acquisition costs need validation</li>
                <li>Revenue assumptions require market testing</li>
                <li>Consider seasonal revenue variations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialAnalysisTabContent;
