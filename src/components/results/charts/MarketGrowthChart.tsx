
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Legend, LabelList } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface MarketGrowthChartProps {
  data: { year: string; growth: number }[];
}

const chartConfigGrowth = {
  growth: { label: "YoY Growth (%)", color: "hsl(var(--chart-1))" },
};

const MarketGrowthChart: React.FC<MarketGrowthChartProps> = ({ data }) => {
  return (
    <Card className="print:break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-sm print:text-xs">Market Growth Trend (YoY)</CardTitle>
      </CardHeader>
      <CardContent className="p-4 print:p-3">
        <ChartContainer config={chartConfigGrowth} className="w-full h-[300px] print:h-[250px]">
          <LineChart data={data}>
            <XAxis dataKey="year" />
            <YAxis />
            <ChartTooltipContent />
            <Legend />
            <Line type="monotone" dataKey="growth" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false}>
              <LabelList dataKey="growth" position="top" formatter={(value: number) => `${value}%`} />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MarketGrowthChart;
