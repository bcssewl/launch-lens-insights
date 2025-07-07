
import { marked } from 'marked';

interface ProcessedContent {
  html: string;
  title: string;
  wordCount: number;
  estimatedPages: number;
}

// Custom renderer for better PDF formatting
const createPdfRenderer = () => {
  const renderer = new marked.Renderer();
  
  // Add page breaks before major headings
  renderer.heading = ({ tokens, depth }) => {
    const text = tokens.map(token => typeof token === 'string' ? token : token.raw || '').join('');
    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
    const pageBreakClass = depth <= 2 ? ' class="page-break-before"' : '';
    return `<h${depth}${pageBreakClass} id="${id}">${text}</h${depth}>`;
  };
  
  // Wrap tables to avoid page breaks
  renderer.table = ({ header, rows }) => {
    const headerHtml = header.map(cell => `<th>${cell.text}</th>`).join('');
    const bodyHtml = rows.map(row => 
      `<tr>${row.map(cell => `<td>${cell.text}</td>`).join('')}</tr>`
    ).join('');
    
    return `<div class="table-container page-break-avoid">
      <table>
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    </div>`;
  };
  
  // Wrap code blocks to avoid page breaks
  renderer.code = ({ text, lang }) => {
    const language = lang || '';
    return `<div class="code-container page-break-avoid">
      <pre><code class="language-${language}">${text}</code></pre>
    </div>`;
  };
  
  // Add proper paragraph spacing
  renderer.paragraph = ({ tokens }) => {
    const text = tokens.map(token => typeof token === 'string' ? token : token.raw || '').join('');
    return `<p class="content-paragraph">${text}</p>`;
  };
  
  // Handle lists with proper spacing
  renderer.list = ({ items, ordered }) => {
    const tag = ordered ? 'ol' : 'ul';
    const itemsHtml = items.map(item => `<li>${item.text}</li>`).join('');
    return `<${tag} class="content-list page-break-avoid">${itemsHtml}</${tag}>`;
  };
  
  return renderer;
};

export const processMarkdownForPdf = async (markdown: string): Promise<ProcessedContent> => {
  // Configure marked with custom renderer
  marked.setOptions({
    renderer: createPdfRenderer(),
    gfm: true,
    breaks: true
  });
  
  // Extract title from first heading
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'AI Report';
  
  // Convert markdown to HTML
  const html = await marked(markdown);
  
  // Calculate estimated metrics
  const wordCount = markdown.split(/\s+/).length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 400)); // ~400 words per page
  
  return {
    html,
    title,
    wordCount,
    estimatedPages
  };
};

export const createPdfHtml = (content: ProcessedContent, metadata: {
  generatedDate: string;
  author?: string;
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <style>
        /* Import fonts */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        /* Global styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
        }
        
        /* Screen styles */
        @media screen {
            body {
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
            }
        }
        
        /* Print styles - This is where the magic happens */
        @media print {
            @page {
                size: A4;
                margin: 20mm;
                @bottom-center {
                    content: counter(page) " / " counter(pages);
                    font-size: 10pt;
                    color: #6b7280;
                }
                @bottom-left {
                    content: "${content.title}";
                    font-size: 10pt;
                    color: #6b7280;
                }
                @bottom-right {
                    content: "${metadata.generatedDate}";
                    font-size: 10pt;
                    color: #6b7280;
                }
            }
            
            body {
                width: 100%;
                margin: 0;
                padding: 0;
                font-size: 11pt;
                line-height: 1.5;
            }
            
            /* Page break controls */
            .page-break-before {
                page-break-before: always;
            }
            
            .page-break-after {
                page-break-after: always;
            }
            
            .page-break-avoid {
                page-break-inside: avoid;
            }
            
            /* Heading styles */
            h1 {
                font-size: 24pt;
                font-weight: 700;
                margin-bottom: 16pt;
                page-break-after: avoid;
            }
            
            h2 {
                font-size: 18pt;
                font-weight: 600;
                margin-top: 20pt;
                margin-bottom: 12pt;
                page-break-after: avoid;
                border-bottom: 1pt solid #e5e7eb;
                padding-bottom: 6pt;
            }
            
            h3 {
                font-size: 14pt;
                font-weight: 600;
                margin-top: 16pt;
                margin-bottom: 8pt;
                page-break-after: avoid;
            }
            
            h4, h5, h6 {
                font-size: 12pt;
                font-weight: 600;
                margin-top: 12pt;
                margin-bottom: 6pt;
                page-break-after: avoid;
            }
            
            /* Paragraph and text styles */
            .content-paragraph {
                margin-bottom: 12pt;
                widows: 2;
                orphans: 2;
            }
            
            /* List styles */
            .content-list {
                margin-bottom: 12pt;
                padding-left: 20pt;
            }
            
            .content-list li {
                margin-bottom: 4pt;
                widows: 2;
                orphans: 2;
            }
            
            /* Table styles */
            .table-container {
                margin: 12pt 0;
                page-break-inside: avoid;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 10pt;
            }
            
            th, td {
                border: 1pt solid #d1d5db;
                padding: 6pt 8pt;
                text-align: left;
            }
            
            th {
                background: #f3f4f6;
                font-weight: 600;
            }
            
            /* Code block styles */
            .code-container {
                margin: 12pt 0;
                page-break-inside: avoid;
            }
            
            pre {
                background: #f8fafc;
                border: 1pt solid #e2e8f0;
                border-radius: 4pt;
                padding: 12pt;
                font-family: 'Courier New', monospace;
                font-size: 9pt;
                overflow-wrap: anywhere;
                white-space: pre-wrap;
            }
            
            code {
                font-family: 'Courier New', monospace;
                font-size: 9pt;
            }
            
            /* Image styles */
            img {
                max-width: 100%;
                height: auto;
                page-break-inside: avoid;
                margin: 12pt 0;
            }
            
            /* Strong and emphasis */
            strong {
                font-weight: 600;
            }
            
            em {
                font-style: italic;
            }
            
            /* Link styles for print */
            a {
                color: #2563eb;
                text-decoration: none;
            }
            
            a:after {
                content: " (" attr(href) ")";
                font-size: 9pt;
                color: #6b7280;
            }
        }
        
        /* Cover page styles */
        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            page-break-after: always;
        }
        
        .cover-title {
            font-size: 36pt;
            font-weight: 700;
            margin-bottom: 24pt;
            color: #1f2937;
        }
        
        .cover-subtitle {
            font-size: 16pt;
            color: #6b7280;
            margin-bottom: 48pt;
        }
        
        .cover-metadata {
            background: #f8fafc;
            border-radius: 12pt;
            padding: 24pt;
            border: 1pt solid #e2e8f0;
        }
        
        .metadata-item {
            margin-bottom: 8pt;
            font-size: 12pt;
        }
        
        .metadata-label {
            font-weight: 600;
            color: #374151;
        }
        
        .metadata-value {
            color: #6b7280;
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="cover-page">
        <h1 class="cover-title">${content.title}</h1>
        <p class="cover-subtitle">AI Generated Report</p>
        <div class="cover-metadata">
            <div class="metadata-item">
                <span class="metadata-label">Generated:</span>
                <span class="metadata-value">${metadata.generatedDate}</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Word Count:</span>
                <span class="metadata-value">${content.wordCount.toLocaleString()}</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Estimated Pages:</span>
                <span class="metadata-value">${content.estimatedPages}</span>
            </div>
            ${metadata.author ? `
            <div class="metadata-item">
                <span class="metadata-label">Author:</span>
                <span class="metadata-value">${metadata.author}</span>
            </div>
            ` : ''}
        </div>
    </div>
    
    <!-- Content -->
    <div class="content">
        ${content.html}
    </div>
</body>
</html>`;
};
