
export const createProfessionalStyles = (): string => `
/* Professional Report Styles */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap');

/* Global Variables */
:root {
  --primary-color: #2563eb;
  --primary-light: #3b82f6;
  --primary-dark: #1d4ed8;
  --secondary-color: #64748b;
  --accent-color: #059669;
  --warning-color: #d97706;
  --danger-color: #dc2626;
  --success-color: #059669;
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  --white: #ffffff;
  --border-radius: 8px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Base Document Styles */
.professional-report-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 11pt;
  line-height: 1.6;
  color: var(--gray-800);
  background: var(--white);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Cover Page Styles */
.professional-cover-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40pt;
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%);
  position: relative;
  overflow: hidden;
}

.professional-cover-page::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300pt;
  height: 300pt;
  background: linear-gradient(135deg, var(--primary-color)10, transparent);
  border-radius: 50%;
  opacity: 0.1;
  transform: translate(50%, -50%);
}

.cover-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 60pt;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12pt;
}

.logo-icon {
  width: 48pt;
  height: 48pt;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border-radius: var(--border-radius);
  position: relative;
}

.logo-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24pt;
  height: 24pt;
  background: var(--white);
  border-radius: 4pt;
  opacity: 0.9;
}

.brand-text h1 {
  font-family: 'Playfair Display', serif;
  font-size: 24pt;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
  line-height: 1.2;
}

.brand-text p {
  font-size: 14pt;
  color: var(--gray-600);
  margin: 0;
  font-weight: 500;
}

.document-type {
  font-size: 12pt;
  color: var(--gray-600);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 8pt 16pt;
  background: var(--gray-100);
  border-radius: var(--border-radius);
  border-left: 4pt solid var(--primary-color);
}

.cover-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  gap: 40pt;
}

.idea-title-section {
  margin-bottom: 32pt;
}

.idea-title {
  font-family: 'Playfair Display', serif;
  font-size: 36pt;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 16pt 0;
  line-height: 1.2;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.idea-subtitle {
  font-size: 16pt;
  color: var(--gray-600);
  margin: 0;
  font-weight: 400;
}

.score-showcase {
  background: var(--white);
  border-radius: 16pt;
  padding: 32pt;
  box-shadow: var(--shadow-lg);
  border: 1pt solid var(--gray-200);
  max-width: 400pt;
  margin: 0 auto;
}

.score-container {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8pt;
  margin-bottom: 16pt;
}

.score-value {
  font-size: 64pt;
  font-weight: 800;
  line-height: 1;
  color: var(--primary-color);
}

.score-max {
  font-size: 24pt;
  color: var(--gray-500);
  font-weight: 600;
}

.score-label {
  font-size: 16pt;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 20pt;
}

.confidence-indicator {
  display: flex;
  flex-direction: column;
  gap: 8pt;
  align-items: center;
}

.confidence-bar {
  width: 200pt;
  height: 8pt;
  background: var(--gray-200);
  border-radius: 4pt;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  border-radius: 4pt;
  transition: width 0.3s ease;
}

.confidence-text {
  font-size: 12pt;
  color: var(--gray-600);
  font-weight: 500;
}

.report-metadata {
  background: var(--gray-50);
  border-radius: 12pt;
  padding: 24pt;
  border: 1pt solid var(--gray-200);
}

.metadata-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16pt;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 4pt;
}

.metadata-label {
  font-size: 10pt;
  color: var(--gray-500);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metadata-value {
  font-size: 13pt;
  color: var(--gray-800);
  font-weight: 600;
}

.cover-footer {
  margin-top: 60pt;
}

.confidentiality-notice {
  text-align: center;
  margin-bottom: 24pt;
}

.confidential-badge {
  display: inline-block;
  background: var(--danger-color);
  color: var(--white);
  padding: 6pt 12pt;
  border-radius: var(--border-radius);
  font-size: 10pt;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 12pt;
}

.confidentiality-notice p {
  font-size: 10pt;
  color: var(--gray-600);
  margin: 0;
  line-height: 1.5;
}

.footer-branding {
  text-align: center;
  padding-top: 16pt;
  border-top: 1pt solid var(--gray-200);
}

.footer-branding p {
  font-size: 10pt;
  color: var(--gray-500);
  margin: 0;
}

/* Enhanced Table of Contents */
.enhanced-toc-page {
  padding: 40pt;
  background: var(--white);
}

.toc-header {
  text-align: center;
  margin-bottom: 40pt;
}

.toc-title {
  font-family: 'Playfair Display', serif;
  font-size: 32pt;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 12pt 0;
}

.toc-subtitle {
  font-size: 14pt;
  color: var(--gray-600);
  margin: 0;
}

.toc-content {
  margin-bottom: 40pt;
}

.toc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16pt;
  border-bottom: 1pt solid var(--gray-200);
  transition: background-color 0.2s ease;
}

.toc-item:hover {
  background: var(--gray-50);
}

.toc-item-main {
  display: flex;
  align-items: center;
  gap: 16pt;
  flex: 1;
}

.toc-number {
  width: 32pt;
  height: 32pt;
  background: var(--primary-color);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12pt;
}

.toc-details {
  flex: 1;
}

.toc-section-title {
  font-size: 14pt;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 4pt 0;
}

.toc-description {
  font-size: 11pt;
  color: var(--gray-600);
  margin: 0;
}

.toc-page {
  font-size: 12pt;
  color: var(--gray-500);
  font-weight: 500;
}

.reading-guide {
  background: var(--gray-50);
  border-radius: 12pt;
  padding: 24pt;
  border: 1pt solid var(--gray-200);
}

.guide-title {
  font-size: 16pt;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 16pt 0;
}

.guide-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12pt;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 8pt;
}

.guide-icon {
  font-size: 16pt;
}

.guide-text {
  font-size: 11pt;
  color: var(--gray-700);
}

/* Executive Summary Page */
.executive-summary-page {
  padding: 40pt;
}

.section-header {
  margin-bottom: 32pt;
  text-align: center;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 28pt;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 8pt 0;
}

.section-subtitle {
  font-size: 14pt;
  color: var(--gray-600);
  margin: 0;
}

.executive-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24pt;
  margin-bottom: 32pt;
}

.recommendation-card {
  background: var(--white);
  border-radius: 12pt;
  padding: 24pt;
  box-shadow: var(--shadow-md);
  border: 1pt solid var(--gray-200);
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20pt;
}

.rec-status-badge {
  padding: 8pt 16pt;
  border-radius: var(--border-radius);
  font-size: 11pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rec-score {
  display: flex;
  align-items: baseline;
  gap: 4pt;
}

.score-number {
  font-size: 32pt;
  font-weight: 800;
  line-height: 1;
}

.rec-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16pt;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 4pt;
}

.metric-label {
  font-size: 10pt;
  color: var(--gray-500);
  font-weight: 500;
  text-transform: uppercase;
}

.metric-value {
  font-size: 14pt;
  font-weight: 600;
}

.key-insights {
  background: var(--gray-50);
  border-radius: 12pt;
  padding: 24pt;
  border: 1pt solid var(--gray-200);
}

.insights-title {
  font-size: 16pt;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 16pt 0;
}

.insights-grid {
  display: flex;
  flex-direction: column;
  gap: 12pt;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 12pt;
}

.insight-icon {
  font-size: 16pt;
  line-height: 1;
}

.insight-content {
  font-size: 11pt;
  color: var(--gray-700);
  line-height: 1.5;
}

.summary-content,
.recommendation-content {
  margin-bottom: 24pt;
}

.content-title {
  font-size: 18pt;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 12pt 0;
}

.summary-text,
.recommendation-text {
  font-size: 12pt;
  color: var(--gray-700);
  line-height: 1.6;
  margin: 0;
}

.next-steps-preview {
  background: var(--white);
  border-radius: 12pt;
  padding: 24pt;
  border: 1pt solid var(--gray-200);
  box-shadow: var(--shadow-sm);
}

.steps-grid {
  display: flex;
  flex-direction: column;
  gap: 12pt;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 16pt;
  padding: 12pt;
  border-radius: var(--border-radius);
  border-left: 4pt solid transparent;
}

.step-item.priority-high {
  background: #fef2f2;
  border-left-color: var(--danger-color);
}

.step-item.priority-medium {
  background: #fefbf2;
  border-left-color: var(--warning-color);
}

.step-number {
  width: 24pt;
  height: 24pt;
  background: var(--primary-color);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11pt;
}

.step-content {
  font-size: 11pt;
  color: var(--gray-700);
  line-height: 1.5;
}

/* Page Break Controls */
.page-break {
  break-before: page;
}

.avoid-break {
  break-inside: avoid;
}

.keep-together {
  break-inside: avoid;
  orphans: 3;
  widows: 3;
}

/* Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }
.text-sm { font-size: 10pt; }
.text-base { font-size: 11pt; }
.text-lg { font-size: 12pt; }
.text-xl { font-size: 14pt; }
.text-2xl { font-size: 18pt; }
.text-3xl { font-size: 24pt; }
.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 4pt; }
.mb-2 { margin-bottom: 8pt; }
.mb-3 { margin-bottom: 12pt; }
.mb-4 { margin-bottom: 16pt; }
.mb-6 { margin-bottom: 24pt; }
.mb-8 { margin-bottom: 32pt; }
.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 4pt; }
.mt-2 { margin-top: 8pt; }
.mt-3 { margin-top: 12pt; }
.mt-4 { margin-top: 16pt; }
.mt-6 { margin-top: 24pt; }
.mt-8 { margin-top: 32pt; }
.p-0 { padding: 0; }
.p-1 { padding: 4pt; }
.p-2 { padding: 8pt; }
.p-3 { padding: 12pt; }
.p-4 { padding: 16pt; }
.p-6 { padding: 24pt; }
.p-8 { padding: 32pt; }
`;
