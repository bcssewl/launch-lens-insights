
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from 'recharts';

interface GeographicOpportunityChartProps {
  data: { name: string; value: number }[];
}

const GeographicOpportunityChart: React.FC<GeographicOpportunityChartProps> = ({ data }) => {
  // Get min and max values to create color ranges
  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Function to get color based on value range
  const getColorByValue = (value: number) => {
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    
    if (normalizedValue >= 0.8) return '#10B981'; // Green for high values
    if (normalizedValue >= 0.6) return '#3B82F6'; // Blue for medium-high values
    if (normalizedValue >= 0.4) return '#F59E0B'; // Orange for medium values
    if (normalizedValue >= 0.2) return '#EF4444'; // Red for medium-low values
    return '#6B7280'; // Gray for low values
  };

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
                <Cell key={`cell-${index}`} fill={getColorByValue(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default GeographicOpportunityChart;
