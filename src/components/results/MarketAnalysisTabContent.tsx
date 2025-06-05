
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

// Format numbers with B/M/K abbreviations and dollar sign
const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

// Custom label function with percentage calculation and formatted currency
const renderPieLabel = (data: any[]) => (entry: any) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const percent = ((entry.value / total) * 100).toFixed(1);
  return `${formatCurrency(entry.value)}\n(${percent}%)`;
};

// Custom label function for customer segments (percentage only)
const renderPercentageLabel = (data: any[]) => (entry: any) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const percent = ((entry.value / total) * 100).toFixed(1);
  return `${percent}%`;
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

  return (
    <div className="grid grid-cols-2 gap-4 print:gap-3">
      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="text-sm print:text-xs">TAM/SAM/SOM</CardTitle>
        </CardHeader>
        <CardContent className="p-4 print:p-3">
          <ChartContainer config={chartConfigTam} className="w-full h-[300px] print:h-[250px]">
            <PieChart>
              <ChartTooltipContent 
                nameKey="name" 
                hideLabel 
                formatter={(value: number) => [formatCurrency(value), ""]}
              />
              <Pie 
                data={tamSamSomWithColors} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                innerRadius={40}
                outerRadius={100} 
                labelLine={false}
                label={renderPieLabel(tamSamSomWithColors)}
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

      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="text-sm print:text-xs">Market Growth Trend (YoY)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 print:p-3">
          <ChartContainer config={chartConfigGrowth} className="w-full h-[300px] print:h-[250px]">
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

      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="text-sm print:text-xs">Customer Segment Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-4 print:p-3">
           <ChartContainer config={chartConfigSegments} className="w-full h-[300px] print:h-[250px]">
            <PieChart>
              <ChartTooltipContent 
                nameKey="name" 
                hideLabel 
                formatter={(value: number) => {
                  const total = data.customerSegments.reduce((sum, item) => sum + item.value, 0);
                  const percent = ((value / total) * 100).toFixed(1);
                  return [`${percent}%`, ""];
                }}
              />
              <Pie 
                data={customerSegmentsWithColors} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100} 
                labelLine={false}
                label={renderPercentageLabel(customerSegmentsWithColors)}
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

      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="text-sm print:text-xs">Geographic Opportunity</CardTitle>
        </CardHeader>
        <CardContent className="p-4 print:p-3">
          <ChartContainer config={chartConfigGeo} className="w-full h-[300px] print:h-[250px]">
            <BarChart data={geographicOpportunityWithColors} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
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
