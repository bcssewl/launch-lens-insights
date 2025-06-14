
export const createChartElement = (type: string, data: any[], config: any = {}): HTMLElement => {
  const container = document.createElement('div');
  container.style.cssText = `
    width: 100%;
    height: 300px;
    margin: 20px 0;
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;

  if (type === 'pie') {
    return createPieChart(container, data, config);
  } else if (type === 'line') {
    return createLineChart(container, data, config);
  } else if (type === 'bar') {
    return createBarChart(container, data, config);
  }

  return container;
};

export const createPieChart = (container: HTMLElement, data: any[], config: any): HTMLElement => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = 150;
  const centerY = 120;
  const radius = 80;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'width: 100%; height: 240px;';
  
  let currentAngle = 0;
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  data.forEach((item, index) => {
    const percentage = item.value / total;
    const sliceAngle = percentage * 2 * Math.PI;
    
    const x1 = centerX + radius * Math.cos(currentAngle);
    const y1 = centerY + radius * Math.sin(currentAngle);
    const x2 = centerX + radius * Math.cos(currentAngle + sliceAngle);
    const y2 = centerY + radius * Math.sin(currentAngle + sliceAngle);
    
    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`);
    path.setAttribute('fill', colors[index % colors.length]);
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '2');
    
    svg.appendChild(path);
    
    // Add label
    const labelAngle = currentAngle + sliceAngle / 2;
    const labelX = centerX + (radius * 0.7) * Math.cos(labelAngle);
    const labelY = centerY + (radius * 0.7) * Math.sin(labelAngle);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', labelX.toString());
    text.setAttribute('y', labelY.toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', 'bold');
    text.textContent = `${(percentage * 100).toFixed(1)}%`;
    
    svg.appendChild(text);
    
    currentAngle += sliceAngle;
  });

  // Add legend
  const legend = document.createElement('div');
  legend.style.cssText = 'margin-top: 20px; display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;';
  
  data.forEach((item, index) => {
    const legendItem = document.createElement('div');
    legendItem.style.cssText = 'display: flex; align-items: center; gap: 5px; font-size: 12px;';
    
    const colorBox = document.createElement('div');
    colorBox.style.cssText = `width: 12px; height: 12px; background: ${colors[index % colors.length]}; border-radius: 2px;`;
    
    const label = document.createElement('span');
    label.textContent = item.name;
    
    legendItem.appendChild(colorBox);
    legendItem.appendChild(label);
    legend.appendChild(legendItem);
  });

  container.appendChild(svg);
  container.appendChild(legend);
  return container;
};

export const createLineChart = (container: HTMLElement, data: any[], config: any): HTMLElement => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'width: 100%; height: 240px;';
  
  const padding = 50;
  const width = 450;
  const height = 180;
  
  const maxValue = Math.max(...data.map(d => d.growth || d.value || 0));
  const minValue = Math.min(...data.map(d => d.growth || d.value || 0));
  
  // Draw axes
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', padding.toString());
  xAxis.setAttribute('y1', (height + padding).toString());
  xAxis.setAttribute('x2', (width + padding).toString());
  xAxis.setAttribute('y2', (height + padding).toString());
  xAxis.setAttribute('stroke', '#374151');
  xAxis.setAttribute('stroke-width', '2');
  svg.appendChild(xAxis);
  
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', padding.toString());
  yAxis.setAttribute('y1', padding.toString());
  yAxis.setAttribute('x2', padding.toString());
  yAxis.setAttribute('y2', (height + padding).toString());
  yAxis.setAttribute('stroke', '#374151');
  yAxis.setAttribute('stroke-width', '2');
  svg.appendChild(yAxis);
  
  // Draw line
  let pathData = '';
  data.forEach((item, index) => {
    const x = padding + (index * width) / (data.length - 1);
    const value = item.growth || item.value || 0;
    const y = height + padding - ((value - minValue) / (maxValue - minValue)) * height;
    
    if (index === 0) {
      pathData += `M ${x} ${y}`;
    } else {
      pathData += ` L ${x} ${y}`;
    }
    
    // Add data points
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toString());
    circle.setAttribute('cy', y.toString());
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', '#3B82F6');
    svg.appendChild(circle);
    
    // Add labels
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x.toString());
    text.setAttribute('y', (height + padding + 20).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '12');
    text.textContent = item.year || item.name || `${index + 1}`;
    svg.appendChild(text);
  });
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  path.setAttribute('stroke', '#3B82F6');
  path.setAttribute('stroke-width', '3');
  path.setAttribute('fill', 'none');
  svg.appendChild(path);
  
  container.appendChild(svg);
  return container;
};

export const createBarChart = (container: HTMLElement, data: any[], config: any): HTMLElement => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'width: 100%; height: 240px;';
  
  const padding = 50;
  const width = 400;
  const height = 180;
  const barWidth = width / data.length * 0.6;
  
  const maxValue = Math.max(...data.map(d => d.value || 0));
  
  // Draw axes
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', padding.toString());
  xAxis.setAttribute('y1', (height + padding).toString());
  xAxis.setAttribute('x2', (width + padding).toString());
  xAxis.setAttribute('y2', (height + padding).toString());
  xAxis.setAttribute('stroke', '#374151');
  xAxis.setAttribute('stroke-width', '2');
  svg.appendChild(xAxis);
  
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', padding.toString());
  yAxis.setAttribute('y1', padding.toString());
  yAxis.setAttribute('x2', padding.toString());
  yAxis.setAttribute('y2', (height + padding).toString());
  yAxis.setAttribute('stroke', '#374151');
  yAxis.setAttribute('stroke-width', '2');
  svg.appendChild(yAxis);
  
  // Draw bars
  data.forEach((item, index) => {
    const x = padding + (index * width) / data.length + (width / data.length - barWidth) / 2;
    const barHeight = (item.value / maxValue) * height;
    const y = height + padding - barHeight;
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x.toString());
    rect.setAttribute('y', y.toString());
    rect.setAttribute('width', barWidth.toString());
    rect.setAttribute('height', barHeight.toString());
    rect.setAttribute('fill', '#3B82F6');
    svg.appendChild(rect);
    
    // Add value labels
    const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    valueText.setAttribute('x', (x + barWidth / 2).toString());
    valueText.setAttribute('y', (y - 5).toString());
    valueText.setAttribute('text-anchor', 'middle');
    valueText.setAttribute('font-size', '12');
    valueText.setAttribute('font-weight', 'bold');
    valueText.textContent = item.value.toString();
    svg.appendChild(valueText);
    
    // Add category labels
    const categoryText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    categoryText.setAttribute('x', (x + barWidth / 2).toString());
    categoryText.setAttribute('y', (height + padding + 20).toString());
    categoryText.setAttribute('text-anchor', 'middle');
    categoryText.setAttribute('font-size', '11');
    categoryText.textContent = item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name;
    svg.appendChild(categoryText);
  });
  
  container.appendChild(svg);
  return container;
};
