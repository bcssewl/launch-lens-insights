/**
 * @file downloadReport.ts
 * @description Professional download functionality with multiple format support
 */

import { toast } from '@/hooks/use-toast';

interface DownloadOptions {
  content: string;
  title?: string;
  format: 'md' | 'pdf' | 'docx' | 'txt' | 'html';
  includeTimestamp?: boolean;
  customFilename?: string;
}

/**
 * Generates a professional timestamp for filenames
 */
const generateTimestamp = (): string => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
};

/**
 * Cleans a title for use in filename
 */
const cleanTitleForFilename = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
};

/**
 * Converts markdown to plain text
 */
const markdownToPlainText = (markdown: string): string => {
  return markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/```[\s\S]*?```/g, '[Code Block]') // Replace code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code backticks
    .replace(/^\s*[-*+]\s+/gm, '• ') // Convert list items to bullets
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list numbers
    .replace(/\n{3,}/g, '\n\n'); // Reduce multiple newlines
};

/**
 * Converts markdown to HTML
 */
const markdownToHtml = async (markdown: string): Promise<string> => {
  // Simple markdown to HTML conversion
  let html = markdown
    .replace(/#{6}\s+(.+)/g, '<h6>$1</h6>')
    .replace(/#{5}\s+(.+)/g, '<h5>$1</h5>')
    .replace(/#{4}\s+(.+)/g, '<h4>$1</h4>')
    .replace(/#{3}\s+(.+)/g, '<h3>$1</h3>')
    .replace(/#{2}\s+(.+)/g, '<h2>$1</h2>')
    .replace(/#{1}\s+(.+)/g, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^\s*[-*+]\s+(.+)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>');

  // Handle code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  return html;
};

/**
 * Generates PDF using jsPDF
 */
const generatePDF = async (content: string, title: string): Promise<Blob> => {
  const { jsPDF } = await import('jspdf');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set up document metadata
  pdf.setProperties({
    title: title,
    subject: 'Research Report',
    author: 'Launch Lens',
    creator: 'Launch Lens Platform',
  });

  // Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(51, 51, 51);
  pdf.text(title, 20, 25);

  // Date and branding
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  pdf.text(`Generated on ${dateStr}`, 20, 35);
  pdf.text('Launch Lens Research Platform', 20, 40);

  // Add separator line
  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, 45, 190, 45);

  // Content
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(51, 51, 51);

  const plainText = markdownToPlainText(content);
  const lines = pdf.splitTextToSize(plainText, 170);

  let yPosition = 55;
  const lineHeight = 6;
  const pageHeight = 280;
  const marginBottom = 20;

  lines.forEach((line: string, index: number) => {
    if (yPosition + lineHeight > pageHeight - marginBottom) {
      pdf.addPage();
      yPosition = 25;
    }

    pdf.text(line, 20, yPosition);
    yPosition += lineHeight;
  });

  // Footer on each page
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Page ${i} of ${pageCount}`, 20, 290);
    pdf.text('Launch Lens Research Platform', 150, 290);
  }

  return pdf.output('blob');
};

/**
 * Main download function with multiple format support
 */
export const downloadReport = async ({
  content,
  title = 'research-report',
  format = 'md',
  includeTimestamp = true,
  customFilename
}: DownloadOptions): Promise<string> => {
  try {
    const timestamp = includeTimestamp ? generateTimestamp() : '';
    const cleanTitle = cleanTitleForFilename(title);
    
    const filename = customFilename || 
      [cleanTitle, timestamp].filter(Boolean).join('-') + `.${format}`;

    let blob: Blob;
    let mimeType: string;

    switch (format) {
      case 'md':
        blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        mimeType = 'text/markdown';
        break;

      case 'txt':
        const plainText = markdownToPlainText(content);
        blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
        mimeType = 'text/plain';
        break;

      case 'html':
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #2563eb;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    h1 { font-size: 2rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    pre {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'Monaco', 'Courier New', monospace;
    }
    code {
      background: #f1f5f9;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }
    blockquote {
      border-left: 4px solid #3b82f6;
      margin: 1rem 0;
      padding-left: 1rem;
      color: #64748b;
      font-style: italic;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    ul, ol {
      padding-left: 1.5rem;
    }
    li {
      margin-bottom: 0.5rem;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    .meta {
      color: #64748b;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="meta">Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })} | Launch Lens Research Platform</div>
  </div>
  ${await markdownToHtml(content)}
</body>
</html>`;
        
        blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        mimeType = 'text/html';
        break;

      case 'pdf':
        blob = await generatePDF(content, title);
        mimeType = 'application/pdf';
        break;

      case 'docx':
        // For now, convert to rich text - full DOCX would require additional library
        const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 ${title}\\par\\par
Generated: ${new Date().toLocaleDateString()}\\par\\par
${markdownToPlainText(content).replace(/\n/g, '\\par ')}}`;
        
        blob = new Blob([rtfContent], { type: 'application/rtf' });
        mimeType = 'application/rtf';
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Create and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    return filename;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

/**
 * Gets format-specific metadata
 */
export const getFormatInfo = (format: string) => {
  const formats = {
    md: { name: 'Markdown', extension: 'md', description: 'Structured text with formatting' },
    pdf: { name: 'PDF', extension: 'pdf', description: 'Professional document format' },
    docx: { name: 'Word Document', extension: 'rtf', description: 'Microsoft Word compatible' },
    html: { name: 'HTML', extension: 'html', description: 'Web page format' },
    txt: { name: 'Plain Text', extension: 'txt', description: 'Simple text without formatting' }
  };

  return formats[format as keyof typeof formats] || formats.md;
};