
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
    console.log('Attempting PDF extraction...');
    // For PDF extraction, we'll use a simple approach for now
    // In a production environment, you'd want to use a proper PDF parsing library
    const uint8Array = new Uint8Array(arrayBuffer);
    const text = new TextDecoder().decode(uint8Array);
    
    // Basic PDF text extraction - look for text between stream objects
    const textMatches = text.match(/stream\s*(.*?)\s*endstream/gs);
    if (textMatches) {
      const extractedText = textMatches.map(match => {
        // Basic cleanup of PDF stream content
        return match.replace(/stream|endstream/g, '')
          .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }).join(' ').substring(0, 5000); // Limit to 5000 chars
      
      console.log('PDF extraction successful, extracted length:', extractedText.length);
      return extractedText;
    }
    
    console.log('No text streams found in PDF');
    return 'PDF content could not be extracted with basic parser';
  } catch (error) {
    console.error('PDF extraction error:', error);
    return 'Error extracting PDF content';
  }
}

async function extractTextContent(arrayBuffer: ArrayBuffer, fileType: string): Promise<string> {
  try {
    console.log('Extracting content for file type:', fileType);
    
    if (fileType.includes('text') || fileType.includes('plain')) {
      const text = new TextDecoder().decode(arrayBuffer);
      console.log('Text file extraction successful, length:', text.length);
      return text.substring(0, 10000); // Limit to 10k chars for text files
    }
    
    if (fileType.includes('pdf')) {
      return await extractPDFContent(arrayBuffer);
    }
    
    // For other file types, return a basic message
    console.log('Unsupported file type for extraction:', fileType);
    return `Content extraction not yet supported for ${fileType}`;
  } catch (error) {
    console.error('Content extraction error:', error);
    return 'Error extracting file content';
  }
}

async function generateSummaryAndKeywords(content: string, fileName: string): Promise<{summary: string, keywords: string[]}> {
  if (!GOOGLE_AI_API_KEY || content.length < 50) {
    console.log('Skipping summary generation - no API key or content too short');
    return {
      summary: 'Summary generation not available',
      keywords: []
    };
  }

  try {
    console.log('Generating summary and keywords using Gemini...');
    const prompt = `Analyze this file content from "${fileName}" and provide:
1. A brief summary (2-3 sentences)
2. Key topics/keywords (max 8 keywords)

Content: ${content.substring(0, 2000)}

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
          maxOutputTokens: 500,
          temperature: 0.3,
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
            summary: parsed.summary || 'Summary not available',
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords : []
          };
        } catch {
          // If JSON parsing fails, extract summary manually
          console.log('JSON parsing failed, using raw text as summary');
          return {
            summary: generatedText.substring(0, 200),
            keywords: []
          };
        }
      }
    } else {
      console.error('Gemini API response not ok:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Summary generation error:', error);
  }

  return {
    summary: 'Summary generation failed',
    keywords: []
  };
}

serve(async (req) => {
  console.log('Extract file content function called:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { fileId } = requestBody;
    
    console.log('Processing file content extraction for fileId:', fileId);
    
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

    // Download file from storage
    console.log('Downloading file from storage:', file.file_path);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('client-files')
      .download(file.file_path);

    if (downloadError || !fileData) {
      console.error('Error downloading file from storage:', downloadError);
      return new Response(JSON.stringify({ error: 'Failed to download file' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('File downloaded successfully, size:', fileData.size);

    // Extract content
    const arrayBuffer = await fileData.arrayBuffer();
    const extractedContent = await extractTextContent(arrayBuffer, file.file_type);
    
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

    console.log('Content extraction completed successfully for file:', file.file_name);

    return new Response(JSON.stringify({ 
      success: true,
      extractedLength: extractedContent.length,
      summary: summary,
      keywordCount: keywords.length
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
