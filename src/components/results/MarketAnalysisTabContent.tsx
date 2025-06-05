
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, LabelList } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

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
  value: { label: "Market Size", color: "hsl(var(--primary))" },
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

// Custom label function with percentage calculation
const renderPieLabel = (data: any[]) => (entry: any) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const percent = ((entry.value / total) * 100).toFixed(1);
  return `${entry.value}\n(${percent}%)`;
};

const MarketAnalysisTabContent: React.FC<MarketAnalysisTabContentProps> = ({ data }) => {
  // Transform TAM/SAM/SOM data for line chart
  const tamSamSomLineData = data.tamSamSom.map((item, index) => ({
    name: item.name,
    value: item.value,
    order: index
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>TAM/SAM/SOM</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={chartConfigTam} className="w-full h-[400px]">
            <LineChart data={tamSamSomLineData}>
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltipContent />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3} 
                dot={{ fill: "hsl(var(--primary))", r: 8 }}
                activeDot={{ r: 10, fill: "hsl(var(--primary))" }}
              >
                <LabelList dataKey="value" position="top" />
              </Line>
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Market Growth Trend (YoY)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={chartConfigGrowth} className="w-full h-[400px]">
            <LineChart data={data.marketGrowth}>
              <XAxis dataKey="year" />
              <YAxis />
              <ChartTooltipContent />
              <Legend />
              <Line type="monotone" dataKey="growth" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-1))", r: 6 }}>
                <LabelList dataKey="growth" position="top" formatter={(value: number) => `${value}%`} />
              </Line>
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
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
                label={renderPieLabel(customerSegmentsWithColors)}
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

      <Card>
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
                <LabelList dataKey="value" position="right" />
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
