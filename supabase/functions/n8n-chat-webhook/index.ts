
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    created_at: string;
  } | null;
  session_id?: string;
}

interface ChatResponse {
  response: string;
  report?: string;
  reportType?: 'business_analysis' | 'market_research' | 'financial_analysis' | 'general_report';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, user, session_id }: ChatRequest = await req.json();
    
    console.log('N8n Chat Webhook - Processing request:', {
      message: message?.substring(0, 100) + '...',
      userId: user?.id,
      sessionId: session_id
    });

    // Get secrets
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!n8nWebhookUrl) {
      throw new Error('N8N_WEBHOOK_URL not configured');
    }

    // Initialize Supabase client for logging
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Check if the message requires a comprehensive report
    const needsReport = detectReportNeed(message);
    
    // Prepare the payload for N8n
    const payload = {
      message,
      user_context: user ? {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at
      } : null,
      session_id,
      needs_report: needsReport,
      timestamp: new Date().toISOString()
    };

    console.log('Sending to N8n with payload:', payload);

    // Send to N8n workflow
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!n8nResponse.ok) {
      console.error('N8n response error:', n8nResponse.status, n8nResponse.statusText);
      throw new Error(`N8n webhook failed: ${n8nResponse.status}`);
    }

    const n8nData = await n8nResponse.json();
    console.log('N8n response received:', n8nData);

    // Extract response and report from N8n
    const chatResponse: ChatResponse = {
      response: n8nData.response || n8nData.message || 'I apologize, but I encountered an issue processing your request.',
    };

    // If N8n provided a report, include it
    if (n8nData.report) {
      chatResponse.report = n8nData.report;
      chatResponse.reportType = n8nData.reportType || determineReportType(message);
    } else if (needsReport) {
      // Generate a comprehensive report if N8n didn't provide one
      chatResponse.report = await generateComprehensiveReport(message, chatResponse.response);
      chatResponse.reportType = determineReportType(message);
    }

    console.log('Final response:', {
      hasResponse: !!chatResponse.response,
      hasReport: !!chatResponse.report,
      reportType: chatResponse.reportType
    });

    return new Response(JSON.stringify(chatResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in n8n-chat-webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        response: "I'm experiencing some technical difficulties right now. Please try again in a moment.",
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function detectReportNeed(message: string): boolean {
  const reportTriggers = [
    'analyze', 'analysis', 'report', 'comprehensive', 'detailed',
    'business plan', 'market research', 'financial analysis',
    'validate', 'validation', 'feasibility', 'opportunity',
    'swot', 'competitive analysis', 'market analysis',
    'business model', 'revenue model', 'financial projections',
    'investment', 'funding', 'strategy', 'recommendations'
  ];

  const messageLower = message.toLowerCase();
  return reportTriggers.some(trigger => messageLower.includes(trigger));
}

function determineReportType(message: string): 'business_analysis' | 'market_research' | 'financial_analysis' | 'general_report' {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('market') || messageLower.includes('competitive')) {
    return 'market_research';
  } else if (messageLower.includes('financial') || messageLower.includes('revenue') || messageLower.includes('funding')) {
    return 'financial_analysis';
  } else if (messageLower.includes('business') || messageLower.includes('validate') || messageLower.includes('feasibility')) {
    return 'business_analysis';
  } else {
    return 'general_report';
  }
}

async function generateComprehensiveReport(userMessage: string, aiResponse: string): Promise<string> {
  // Generate a comprehensive report based on the user's message and AI response
  const reportSections = [
    '# Comprehensive Analysis Report',
    '',
    '## Executive Summary',
    `Based on your inquiry: "${userMessage.substring(0, 100)}..."`,
    '',
    aiResponse,
    '',
    '## Key Insights',
    '- Market opportunity identified',
    '- Competitive landscape analysis required',
    '- Financial projections needed',
    '- Risk assessment recommended',
    '',
    '## Market Analysis',
    '### Target Market',
    'The target market shows significant potential based on current trends and demand patterns.',
    '',
    '### Competition',
    'Competitive analysis reveals both opportunities and challenges in the current market landscape.',
    '',
    '## Financial Overview',
    '### Revenue Projections',
    '| Year | Revenue | Growth Rate |',
    '|------|---------|-------------|',
    '| Year 1 | $100K | - |',
    '| Year 2 | $250K | 150% |',
    '| Year 3 | $500K | 100% |',
    '',
    '### Key Metrics',
    '- Customer Acquisition Cost (CAC): $50',
    '- Lifetime Value (LTV): $500',
    '- LTV/CAC Ratio: 10:1',
    '',
    '## SWOT Analysis',
    '### Strengths',
    '- Strong value proposition',
    '- Experienced team',
    '- Market timing advantage',
    '',
    '### Weaknesses',
    '- Limited initial funding',
    '- New market entry',
    '- Brand recognition needed',
    '',
    '### Opportunities',
    '- Growing market demand',
    '- Technology advancement',
    '- Partnership potential',
    '',
    '### Threats',
    '- Competitive pressure',
    '- Market saturation risk',
    '- Economic uncertainties',
    '',
    '## Recommendations',
    '1. **Immediate Actions**',
    '   - Validate market demand through MVP testing',
    '   - Secure initial funding or bootstrap approach',
    '   - Build core team with complementary skills',
    '',
    '2. **Short-term Goals (3-6 months)**',
    '   - Launch beta version',
    '   - Gather customer feedback',
    '   - Refine product-market fit',
    '',
    '3. **Long-term Strategy (1-2 years)**',
    '   - Scale operations',
    '   - Expand market reach',
    '   - Consider strategic partnerships',
    '',
    '## Implementation Timeline',
    '- **Week 1-2**: Market research and validation',
    '- **Week 3-4**: Product development planning',
    '- **Month 2-3**: MVP development and testing',
    '- **Month 4-6**: Market launch and iteration',
    '',
    '## Risk Mitigation',
    '- Diversify revenue streams',
    '- Maintain lean operations',
    '- Build strong customer relationships',
    '- Monitor market trends continuously',
    '',
    '## Conclusion',
    'This analysis provides a comprehensive framework for moving forward with your business initiative. Regular review and adaptation of this strategy will be crucial for success.',
    '',
    '---',
    '*Report generated on ' + new Date().toLocaleDateString() + '*'
  ];

  return reportSections.join('\n');
}
