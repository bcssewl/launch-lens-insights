
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'; // Using existing chart components

interface MarketAnalysisData {
  tamSamSom: { name: string; value: number; fill: string }[];
  marketGrowth: { year: string; growth: number }[];
  customerSegments: { name: string; value: number; fill: string }[];
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
  segments: { label: "Customers" }, // Placeholder, colors will come from data
};

const chartConfigGeo = {
  opportunity: { label: "Opportunity", color: "hsl(var(--chart-1))" },
};


const MarketAnalysisTabContent: React.FC<MarketAnalysisTabContentProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>TAM/SAM/SOM</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigTam} className="mx-auto aspect-square max-h-[300px]">
            <PieChart>
              <ChartTooltipContent nameKey="name" hideLabel />
              <Pie data={data.tamSamSom} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {data.tamSamSom.map((entry) => (
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
          <CardTitle>Market Growth Trend (YoY)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigGrowth} className="mx-auto aspect-video max-h-[300px]">
            <LineChart data={data.marketGrowth}>
              <CartesianGridVertical_Fixed />
              <XAxis dataKey="year" />
              <YAxis />
              <ChartTooltipContent />
              <Legend />
              <Line type="monotone" dataKey="growth" stroke="var(--color-growth)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Segment Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
           <ChartContainer config={chartConfigSegments} className="mx-auto aspect-square max-h-[300px]">
            <PieChart>
              <ChartTooltipContent nameKey="name" hideLabel />
              <Pie data={data.customerSegments} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {data.customerSegments.map((entry) => (
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
        <CardContent>
          <ChartContainer config={chartConfigGeo} className="mx-auto aspect-video max-h-[300px]">
            <BarChart data={data.geographicOpportunity} layout="vertical">
              <CartesianGridHorizontal_Fixed />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <ChartTooltipContent />
              <Legend />
              <Bar dataKey="value" fill="var(--color-opportunity)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
// Recharts doesn't export CartesianGridVertical/Horizontal directly, so using a fixed version.
// Or these can be imported from recharts directly if available.
// For simplicity, if these are not defined in ui/chart.tsx, let's remove them for now.
// Removing CartesianGridVertical_Fixed and CartesianGridHorizontal_Fixed for now. User can add later if needed.
const CartesianGridVertical_Fixed = () => <Tooltip/>; // Placeholder
const CartesianGridHorizontal_Fixed = () => <Tooltip/>; // Placeholder

export default MarketAnalysisTabContent;

