
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

/* Page Setup for Print */
@page {
  size: A4;
  margin: 2cm 2.5cm 3cm 2.5cm;
  orphans: 3;
  widows: 3;
  
  @top-left {
    content: "Idea Validation Report";
    font-family: 'Inter', sans-serif;
    font-size: 10pt;
    color: var(--gray-500);
    margin-top: 0.5cm;
  }
  
  @top-right {
    content: attr(data-report-title);
    font-family: 'Inter', sans-serif;
    font-size: 10pt;
    color: var(--gray-500);
    margin-top: 0.5cm;
    text-align: right;
  }
  
  @bottom-center {
    content: "Page " counter(page) " of " counter(pages);
    font-family: 'Inter', sans-serif;
    font-size: 10pt;
    color: var(--gray-500);
    margin-bottom: 0.5cm;
  }
  
  @bottom-left {
    content: "Generated " attr(data-generated-date);
    font-family: 'Inter', sans-serif;
    font-size: 9pt;
    color: var(--gray-400);
    margin-bottom: 0.5cm;
  }
  
  @bottom-right {
    content: attr(data-confidentiality);
    font-family: 'Inter', sans-serif;
    font-size: 9pt;
    color: var(--danger-color);
    font-weight: 600;
    margin-bottom: 0.5cm;
  }
}

/* Cover page - no headers/footers */
@page :first {
  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-center { content: none; }
  @bottom-left { content: none; }
  @bottom-right { content: none; }
}

/* Table of contents page */
@page toc {
  @top-left { content: "Table of Contents"; }
}

/* Section pages */
@page section {
  @top-left { content: "Idea Validation Report"; }
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
  counter-reset: page-counter;
}

/* Page Break Controls */
.page-break-before {
  break-before: page;
  page: section;
}

.page-break-after {
  break-after: page;
}

.page-break-inside-avoid {
  break-inside: avoid;
  orphans: 3;
  widows: 3;
}

.page-break-keep-together {
  break-inside: avoid;
  orphans: 4;
  widows: 4;
}

/* Section-specific page breaks */
.print-section {
  break-inside: avoid;
  margin-bottom: 24pt;
  min-height: 100pt; /* Minimum height to justify a section */
}

.print-section + .print-section {
  break-before: page;
  page: section;
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
  break-after: page;
  page: first;
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

/* ... keep existing code (cover page styles) */

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

/* ... keep existing code (cover main section styles) */

/* Enhanced Table of Contents */
.enhanced-toc-page {
  padding: 40pt;
  background: var(--white);
  break-before: page;
  page: toc;
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
  break-inside: avoid;
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

/* Section Headers with Smart Page Breaks */
.section-header {
  margin-bottom: 32pt;
  text-align: center;
  break-after: avoid;
  orphans: 4;
  widows: 4;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 28pt;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 8pt 0;
  break-after: avoid;
}

.section-subtitle {
  font-size: 14pt;
  color: var(--gray-600);
  margin: 0;
  break-after: avoid;
}

/* Content Sections with Optimal Breaks */
.content-section {
  margin-bottom: 24pt;
  break-inside: avoid;
  orphans: 3;
  widows: 3;
}

.content-section h3 {
  font-size: 16pt;
  font-weight: 600;
  color: var(--gray-800);
  margin: 20pt 0 12pt 0;
  break-after: avoid;
  orphans: 4;
  widows: 4;
}

.content-section p {
  margin-bottom: 12pt;
  orphans: 2;
  widows: 2;
}

/* Cards and Containers */
.print-card {
  border: 1pt solid var(--gray-200);
  border-radius: 6pt;
  padding: 16pt;
  background: var(--gray-50);
  break-inside: avoid;
  margin-bottom: 16pt;
  color: var(--gray-800);
  orphans: 3;
  widows: 3;
}

.print-metric-card {
  text-align: center;
  padding: 20pt 16pt;
  border: 1pt solid var(--gray-300);
  border-radius: 8pt;
  background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%);
  break-inside: avoid;
  color: var(--gray-800);
  margin-bottom: 16pt;
}

.print-metric-value {
  font-size: 24pt;
  font-weight: 700;
  color: var(--primary-color);
  display: block;
  margin-bottom: 6pt;
}

.print-metric-label {
  font-size: 11pt;
  color: var(--gray-600);
  font-weight: 500;
}

/* Grid Layouts with Break Controls */
.print-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20pt;
  break-inside: avoid;
  margin-bottom: 20pt;
}

.print-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16pt;
  break-inside: avoid;
  margin-bottom: 20pt;
}

/* Tables with Smart Breaks */
.print-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16pt 0;
  break-inside: auto;
  background: var(--white);
}

.print-table thead {
  break-inside: avoid;
  break-after: auto;
}

.print-table thead th {
  background: var(--gray-100);
  font-weight: 600;
  padding: 12pt 16pt;
  border: 1pt solid var(--gray-300);
  text-align: left;
  color: var(--gray-800);
  break-inside: avoid;
}

.print-table tbody tr {
  break-inside: avoid;
  orphans: 2;
  widows: 2;
}

.print-table td {
  padding: 10pt 16pt;
  border: 1pt solid var(--gray-300);
  background: var(--white);
  color: var(--gray-800);
}

/* Charts and Visual Elements */
.recharts-wrapper,
.print-chart-container {
  background: var(--white);
  border: 1pt solid var(--gray-200);
  border-radius: 6pt;
  padding: 16pt;
  break-inside: avoid;
  margin: 16pt 0;
  min-height: 200pt;
}

/* Lists with Proper Breaks */
.print-list {
  margin: 12pt 0;
  break-inside: auto;
}

.print-list-item {
  margin-bottom: 8pt;
  break-inside: avoid;
  orphans: 2;
  widows: 2;
}

/* Status Indicators */
.print-status-high {
  background: var(--success-color)20;
  color: var(--success-color);
  padding: 4pt 8pt;
  border-radius: 4pt;
  font-size: 10pt;
  font-weight: 600;
}

.print-status-medium {
  background: var(--warning-color)20;
  color: var(--warning-color);
  padding: 4pt 8pt;
  border-radius: 4pt;
  font-size: 10pt;
  font-weight: 600;
}

.print-status-low {
  background: var(--danger-color)20;
  color: var(--danger-color);
  padding: 4pt 8pt;
  border-radius: 4pt;
  font-size: 10pt;
  font-weight: 600;
}

/* Typography Hierarchy */
.print-title-1 {
  font-family: 'Playfair Display', serif;
  font-size: 24pt;
  font-weight: 700;
  line-height: 1.2;
  color: var(--gray-900);
  margin-bottom: 20pt;
  break-after: avoid;
  orphans: 4;
  widows: 4;
}

.print-title-2 {
  font-size: 20pt;
  font-weight: 600;
  line-height: 1.3;
  color: var(--gray-800);
  margin: 24pt 0 16pt 0;
  border-bottom: 2pt solid var(--gray-200);
  padding-bottom: 8pt;
  break-after: avoid;
  orphans: 4;
  widows: 4;
}

.print-title-3 {
  font-size: 16pt;
  font-weight: 600;
  line-height: 1.4;
  color: var(--gray-700);
  margin: 20pt 0 12pt 0;
  break-after: avoid;
  orphans: 3;
  widows: 3;
}

.print-body {
  font-size: 11pt;
  line-height: 1.6;
  color: var(--gray-700);
  margin-bottom: 12pt;
  orphans: 2;
  widows: 2;
}

.print-caption {
  font-size: 10pt;
  color: var(--gray-500);
  font-style: italic;
  margin-top: 6pt;
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

/* Spacing utilities with break awareness */
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

/* Print-specific spacing */
.print-space-y-2 > * + * { margin-top: 8pt; }
.print-space-y-3 > * + * { margin-top: 12pt; }
.print-space-y-4 > * + * { margin-top: 16pt; }
.print-space-y-6 > * + * { margin-top: 24pt; }

/* Force page breaks for major sections */
.force-page-break {
  break-before: page;
  page: section;
}

/* Prevent page breaks within these elements */
.no-page-break {
  break-inside: avoid;
  orphans: 4;
  widows: 4;
}

/* Widow and orphan control for all elements */
* {
  orphans: 2;
  widows: 2;
}

h1, h2, h3, h4, h5, h6 {
  orphans: 4;
  widows: 4;
  break-after: avoid;
}

p, li {
  orphans: 2;
  widows: 2;
}

/* Final page break cleanup */
.print-section:last-child {
  break-after: auto;
}
`;
