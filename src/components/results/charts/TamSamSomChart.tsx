
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { getChartColors, formatCurrency, renderPieLabel } from './chartUtils';

interface TamSamSomChartProps {
  data: { name: string; value: number; fill?: string }[];
}

const chartConfigTam = {
  value: { label: "Market Size", color: "hsl(var(--primary))" },
};

const TamSamSomChart: React.FC<TamSamSomChartProps> = ({ data }) => {
  // Assign colors to TAM/SAM/SOM data
  const tamSamSomWithColors = data.map((item, index) => ({
    ...item,
    fill: item.fill || getChartColors(data.length)[index]
  }));

  return (
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
  );
};

export default TamSamSomChart;
