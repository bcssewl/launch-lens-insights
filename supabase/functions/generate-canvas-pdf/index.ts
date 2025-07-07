
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PdfRequest {
  content: string;
  title: string;
  metadata?: {
    generatedDate?: string;
    author?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { content, title, metadata = {} }: PdfRequest = await req.json();

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating PDF for:', title);

    // Import Puppeteer for server-side PDF generation
    const puppeteer = await import('https://deno.land/x/puppeteer@16.2.0/mod.ts');
    
    // Launch browser with specific settings for PDF generation
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      headless: true,
    });

    const page = await browser.newPage();

    // Process the markdown content (inline for edge function)
    const processedContent = await processMarkdownForPdf(content);
    
    // Create ChatGPT-style HTML
    const html = createChatGptPdfHtml(processedContent, {
      generatedDate: metadata.generatedDate || new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      author: metadata.author || 'AI Assistant'
    });

    // Set the HTML content
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Generate PDF with exact ChatGPT specifications
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm'
      },
      displayHeaderFooter: false, // We handle this with CSS @page
    });

    await browser.close();

    // Return the PDF as a download
    const filename = `${title.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
    
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Inline markdown processing functions for edge function
async function processMarkdownForPdf(markdown: string) {
  // Simple markdown to HTML conversion for edge function
  // In production, you'd use the full marked.js library
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'AI Report';
  
  // Basic markdown processing
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="page-break-avoid">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="smart-page-break">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="page-break-before">$1</h1>')
    // Bold and italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<div class="code-container page-break-avoid"><pre><code>$2</code></pre></div>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Lists
    .replace(/^\* (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul class="content-list page-break-avoid">$1</ul>')
    // Paragraphs
    .replace(/^(?!<[h123ul]|<\/[h123ul]|<div|<li)(.+)$/gm, '<p class="content-paragraph">$1</p>')
    // Line breaks
    .replace(/\n/g, '<br>');

  const wordCount = markdown.split(/\s+/).length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 350));

  return {
    html,
    title,
    wordCount,
    estimatedPages
  };
}

function createChatGptPdfHtml(content: any, metadata: any) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1f2937;
            background: white;
        }
        
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
        
        h1 { font-size: 24pt; font-weight: 700; margin-bottom: 16pt; page-break-after: avoid; }
        h2 { font-size: 18pt; font-weight: 600; margin-top: 20pt; margin-bottom: 12pt; page-break-after: avoid; border-bottom: 1pt solid #e5e7eb; padding-bottom: 6pt; }
        h3 { font-size: 14pt; font-weight: 600; margin-top: 16pt; margin-bottom: 8pt; page-break-after: avoid; }
        
        .page-break-before { page-break-before: always; }
        .page-break-avoid { page-break-inside: avoid; }
        .content-paragraph { margin-bottom: 12pt; orphans: 2; widows: 2; }
        .content-list { margin-bottom: 12pt; padding-left: 20pt; }
        .content-list li { margin-bottom: 4pt; }
        .code-container { margin: 12pt 0; page-break-inside: avoid; }
        pre { background: #f8fafc; border: 1pt solid #e2e8f0; border-radius: 4pt; padding: 12pt; font-family: 'JetBrains Mono', monospace; font-size: 9pt; }
        code { font-family: 'JetBrains Mono', monospace; font-size: 9pt; }
        strong { font-weight: 600; }
        em { font-style: italic; }
        
        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            page-break-after: always;
        }
        
        .cover-title { font-size: 32pt; font-weight: 700; margin-bottom: 24pt; color: #1f2937; }
        .cover-subtitle { font-size: 14pt; color: #6b7280; margin-bottom: 48pt; }
        .cover-metadata { background: #f8fafc; border-radius: 8pt; padding: 24pt; border: 1pt solid #e2e8f0; }
        .metadata-item { margin-bottom: 8pt; font-size: 11pt; display: flex; justify-content: space-between; }
        .metadata-label { font-weight: 600; color: #374151; }
        .metadata-value { color: #6b7280; }
    </style>
</head>
<body>
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
        </div>
    </div>
    
    <div class="content">
        ${content.html}
    </div>
</body>
</html>`;
}
