/**
 * Gemini API Client for GhostWrite
 *
 * Primary LLM provider for AI text processing.
 * Uses Google's Gemini Pro model via REST API.
 */

import { getSystemPrompt } from './prompts.js';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Call Gemini API with system prompt and user text
 * @param {string} text - User's selected text to process
 * @param {string} action - Action type (humanize, rewrite, improve)
 * @param {object} options - Additional options (temperature, maxTokens, etc.)
 * @returns {Promise<string>} Processed text from Gemini
 * @throws {Error} If API call fails
 */
export async function callGeminiAPI(text, action, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable not set');
  }

  // Get the appropriate system prompt for this action
  const systemPrompt = getSystemPrompt(action, options);

  // Construct the request payload
  const requestBody = {
    contents: [{
      parts: [
        {
          text: `${systemPrompt}\n\n${text}`
        }
      ]
    }],
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxTokens || 2048,
      topP: options.topP || 0.95,
      topK: options.topK || 40
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE'
      }
    ]
  };

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();

    // Extract the generated text from Gemini's response
    const result = extractTextFromResponse(data);

    if (!result) {
      throw new Error('Gemini API returned empty response');
    }

    return result;

  } catch (error) {
    // Log error for debugging but throw for fallback handling
    console.error('Gemini API error:', error.message);
    throw error;
  }
}

/**
 * Extract text from Gemini API response
 * @param {object} data - Raw Gemini API response
 * @returns {string|null} Extracted text or null if not found
 */
function extractTextFromResponse(data) {
  try {
    // Gemini response structure:
    // {
    //   candidates: [{
    //     content: {
    //       parts: [{ text: "..." }]
    //     }
    //   }]
    // }

    if (!data.candidates || data.candidates.length === 0) {
      return null;
    }

    const candidate = data.candidates[0];

    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      return null;
    }

    const text = candidate.content.parts[0].text;

    // Clean up the response (remove any leading/trailing whitespace)
    return text ? text.trim() : null;

  } catch (error) {
    console.error('Error extracting text from Gemini response:', error);
    return null;
  }
}

/**
 * Test Gemini API connectivity
 * @returns {Promise<boolean>} True if API is accessible
 */
export async function testGeminiConnection() {
  try {
    const result = await callGeminiAPI('Test', 'humanize');
    return !!result;
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
}

/**
 * Estimate Gemini API cost for a request
 * @param {string} text - Text to process
 * @returns {number} Estimated cost in USD
 */
export function estimateGeminiCost(text) {
  // Gemini Pro pricing (as of 2024):
  // Input: $0.00025 per 1K characters
  // Output: $0.0005 per 1K characters
  // Assuming average output is same length as input

  const charCount = text.length;
  const inputCost = (charCount / 1000) * 0.00025;
  const outputCost = (charCount / 1000) * 0.0005;

  return inputCost + outputCost;
}
