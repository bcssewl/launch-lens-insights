import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import HoverInfoCard from '@/components/ui/hover-info-card';

interface MarketAnalysisData {
  tamSamSom: { name: string; value: number; fill?: string }[];
  marketGrowth: { year: string; growth: number }[];
  customerSegments: { name: string; value: number; fill?: string }[];
  geographicOpportunity: { name: string; value: number }[];
}

interface MarketAnalysisTabContentProps {
  data: MarketAnalysisData;
}

const chartConfigTam = {
  tam: { label: "TAM", color: "hsl(var(--chart-1))" },
  sam: { label: "SAM", color: "hsl(var(--chart-2))" },
  som: { label: "SOM", color: "hsl(var(--chart-3))" },
};

const chartConfigGrowth = {
  growth: { label: "YoY Growth (%)", color: "hsl(var(--chart-1))" },
};

const chartConfigSegments = {
  segment1: { label: "Segment 1", color: "hsl(var(--chart-1))" },
  segment2: { label: "Segment 2", color: "hsl(var(--chart-2))" },
  segment3: { label: "Segment 3", color: "hsl(var(--chart-3))" },
  segment4: { label: "Segment 4", color: "hsl(var(--chart-4))" },
  segment5: { label: "Segment 5", color: "hsl(var(--chart-5))" },
};

const chartConfigGeo = {
  opportunity: { label: "Opportunity", color: "hsl(var(--chart-1))" },
};

// Generate colors from chart variables
const getChartColors = (count: number) => {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];
  
  // Cycle through colors if we need more than 5
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

// Custom tooltip components with enhanced information
const EnhancedTamSomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload[0].payload.total || 1000000000; // Default total for calculation
    const percentage = ((data.value / total) * 100).toFixed(1);
    
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg animate-fade-in">
        <p className="font-medium text-foreground">{data.name}</p>
        <p className="text-primary font-semibold">${(data.value / 1000000).toFixed(1)}M</p>
        <p className="text-muted-foreground text-sm">{percentage}% of total market</p>
        <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
          {data.name === 'TAM' && 'Total Addressable Market - Maximum market size'}
          {data.name === 'SAM' && 'Serviceable Addressable Market - Realistic target'}  
          {data.name === 'SOM' && 'Serviceable Obtainable Market - Initial market share'}
        </div>
      </div>
    );
  }
  return null;
};

const EnhancedGrowthTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const growthTrend = data.value > 0 ? 'Growing' : 'Declining';
    const growthStrength = Math.abs(data.value) > 10 ? 'Strong' : Math.abs(data.value) > 5 ? 'Moderate' : 'Slow';
    
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg animate-fade-in">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-primary font-semibold">{data.value}% YoY Growth</p>
        <p className="text-muted-foreground text-sm">{growthStrength} {growthTrend}</p>
        <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
          Market momentum indicator for strategic planning
        </div>
      </div>
    );
  }
  return null;
};

const MarketAnalysisTabContent: React.FC<MarketAnalysisTabContentProps> = ({ data }) => {
  // Assign colors to TAM/SAM/SOM data
  const tamSamSomWithColors = data.tamSamSom.map((item, index) => ({
    ...item,
    fill: item.fill || getChartColors(data.tamSamSom.length)[index]
  }));

  // Assign colors to customer segments data
  const customerSegmentsWithColors = data.customerSegments.map((item, index) => ({
    ...item,
    fill: item.fill || getChartColors(data.customerSegments.length)[index]
  }));

  // Assign colors to geographic opportunity data
  const geographicOpportunityWithColors = data.geographicOpportunity.map((item, index) => ({
    ...item,
    fill: getChartColors(data.geographicOpportunity.length)[index]
  }));

  const tamSamSomHoverContent = (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium text-foreground mb-1">Market Size Analysis</h4>
        <p className="text-muted-foreground">Understanding your addressable market at different levels helps prioritize resources and set realistic goals.</p>
      </div>
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">TAM:</span>
          <span className="font-medium">Total market opportunity</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">SAM:</span>
          <span className="font-medium">Realistic serviceable market</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">SOM:</span>
          <span className="font-medium">Initial obtainable share</span>
        </div>
      </div>
    </div>
  );

  const marketGrowthHoverContent = (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium text-foreground mb-1">Growth Trend Analysis</h4>
        <p className="text-muted-foreground">Year-over-year growth rates indicate market momentum and future opportunities.</p>
      </div>
      <div className="text-sm">
        <p className="text-muted-foreground">
          <strong>Interpretation:</strong> Higher growth rates suggest expanding market opportunities, 
          while declining rates may indicate market saturation or economic factors.
        </p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <HoverInfoCard
        trigger={
          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle>TAM/SAM/SOM</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ChartContainer config={chartConfigTam} className="w-full h-[400px]">
                <PieChart>
                  <Tooltip content={<EnhancedTamSomTooltip />} />
                  <Pie 
                    data={tamSamSomWithColors} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={120} 
                    innerRadius={60} 
                    labelLine={false}
                  >
                    {tamSamSomWithColors.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        }
        title="Market Size Breakdown"
        content={tamSamSomHoverContent}
        side="right"
      />

      <HoverInfoCard
        trigger={
          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Market Growth Trend (YoY)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ChartContainer config={chartConfigGrowth} className="w-full h-[400px]">
                <LineChart data={data.marketGrowth}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip content={<EnhancedGrowthTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="growth" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        }
        title="Growth Analysis"
        content={marketGrowthHoverContent}
        side="left"
      />

      <Card className="transition-all duration-200 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Customer Segment Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
           <ChartContainer config={chartConfigSegments} className="w-full h-[400px]">
            <PieChart>
              <ChartTooltipContent nameKey="name" hideLabel />
              <Pie 
                data={customerSegmentsWithColors} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={120} 
                labelLine={false}
              >
                {customerSegmentsWithColors.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Geographic Opportunity</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={chartConfigGeo} className="w-full h-[400px]">
            <BarChart data={geographicOpportunityWithColors} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <ChartTooltipContent />
              <Legend />
              <Bar dataKey="value" radius={4}>
                {geographicOpportunityWithColors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketAnalysisTabContent;
