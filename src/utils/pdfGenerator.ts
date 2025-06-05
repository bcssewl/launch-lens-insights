
import jsPDF from 'jspdf';

interface ReportData {
  ideaName: string;
  score: number;
  recommendation: string;
  analysisDate: string;
  executiveSummary: string;
  keyMetrics: {
    marketSize: { value: string; label?: string };
    competitionLevel: { value: string; subValue?: string };
    problemClarity: { value: string };
    revenuePotential: { value: string };
  };
  marketAnalysis: {
    tamSamSom: { name: string; value: number }[];
    marketGrowth: { year: string; growth: number }[];
    customerSegments: { name: string; value: number }[];
    geographicOpportunity: { name: string; value: number }[];
  };
  competition: {
    competitors: any[];
    competitiveAdvantages: any[];
    marketSaturation: string;
  };
  financialAnalysis: {
    keyMetrics: {
      totalStartupCost: number;
      monthlyBurnRate: number;
      breakEvenMonth: number;
      fundingNeeded: number;
    };
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  detailedScores: { category: string; score: number }[];
  actionItems: { title: string; description: string; effort: string; impact: string }[];
}

export const generateReportPDF = (data: ReportData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const maxWidth = options.maxWidth || pageWidth - 2 * margin;
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * (options.lineHeight || 7));
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace = 30) => {
    if (yPosition + requiredSpace > pdf.internal.pageSize.height - margin) {
      pdf.addPage();
      yPosition = 30;
    }
  };

  // Title page
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Business Idea Validation Report', margin, yPosition, { lineHeight: 10 });
  
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(data.ideaName, margin, yPosition + 10, { lineHeight: 8 });

  pdf.setFontSize(12);
  yPosition = addText(`Analysis Date: ${data.analysisDate}`, margin, yPosition + 10);
  yPosition = addText(`Overall Score: ${data.score.toFixed(1)}/10`, margin, yPosition + 5);

  // Executive Summary
  checkNewPage(40);
  yPosition += 15;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Executive Summary', margin, yPosition);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(data.executiveSummary, margin, yPosition + 10, { lineHeight: 6 });

  // Recommendation
  checkNewPage(30);
  yPosition += 10;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Strategic Recommendation', margin, yPosition);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(data.recommendation, margin, yPosition + 10, { lineHeight: 6 });

  // Key Metrics
  checkNewPage(50);
  yPosition += 15;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Key Metrics', margin, yPosition);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  yPosition += 10;
  yPosition = addText(`Market Size: ${data.keyMetrics.marketSize.value}`, margin, yPosition);
  yPosition = addText(`Competition Level: ${data.keyMetrics.competitionLevel.value}`, margin, yPosition + 5);
  yPosition = addText(`Problem Clarity: ${data.keyMetrics.problemClarity.value}`, margin, yPosition + 5);
  yPosition = addText(`Revenue Potential: ${data.keyMetrics.revenuePotential.value}`, margin, yPosition + 5);

  // Market Analysis
  if (data.marketAnalysis.tamSamSom.length > 0) {
    checkNewPage(60);
    yPosition += 15;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText('Market Analysis', margin, yPosition);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText('TAM/SAM/SOM:', margin, yPosition + 10);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    data.marketAnalysis.tamSamSom.forEach(item => {
      yPosition = addText(`${item.name}: ${item.value}`, margin + 10, yPosition + 5);
    });
  }

  // Financial Analysis
  checkNewPage(50);
  yPosition += 15;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Financial Analysis', margin, yPosition);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  yPosition += 10;
  yPosition = addText(`Total Startup Cost: $${data.financialAnalysis.keyMetrics.totalStartupCost.toLocaleString()}`, margin, yPosition);
  yPosition = addText(`Monthly Burn Rate: $${data.financialAnalysis.keyMetrics.monthlyBurnRate.toLocaleString()}`, margin, yPosition + 5);
  yPosition = addText(`Break Even Month: ${data.financialAnalysis.keyMetrics.breakEvenMonth}`, margin, yPosition + 5);
  yPosition = addText(`Funding Needed: $${data.financialAnalysis.keyMetrics.fundingNeeded.toLocaleString()}`, margin, yPosition + 5);

  // SWOT Analysis
  checkNewPage(80);
  yPosition += 15;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('SWOT Analysis', margin, yPosition);

  const swotSections = [
    { title: 'Strengths', items: data.swot.strengths },
    { title: 'Weaknesses', items: data.swot.weaknesses },
    { title: 'Opportunities', items: data.swot.opportunities },
    { title: 'Threats', items: data.swot.threats }
  ];

  swotSections.forEach(section => {
    if (section.items.length > 0) {
      checkNewPage(30);
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText(section.title + ':', margin, yPosition);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      section.items.forEach(item => {
        yPosition = addText(`• ${item}`, margin + 10, yPosition + 4, { lineHeight: 5 });
      });
    }
  });

  // Detailed Scores
  if (data.detailedScores.length > 0) {
    checkNewPage(50);
    yPosition += 15;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText('Detailed Scores', margin, yPosition);

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    data.detailedScores.forEach(score => {
      yPosition = addText(`${score.category}: ${score.score.toFixed(1)}/10`, margin, yPosition + 8);
    });
  }

  // Action Items
  if (data.actionItems.length > 0) {
    checkNewPage(60);
    yPosition += 15;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText('Recommended Actions', margin, yPosition);

    data.actionItems.forEach((item, index) => {
      checkNewPage(25);
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText(`${index + 1}. ${item.title}`, margin, yPosition);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(item.description, margin + 10, yPosition + 5, { lineHeight: 5 });
      yPosition = addText(`Effort: ${item.effort} | Impact: ${item.impact}`, margin + 10, yPosition + 3);
    });
  }

  // Save the PDF
  const fileName = `${data.ideaName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_validation_report.pdf`;
  pdf.save(fileName);
};
