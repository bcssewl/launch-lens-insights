
// Generate colors from chart variables
export const getChartColors = (count: number) => {
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
export const formatCurrency = (value: number) => {
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
export const renderPieLabel = (data: any[]) => (entry: any) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const percent = ((entry.value / total) * 100).toFixed(1);
  return `${formatCurrency(entry.value)}\n(${percent}%)`;
};

// Custom label function for customer segments (percentage only)
export const renderPercentageLabel = (data: any[]) => (entry: any) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const percent = ((entry.value / total) * 100).toFixed(1);
  return `${percent}%`;
};
