/**
 * /api/status - Vercel Edge Function
 *
 * Check API connectivity and user credit balance.
 * Used by extension to verify API key and display credits.
 */

import {
  getUserByApiKey,
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
        JSON.stringify({
          success: false,
          error: 'Invalid API key'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get credit balance
    const creditsRemaining = await getCreditBalance(user.id);

    // Return success response with user info
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          tier: user.tier,
          credits_remaining: creditsRemaining
        },
        service_status: {
          api: 'operational',
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[Status] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
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
