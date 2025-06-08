import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ComposedChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, Calculator, PiggyBank, Target, Users, Building } from 'lucide-react';
import { parseFinancialAnalysis, formatCurrency, extractNumericValue, type ParsedFinancialAnalysis } from '@/utils/financialDataParser';

interface FinancialAnalysisTabContentProps {
  data: any;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--destructive))",
  },
  netIncome: {
    label: "Net Income",
    color: "hsl(var(--success))",
  },
  customers: {
    label: "Customers",
    color: "hsl(var(--secondary))",
  },
};

const FinancialAnalysisTabContent: React.FC<FinancialAnalysisTabContentProps> = ({ data }) => {
  const parsedData = parseFinancialAnalysis(data);

  // Fallback to legacy format if new format is not available
  if (!parsedData) {
    return <LegacyFinancialView data={data} />;
  }

  const { market_opportunity, revenue_model_analysis, pricing_strategy, financial_projections, funding_requirements } = parsedData;

  // Prepare chart data for projections
  const projectionsData = [
    {
      year: 'Year 1',
      revenue: extractNumericValue(financial_projections.year_1.revenue.split('-')[0]),
      expenses: extractNumericValue(financial_projections.year_1.expenses.split('-')[0]),
      customers: extractNumericValue(financial_projections.year_1.customers.split('-')[0]),
      netIncome: extractNumericValue(financial_projections.year_1.net_income.replace(/[()$]/g, '').split('-')[0]) * (financial_projections.year_1.net_income.includes('(') ? -1 : 1),
    },
    {
      year: 'Year 2',
      revenue: extractNumericValue(financial_projections.year_2.revenue.split('-')[0]),
      expenses: extractNumericValue(financial_projections.year_2.expenses.split('-')[0]),
      customers: extractNumericValue(financial_projections.year_2.customers.split('-')[0]),
      netIncome: extractNumericValue(financial_projections.year_2.net_income.replace(/[()$]/g, '').split('-')[0]) * (financial_projections.year_2.net_income.includes('(') ? -1 : 1),
    },
    {
      year: 'Year 3',
      revenue: extractNumericValue(financial_projections.year_3.revenue.split('-')[0]),
      expenses: extractNumericValue(financial_projections.year_3.expenses.split('-')[0]),
      customers: extractNumericValue(financial_projections.year_3.customers.split('-')[0]),
      netIncome: extractNumericValue(financial_projections.year_3.net_income.replace(/[()$]/g, '').split('-')[0]),
    },
  ];

  // Prepare funding allocation data
  const fundingData = [
    { category: 'Product Development', amount: 40, fill: '#3b82f6' },
    { category: 'Sales & Marketing', amount: 30, fill: '#10b981' },
    { category: 'Operations', amount: 20, fill: '#f59e0b' },
    { category: 'Reserve', amount: 10, fill: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* Market Opportunity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Market Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Addressable Market</div>
              <div className="text-xl font-bold">{market_opportunity.total_addressable_market}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Serviceable Market</div>
              <div className="text-xl font-bold">{market_opportunity.serviceable_market_segment}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Growth Rate</div>
              <div className="text-xl font-bold text-green-600">{market_opportunity.annual_growth_rate}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Key Drivers</div>
              <div className="flex flex-wrap gap-1">
                {market_opportunity.market_drivers.slice(0, 2).map((driver, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {driver}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Model Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Model Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{revenue_model_analysis.viability_score}/10</div>
              <div className="text-sm text-muted-foreground">Viability Score</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Margins</div>
              <div className="font-semibold">{revenue_model_analysis.estimated_margins}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Scalability</div>
              <div className="font-semibold">{revenue_model_analysis.scalability_potential}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Model Fit</div>
              <Badge variant="outline">{revenue_model_analysis.model_fit.split('-')[0].trim()}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {pricing_strategy.recommended_tiers.map((tier, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="text-center">
                  <h4 className="font-semibold text-lg">{tier.tier}</h4>
                  <div className="text-2xl font-bold text-primary">{tier.price}</div>
                  <div className="text-sm text-muted-foreground">{tier.target}</div>
                </div>
                <div className="text-sm">{tier.features}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground">Annual Discount</div>
              <div className="font-semibold">{pricing_strategy.annual_discount}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Competitive Position</div>
              <div className="font-semibold">{pricing_strategy.competitive_positioning}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Projections Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>3-Year Revenue & Expense Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ComposedChart data={projectionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" name="Revenue" />
                <Bar dataKey="expenses" fill="var(--color-expenses)" name="Expenses" />
                <Line 
                  type="monotone" 
                  dataKey="netIncome" 
                  stroke="var(--color-netIncome)" 
                  strokeWidth={3}
                  name="Net Income"
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Growth Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={projectionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [value.toLocaleString(), "Customers"]}
                />
                <Area 
                  dataKey="customers" 
                  stroke="var(--color-customers)" 
                  fill="var(--color-customers)" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Funding Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Funding Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{funding_requirements.seed_stage}</div>
                  <div className="text-sm text-muted-foreground">Seed Stage</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{funding_requirements.series_a_potential}</div>
                  <div className="text-sm text-muted-foreground">Series A Potential</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Key Milestones</h4>
                <ul className="space-y-1">
                  {funding_requirements.key_milestones.map((milestone, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {milestone}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Funding Allocation</h4>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <PieChart>
                  <Pie
                    data={fundingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, amount }) => `${category}: ${amount}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {fundingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Financial Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Strengths
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  High viability score ({revenue_model_analysis.viability_score}/10)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  Strong gross margins ({revenue_model_analysis.estimated_margins})
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  Break-even expected in {financial_projections.break_even_point}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  {revenue_model_analysis.scalability_potential.toLowerCase()} scalability
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Key Metrics
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Market Growth Rate:</span>
                  <span className="font-semibold">{market_opportunity.annual_growth_rate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Competitive Position:</span>
                  <span className="font-semibold">{pricing_strategy.competitive_positioning}</span>
                </div>
                <div className="flex justify-between">
                  <span>Model Fit Score:</span>
                  <span className="font-semibold">{revenue_model_analysis.model_fit.split('-')[0].trim()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Legacy component for backward compatibility
const LegacyFinancialView: React.FC<{ data: any }> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Legacy Financial Data</h3>
            <p className="text-muted-foreground">
              This report uses an older data format. For comprehensive financial analysis, 
              please regenerate the report to see detailed market opportunity, pricing strategy, 
              and multi-year projections.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialAnalysisTabContent;
