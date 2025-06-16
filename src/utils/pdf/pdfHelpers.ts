
export const waitForFonts = async (): Promise<void> => {
  if ('fonts' in document) {
    try {
      await document.fonts.ready;
      console.log('PDF Helper: Fonts loaded successfully');
    } catch (error) {
      console.warn('PDF Helper: Font loading failed, continuing anyway:', error);
    }
  }
  
  // Additional wait for layout stability
  await new Promise(resolve => setTimeout(resolve, 500));
};

export const getScoreColor = (score: number): string => {
  if (score >= 8) return '#059669';
  if (score >= 6) return '#d97706';
  return '#dc2626';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Fair';
  return 'Poor';
};

export const getRecommendationStyle = (recommendation: string, score: number) => {
  if (score >= 8) {
    return {
      status: 'PROCEED WITH CONFIDENCE',
      bg: '#dcfce7',
      color: '#166534'
    };
  }
  if (score >= 6) {
    return {
      status: 'PROCEED WITH CAUTION',
      bg: '#fef3c7',
      color: '#92400e'
    };
  }
  return {
    status: 'HIGH RISK - CONSIDER PIVOTING',
    bg: '#fee2e2',
    color: '#991b1b'
  };
};

export const createPDFStyles = (): string => `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #1a1a1a;
    background: #ffffff;
  }
  
  .pdf-container {
    width: 794px;
    margin: 0 auto;
    background: #ffffff;
    padding: 40px;
  }
  
  .pdf-header {
    text-align: center;
    margin-bottom: 40px;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 20px;
  }
  
  .pdf-title {
    font-size: 28pt;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 10px;
  }
  
  .pdf-subtitle {
    font-size: 16pt;
    color: #64748b;
    margin-bottom: 20px;
  }
  
  .pdf-score {
    font-size: 48pt;
    font-weight: bold;
    color: #2563eb;
    margin: 20px 0;
  }
  
  .pdf-section {
    margin-bottom: 40px;
    page-break-inside: avoid;
  }
  
  .pdf-section-title {
    font-size: 20pt;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 20px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 10px;
  }
  
  .pdf-metric-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .pdf-metric-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    background: #f8fafc;
  }
  
  .pdf-metric-label {
    font-size: 12pt;
    color: #64748b;
    margin-bottom: 8px;
  }
  
  .pdf-metric-value {
    font-size: 18pt;
    font-weight: bold;
    color: #1a1a1a;
  }
  
  .pdf-list {
    list-style: none;
    padding: 0;
  }
  
  .pdf-list-item {
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
  }
  
  .pdf-list-item::before {
    content: "•";
    color: #2563eb;
    font-weight: bold;
    width: 20px;
    margin-right: 10px;
  }
  
  .pdf-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  
  .pdf-table th,
  .pdf-table td {
    border: 1px solid #e2e8f0;
    padding: 12px;
    text-align: left;
  }
  
  .pdf-table th {
    background: #f8fafc;
    font-weight: bold;
  }
  
  .pdf-footer {
    margin-top: 60px;
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
    font-size: 10pt;
    color: #64748b;
  }
  
  .page-break {
    page-break-before: always;
  }
`;
