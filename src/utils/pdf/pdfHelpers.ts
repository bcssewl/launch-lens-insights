
export const waitForFonts = async (): Promise<void> => {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

export const getScoreColor = (score: number): string => {
  if (score >= 8) return '#10b981';
  if (score >= 6) return '#f59e0b';
  return '#ef4444';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Fair';
  return 'Poor';
};

export const getRecommendationStyle = (rec: string, score: number) => {
  if (score >= 8) return { bg: '#dcfce7', color: '#166534', status: 'PROCEED' };
  if (score >= 6) return { bg: '#fef3c7', color: '#92400e', status: 'PROCEED WITH CAUTION' };
  return { bg: '#fee2e2', color: '#991b1b', status: 'HIGH RISK' };
};
