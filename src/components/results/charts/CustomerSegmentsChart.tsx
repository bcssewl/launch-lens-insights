
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { getChartColors, renderPercentageLabel } from './chartUtils';

interface CustomerSegmentsChartProps {
  data: { name: string; value: number; fill?: string }[];
}

const chartConfigSegments = {
  segment1: { label: "Segment 1", color: "hsl(var(--chart-1))" },
  segment2: { label: "Segment 2", color: "hsl(var(--chart-2))" },
  segment3: { label: "Segment 3", color: "hsl(var(--chart-3))" },
  segment4: { label: "Segment 4", color: "hsl(var(--chart-4))" },
  segment5: { label: "Segment 5", color: "hsl(var(--chart-5))" },
};

const CustomerSegmentsChart: React.FC<CustomerSegmentsChartProps> = ({ data }) => {
  // Assign colors to customer segments data
  const customerSegmentsWithColors = data.map((item, index) => ({
    ...item,
    fill: item.fill || getChartColors(data.length)[index]
  }));

  return (
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
                const total = data.reduce((sum, item) => sum + item.value, 0);
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
  );
};

export default CustomerSegmentsChart;
