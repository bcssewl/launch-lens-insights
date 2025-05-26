
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ScoreDisplayProps {
  score: number;
  maxScore: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, maxScore }) => {
  const percentage = (score / maxScore) * 100;
  const data = [
    { name: 'Score', value: percentage },
    { name: 'Remaining', value: 100 - percentage },
  ];
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--border))'];

  return (
    <div className="relative w-24 h-24">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            startAngle={90}
            endAngle={90 + (percentage / 100) * 360}
            paddingAngle={0}
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-primary">{score.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">/{maxScore}</span>
      </div>
    </div>
  );
};

export default ScoreDisplay;
