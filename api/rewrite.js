/**
 * /api/rewrite - Vercel Edge Function
 *
 * Rewrites text for clarity and conciseness.
 * Uses Gemini API (primary) with OpenAI fallback.
 */

import { callGeminiAPI } from '../lib/gemini-client.js';
import { callOpenAI } from '../lib/openai-client.js';
import {
  getUserByApiKey,
  hasEnoughCredits,
  deductCredits,
  logUsage,
  getCreditBalance
} from '../lib/supabase-client.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Parse request body
    const { text, action } = await req.json();

    // Validate input
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid input: text is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid API key' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const apiKey = authHeader.replace('Bearer ', '');

    // Verify API key and get user
    const user = await getUserByApiKey(apiKey);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(user.id, 1);
    if (!hasCredits) {
      return new Response(
        JSON.stringify({
          error: 'Insufficient credits',
          credits_remaining: 0
        }),
        {
          status: 402,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Try Gemini API first (primary, cost-effective)
    let result;
    let provider = 'gemini';

    try {
      console.log(`[Rewrite] Calling Gemini API for user ${user.id}`);
      result = await callGeminiAPI(text, 'rewrite');
    } catch (geminiError) {
      console.warn('[Rewrite] Gemini API failed, falling back to OpenAI:', geminiError.message);

      // Fallback to OpenAI if Gemini fails
      try {
        result = await callOpenAI(text, 'rewrite');
        provider = 'openai';
      } catch (openaiError) {
        console.error('[Rewrite] Both Gemini and OpenAI failed:', openaiError.message);
        return new Response(
          JSON.stringify({
            error: 'AI service temporarily unavailable',
            details: 'Both primary and fallback services failed'
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Deduct credit
    const deducted = await deductCredits(user.id, 1);
    if (!deducted) {
      console.error('[Rewrite] Failed to deduct credits for user', user.id);
    }

    // Log usage for analytics
    await logUsage(user.id, 'rewrite', text.length, 1);

    // Get updated credit balance
    const creditsRemaining = await getCreditBalance(user.id);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        result: result,
        credits_remaining: creditsRemaining,
        provider: provider
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[Rewrite] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
