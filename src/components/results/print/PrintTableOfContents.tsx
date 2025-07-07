
import React from 'react';

const PrintTableOfContents: React.FC = () => {
  const sections = [
    { title: 'Executive Summary', description: 'Overall assessment and recommendations', page: 3 },
    { title: 'Key Insights & Metrics', description: 'Critical performance indicators', page: 4 },
    { title: 'Market Analysis', description: 'Market size, trends, and opportunities', page: 5 },
    { title: 'Competition Analysis', description: 'Competitive landscape assessment', page: 6 },
    { title: 'Financial Analysis', description: 'Revenue projections and cost structure', page: 7 },
    { title: 'SWOT Analysis', description: 'Strengths, weaknesses, opportunities, threats', page: 8 },
    { title: 'Detailed Score Breakdown', description: 'Comprehensive scoring methodology', page: 9 },
    { title: 'Recommended Actions', description: 'Next steps and implementation roadmap', page: 10 },
  ];

  return (
    <div className="print-section enhanced-toc-page">
      <div className="toc-header">
        <h1 className="toc-title">Table of Contents</h1>
        <p className="toc-subtitle">Comprehensive Idea Validation Report</p>
      </div>
      
      <div className="toc-content">
        {sections.map((section, index) => (
          <div key={index} className="toc-item page-break-inside-avoid">
            <div className="toc-item-main">
              <div className="toc-number">{index + 1}</div>
              <div className="toc-details">
                <h3 className="toc-section-title">{section.title}</h3>
                <p className="toc-description">{section.description}</p>
              </div>
            </div>
            <div className="toc-page">{section.page}</div>
          </div>
        ))}
      </div>
      
      <div className="reading-guide page-break-inside-avoid">
        <h3 className="guide-title">How to Read This Report</h3>
        <div className="guide-grid">
          <div className="guide-item">
            <span className="guide-icon">📊</span>
            <span className="guide-text">Scores are rated on a scale of 1-10 (10 being the highest)</span>
          </div>
          <div className="guide-item">
            <span className="guide-icon">🟢</span>
            <span className="guide-text">Green indicators suggest positive factors</span>
          </div>
          <div className="guide-item">
            <span className="guide-icon">🟡</span>
            <span className="guide-text">Yellow indicators suggest areas requiring attention</span>
          </div>
          <div className="guide-item">
            <span className="guide-icon">🔴</span>
            <span className="guide-text">Red indicators suggest high-risk factors</span>
          </div>
          <div className="guide-item">
            <span className="guide-icon">⭐</span>
            <span className="guide-text">Action items are prioritized by impact and feasibility</span>
          </div>
          <div className="guide-item">
            <span className="guide-icon">📈</span>
            <span className="guide-text">Charts and graphs support key findings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintTableOfContents;
