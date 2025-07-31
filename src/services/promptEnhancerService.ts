/**
 * @file promptEnhancerService.ts
 * @description Service for enhancing user prompts using the Railway backend API
 */

export interface EnhancePromptRequest {
  prompt: string;
}

export interface EnhancePromptResponse {
  result: string;
}

/**
 * Enhances a user prompt using the Railway backend API
 * @param prompt - The prompt to enhance
 * @returns Promise resolving to the enhanced prompt
 */
export async function enhancePrompt(prompt: string): Promise<string> {
  if (!prompt.trim()) return prompt;

  try {
    const response = await fetch('https://deer-flow-wrappers.up.railway.app/api/prompt/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt.trim() }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: EnhancePromptResponse = await response.json();
    const enhancedPrompt = data.result || prompt;
    
    return enhancedPrompt;
  } catch (error) {
    console.error('Failed to enhance prompt:', error);
    // Falls back to original prompt on error
    return prompt;
  }
}
