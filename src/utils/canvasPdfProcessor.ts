
import { marked, Tokens } from 'marked';

interface ProcessedContent {
  html: string;
  title: string;
  wordCount: number;
  estimatedPages: number;
}

// Custom renderer for ChatGPT-style PDF formatting
const createChatGptPdfRenderer = () => {
  const renderer = new marked.Renderer();
  
  // H1 always starts new page, H2 smart breaks
  renderer.heading = ({ tokens, depth }: Tokens.Heading) => {
    const text = renderer.parser.parseInline(tokens);
    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
    
    let classes = '';
    if (depth === 1) {
      classes = ' class="page-break-before"';
    } else if (depth === 2) {
      classes = ' class="smart-page-break"';
    }
    
    return `<h${depth}${classes} id="${id}">${text}</h${depth}>`;
  };
  
  // Tables wrapped to avoid page breaks
  renderer.table = (token: Tokens.Table) => {
    const headerHtml = token.header.map(cell => {
      const cellText = renderer.parser.parseInline(cell.tokens);
      const align = cell.align ? ` style="text-align: ${cell.align}"` : '';
      return `<th${align}>${cellText}</th>`;
    }).join('');
    
    const bodyHtml = token.rows.map(row => 
      `<tr>${row.map(cell => {
        const cellText = renderer.parser.parseInline(cell.tokens);
        const align = cell.align ? ` style="text-align: ${cell.align}"` : '';
        return `<td${align}>${cellText}</td>`;
      }).join('')}</tr>`
    ).join('');
    
    return `<div class="table-container page-break-avoid">
      <table>
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    </div>`;
  };
  
  // Code blocks wrapped to avoid page breaks
  renderer.code = ({ text, lang }: Tokens.Code) => {
    const language = lang || '';
    return `<div class="code-container page-break-avoid">
      <pre><code class="language-${language}">${text}</code></pre>
    </div>`;
  };
  
  // Paragraphs with proper spacing and widow/orphan control
  renderer.paragraph = ({ tokens }: Tokens.Paragraph) => {
    const text = renderer.parser.parseInline(tokens);
    return `<p class="content-paragraph">${text}</p>`;
  };
  
  // Lists with proper spacing and page break avoidance
  renderer.list = (token: Tokens.List) => {
    const tag = token.ordered ? 'ol' : 'ul';
    const itemsHtml = token.items.map(item => {
      const itemText = renderer.parser.parseInline(item.tokens);
      return `<li>${itemText}</li>`;
    }).join('');
    return `<${tag} class="content-list page-break-avoid">${itemsHtml}</${tag}>`;
  };
  
  // Handle images with page break avoidance
  renderer.image = ({ href, title, text }: Tokens.Image) => {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<div class="image-container page-break-avoid">
      <img src="${href}" alt="${text}"${titleAttr} />
    </div>`;
  };
  
  // Handle blockquotes
  renderer.blockquote = ({ tokens }: Tokens.Blockquote) => {
    const text = renderer.parser.parse(tokens);
    return `<blockquote class="content-blockquote page-break-avoid">${text}</blockquote>`;
  };
  
  return renderer;
};

export const processMarkdownForPdf = async (markdown: string): Promise<ProcessedContent> => {
  // Configure marked with custom renderer
  marked.setOptions({
    renderer: createChatGptPdfRenderer(),
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
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 350)); // Adjusted for ChatGPT density
  
  return {
    html,
    title,
    wordCount,
    estimatedPages
  };
};

export const createChatGptPdfHtml = (content: ProcessedContent, metadata: {
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
        /* Import Inter font */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        /* Global reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1f2937;
            background: white;
        }
        
        /* Print-specific page setup */
        @media print {
            @page {
                size: A4;
                margin: 20mm;
                @bottom-left {
                    content: "${content.title}";
                    font-family: 'Inter', sans-serif;
                    font-size: 9pt;
                    color: #6b7280;
                }
                @bottom-center {
                    content: counter(page) " / " counter(pages);
                    font-family: 'Inter', sans-serif;
                    font-size: 9pt;
                    color: #6b7280;
                }
                @bottom-right {
                    content: "${metadata.generatedDate}";
                    font-family: 'Inter', sans-serif;
                    font-size: 9pt;
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
            
            /* ChatGPT-exact heading styles */
            h1 {
                font-size: 24pt;
                font-weight: 700;
                margin-bottom: 16pt;
                page-break-after: avoid;
                orphans: 4;
                widows: 4;
            }
            
            h2 {
                font-size: 18pt;
                font-weight: 600;
                margin-top: 20pt;
                margin-bottom: 12pt;
                page-break-after: avoid;
                border-bottom: 1pt solid #e5e7eb;
                padding-bottom: 6pt;
                orphans: 4;
                widows: 4;
            }
            
            h3 {
                font-size: 14pt;
                font-weight: 600;
                margin-top: 16pt;
                margin-bottom: 8pt;
                page-break-after: avoid;
                orphans: 3;
                widows: 3;
            }
            
            h4, h5, h6 {
                font-size: 12pt;
                font-weight: 600;
                margin-top: 12pt;
                margin-bottom: 6pt;
                page-break-after: avoid;
                orphans: 3;
                widows: 3;
            }
            
            /* Page break controls */
            .page-break-before {
                page-break-before: always;
            }
            
            .smart-page-break {
                page-break-before: auto;
            }
            
            .page-break-avoid {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            /* Paragraph styles with widow/orphan control */
            .content-paragraph {
                margin-bottom: 12pt;
                orphans: 2;
                widows: 2;
            }
            
            /* List styles */
            .content-list {
                margin-bottom: 12pt;
                padding-left: 20pt;
                orphans: 2;
                widows: 2;
            }
            
            .content-list li {
                margin-bottom: 4pt;
                orphans: 2;
                widows: 2;
            }
            
            /* Table styles - exact ChatGPT specs */
            .table-container {
                margin: 12pt 0;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 10pt;
            }
            
            th {
                font-size: 10pt;
                font-weight: 600;
                background: #f3f4f6;
                border: 1pt solid #d1d5db;
                padding: 8pt;
                text-align: left;
            }
            
            td {
                border: 1pt solid #d1d5db;
                padding: 8pt;
                text-align: left;
                font-size: 10pt;
            }
            
            /* Code block styles */
            .code-container {
                margin: 12pt 0;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            pre {
                background: #f8fafc;
                border: 1pt solid #e2e8f0;
                border-radius: 4pt;
                padding: 12pt;
                font-family: 'JetBrains Mono', 'Courier New', monospace;
                font-size: 9pt;
                overflow-wrap: anywhere;
                white-space: pre-wrap;
            }
            
            code {
                font-family: 'JetBrains Mono', 'Courier New', monospace;
                font-size: 9pt;
            }
            
            /* Inline code */
            p code, li code {
                background: #f1f5f9;
                padding: 2pt 4pt;
                border-radius: 2pt;
                font-size: 9pt;
            }
            
            /* Image styles */
            .image-container {
                margin: 12pt 0;
                page-break-inside: avoid;
                text-align: center;
            }
            
            img {
                max-width: 100%;
                height: auto;
            }
            
            /* Blockquote styles */
            .content-blockquote {
                margin: 12pt 0;
                padding-left: 16pt;
                border-left: 3pt solid #e5e7eb;
                font-style: italic;
                color: #4b5563;
                page-break-inside: avoid;
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
                text-decoration: underline;
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
            font-size: 32pt;
            font-weight: 700;
            margin-bottom: 24pt;
            color: #1f2937;
        }
        
        .cover-subtitle {
            font-size: 14pt;
            color: #6b7280;
            margin-bottom: 48pt;
        }
        
        .cover-metadata {
            background: #f8fafc;
            border-radius: 8pt;
            padding: 24pt;
            border: 1pt solid #e2e8f0;
            max-width: 400pt;
        }
        
        .metadata-item {
            margin-bottom: 8pt;
            font-size: 11pt;
            display: flex;
            justify-content: space-between;
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
        <p class="cover-subtitle">Generated by AI Assistant</p>
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

// Legacy function for backward compatibility
export const createPdfHtml = createChatGptPdfHtml;
