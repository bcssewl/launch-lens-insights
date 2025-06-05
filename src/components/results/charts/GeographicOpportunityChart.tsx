
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { getChartColors } from './chartUtils';

interface GeographicOpportunityChartProps {
  data: { name: string; value: number }[];
}

const chartConfigGeo = {
  value: { label: "Market Size", color: "hsl(var(--chart-1))" },
};

const GeographicOpportunityChart: React.FC<GeographicOpportunityChartProps> = ({ data }) => {
  const colors = getChartColors(data.length);

  return (
    <Card className="print:break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-sm print:text-xs">Geographic Opportunity</CardTitle>
      </CardHeader>
      <CardContent className="p-4 print:p-3">
        <ChartContainer config={chartConfigGeo} className="w-full h-[300px] print:h-[250px]">
          <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100}
            />
            <ChartTooltipContent 
              formatter={(value: number, name: string) => [value, "Market Size"]}
            />
            <Bar 
              dataKey="value" 
              radius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default GeographicOpportunityChart;
