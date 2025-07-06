
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');

async function extractPDFContent(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log('Attempting advanced PDF extraction...');
    const uint8Array = new Uint8Array(arrayBuffer);
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    
    // Look for text streams and objects in PDF
    const textMatches = text.match(/BT\s*(.*?)\s*ET/gs) || 
                       text.match(/stream\s*(.*?)\s*endstream/gs) ||
                       text.match(/\((.*?)\)/g);
    
    if (textMatches && textMatches.length > 0) {
      let extractedText = textMatches
        .map(match => {
          // Clean up PDF encoding
          return match
            .replace(/(BT|ET|stream|endstream|\(|\))/g, '')
            .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        })
        .filter(text => text.length > 3)
        .join(' ')
        .substring(0, 15000);
      
      console.log('PDF extraction successful, length:', extractedText.length);
      return extractedText || 'PDF content extracted but appears to be empty or encoded';
    }
    
    console.log('No readable text found in PDF');
    return 'PDF file processed but no readable text content found';
  } catch (error) {
    console.error('PDF extraction error:', error);
    return 'Error extracting PDF content: ' + error.message;
  }
}

async function extractDocxContent(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log('Attempting DOCX extraction...');
    // Basic DOCX extraction - look for document.xml content
    const content = new TextDecoder().decode(arrayBuffer);
    
    // Look for text between XML tags that typically contain document content
    const textMatches = content.match(/<w:t[^>]*>(.*?)<\/w:t>/gs);
    
    if (textMatches) {
      const extractedText = textMatches
        .map(match => match.replace(/<[^>]*>/g, ''))
        .filter(text => text.trim().length > 0)
        .join(' ')
        .substring(0, 15000);
      
      console.log('DOCX extraction successful, length:', extractedText.length);
      return extractedText || 'DOCX processed but no readable content found';
    }
    
    return 'DOCX file processed but no readable text found';
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return 'Error extracting DOCX content: ' + error.message;
  }
}

async function extractTextContent(arrayBuffer: ArrayBuffer, fileType: string, fileName: string): Promise<string> {
  try {
    console.log(`Extracting content for file: ${fileName}, type: ${fileType}`);
    
    // Handle plain text files
    if (fileType.includes('text') || fileType.includes('plain') || fileName.endsWith('.txt')) {
      const text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
      console.log('Text file extraction successful, length:', text.length);
      return text.substring(0, 20000);
    }
    
    // Handle PDF files
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      return await extractPDFContent(arrayBuffer);
    }
    
    // Handle DOCX files  
    if (fileType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
      return await extractDocxContent(arrayBuffer);
    }
    
    // Handle other document types
    if (fileType.includes('document') || fileType.includes('rtf')) {
      const text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
      // Basic cleanup for document formats
      const cleanText = text
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 15000);
      
      return cleanText || 'Document processed but no readable text found';
    }
    
    // Try generic text extraction as fallback
    try {
      const text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
      const cleanText = text
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanText.length > 50) {
        console.log('Fallback text extraction successful');
        return cleanText.substring(0, 10000);
      }
    } catch (fallbackError) {
      console.log('Fallback extraction failed:', fallbackError);
    }
    
    console.log('No suitable extraction method found for file type:', fileType);
    return `File uploaded successfully but content extraction not yet supported for ${fileType}. File can still be used for other operations.`;
    
  } catch (error) {
    console.error('Content extraction error:', error);
    return `Error extracting content from ${fileName}: ${error.message}`;
  }
}

async function generateSummaryAndKeywords(content: string, fileName: string): Promise<{summary: string, keywords: string[]}> {
  if (!GOOGLE_AI_API_KEY || content.length < 50) {
    console.log('Skipping summary generation - no API key or content too short');
    return {
      summary: content.length > 0 ? 'Content extracted successfully' : 'Summary generation not available',
      keywords: []
    };
  }

  try {
    console.log('Generating summary and keywords using Gemini...');
    const prompt = `Analyze this file content from "${fileName}" and provide:
1. A brief, informative summary (2-3 sentences)
2. Key topics and important keywords (max 10 keywords)

Content: ${content.substring(0, 3000)}

Respond in JSON format: {"summary": "...", "keywords": ["keyword1", "keyword2", ...]}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.2,
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        try {
          const parsed = JSON.parse(generatedText);
          console.log('Summary generation successful');
          return {
            summary: parsed.summary || 'Summary generated successfully',
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 10) : []
          };
        } catch (parseError) {
          console.log('JSON parsing failed, extracting content manually');
          // Extract summary from raw text if JSON parsing fails
          const lines = generatedText.split('\n').filter(line => line.trim());
          return {
            summary: lines.find(line => line.includes('summary') || line.length > 50)?.substring(0, 300) || 'Summary generated',
            keywords: []
          };
        }
      }
    } else {
      console.error('Gemini API response not ok:', response.status);
    }
  } catch (error) {
    console.error('Summary generation error:', error);
  }

  return {
    summary: content.length > 100 ? 'Content extracted and ready for analysis' : 'File processed successfully',
    keywords: []
  };
}

async function addToProcessingQueue(fileId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('file_processing_queue')
      .insert({
        file_id: fileId,
        user_id: userId,
        processing_status: 'completed'
      });
    
    if (error) {
      console.error('Error adding to processing queue:', error);
    }
  } catch (error) {
    console.error('Processing queue error:', error);
  }
}

serve(async (req) => {
  console.log('=== Extract file content function called ===', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { fileId, userId } = requestBody;
    
    console.log('Processing file content extraction:', { fileId, userId });
    
    if (!fileId) {
      console.error('No fileId provided in request');
      return new Response(JSON.stringify({ error: 'File ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get file information from database
    console.log('Fetching file metadata from database...');
    const { data: file, error: fileError } = await supabase
      .from('client_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !file) {
      console.error('File not found in database:', fileError);
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('File found:', file.file_name, 'Size:', file.file_size, 'Type:', file.file_type);

    // Skip if already processed
    if (file.content_extracted_at && file.file_content_text) {
      console.log('File already processed, skipping extraction');
      return new Response(JSON.stringify({ 
        success: true,
        message: 'File already processed',
        extractedLength: file.file_content_text.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Download file from storage
    console.log('Downloading file from storage:', file.file_path);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('client-files')
      .download(file.file_path);

    if (downloadError || !fileData) {
      console.error('Error downloading file from storage:', downloadError);
      return new Response(JSON.stringify({ error: 'Failed to download file from storage' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('File downloaded successfully, size:', fileData.size);

    // Extract content
    const arrayBuffer = await fileData.arrayBuffer();
    const extractedContent = await extractTextContent(arrayBuffer, file.file_type, file.file_name);
    
    console.log('Content extracted, length:', extractedContent.length);

    // Generate summary and keywords
    const { summary, keywords } = await generateSummaryAndKeywords(extractedContent, file.file_name);

    // Update database with extracted content
    console.log('Updating database with extracted content...');
    const { error: updateError } = await supabase
      .from('client_files')
      .update({
        file_content_text: extractedContent,
        content_summary: summary,
        content_keywords: keywords,
        content_extracted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('Error updating file with content:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to save extracted content' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Add to processing queue for tracking
    await addToProcessingQueue(fileId, userId || file.user_id);

    console.log('Content extraction completed successfully for file:', file.file_name);

    return new Response(JSON.stringify({ 
      success: true,
      extractedLength: extractedContent.length,
      summary: summary,
      keywordCount: keywords.length,
      fileName: file.file_name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-file-content function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
