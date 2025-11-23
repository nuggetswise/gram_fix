/**
 * OpenAI API Client for GhostWrite
 *
 * Fallback LLM provider when Gemini API fails.
 * Uses OpenAI's GPT-3.5-turbo model for cost efficiency.
 */

import { getSystemPrompt } from './prompts.js';

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-3.5-turbo';

/**
 * Call OpenAI API with system prompt and user text
 * @param {string} text - User's selected text to process
 * @param {string} action - Action type (humanize, rewrite, improve)
 * @param {object} options - Additional options (model, temperature, etc.)
 * @returns {Promise<string>} Processed text from OpenAI
 * @throws {Error} If API call fails
 */
export async function callOpenAI(text, action, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable not set');
  }

  // Get the appropriate system prompt for this action
  const systemPrompt = getSystemPrompt(action, options);

  // Construct the request payload using chat completions format
  const requestBody = {
    model: options.model || DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2048,
    top_p: options.topP || 1.0,
    frequency_penalty: 0,
    presence_penalty: 0
  };

  try {
    const response = await fetch(OPENAI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();

    // Extract the generated text from OpenAI's response
    const result = extractTextFromResponse(data);

    if (!result) {
      throw new Error('OpenAI API returned empty response');
    }

    return result;

  } catch (error) {
    // Log error for debugging
    console.error('OpenAI API error:', error.message);
    throw error;
  }
}

/**
 * Extract text from OpenAI API response
 * @param {object} data - Raw OpenAI API response
 * @returns {string|null} Extracted text or null if not found
 */
function extractTextFromResponse(data) {
  try {
    // OpenAI response structure:
    // {
    //   choices: [{
    //     message: {
    //       role: "assistant",
    //       content: "..."
    //     }
    //   }]
    // }

    if (!data.choices || data.choices.length === 0) {
      return null;
    }

    const choice = data.choices[0];

    if (!choice.message || !choice.message.content) {
      return null;
    }

    const text = choice.message.content;

    // Clean up the response (remove any leading/trailing whitespace)
    return text ? text.trim() : null;

  } catch (error) {
    console.error('Error extracting text from OpenAI response:', error);
    return null;
  }
}

/**
 * Test OpenAI API connectivity
 * @returns {Promise<boolean>} True if API is accessible
 */
export async function testOpenAIConnection() {
  try {
    const result = await callOpenAI('Test', 'humanize');
    return !!result;
  } catch (error) {
    console.error('OpenAI connection test failed:', error);
    return false;
  }
}

/**
 * Estimate OpenAI API cost for a request
 * @param {string} text - Text to process
 * @param {string} model - Model to use (default: gpt-3.5-turbo)
 * @returns {number} Estimated cost in USD
 */
export function estimateOpenAICost(text, model = DEFAULT_MODEL) {
  // GPT-3.5-turbo pricing (as of 2024):
  // Input: $0.0005 per 1K tokens
  // Output: $0.0015 per 1K tokens
  // Rough estimate: 1 token ≈ 4 characters

  const charCount = text.length;
  const tokenCount = Math.ceil(charCount / 4);

  const inputCost = (tokenCount / 1000) * 0.0005;
  const outputCost = (tokenCount / 1000) * 0.0015; // Assume similar length output

  // GPT-4 is more expensive (if used)
  if (model.includes('gpt-4')) {
    return (tokenCount / 1000) * 0.03 + (tokenCount / 1000) * 0.06;
  }

  return inputCost + outputCost;
}
