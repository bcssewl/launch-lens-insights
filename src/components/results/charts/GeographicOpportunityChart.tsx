
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from 'recharts';
import { getChartColors } from './chartUtils';

interface GeographicOpportunityChartProps {
  data: { name: string; value: number }[];
}

const GeographicOpportunityChart: React.FC<GeographicOpportunityChartProps> = ({ data }) => {
  const colors = getChartColors(data.length);

  return (
    <Card className="print:break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-sm print:text-xs">Geographic Opportunity</CardTitle>
      </CardHeader>
      <CardContent className="p-4 print:p-3">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100}
            />
            <Tooltip />
            <Bar 
              dataKey="value" 
              radius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default GeographicOpportunityChart;
