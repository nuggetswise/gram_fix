/**
 * Supabase Client for GhostWrite
 *
 * Handles database operations for user management, credits, and usage tracking.
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
let supabase = null;

/**
 * Get Supabase client instance (singleton pattern)
 * @returns {object} Supabase client
 */
export function getSupabaseClient() {
  if (supabase) {
    return supabase;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set');
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

/**
 * Verify API key and get user data
 * @param {string} apiKey - User's API key
 * @returns {Promise<object|null>} User data or null if not found
 */
export async function getUserByApiKey(apiKey) {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('api_key', apiKey)
    .single();

  if (error) {
    console.error('Error fetching user by API key:', error);
    return null;
  }

  return data;
}

/**
 * Check if user has enough credits
 * @param {string} userId - User's ID
 * @param {number} creditsRequired - Number of credits needed (default: 1)
 * @returns {Promise<boolean>} True if user has enough credits
 */
export async function hasEnoughCredits(userId, creditsRequired = 1) {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('users')
    .select('credits_remaining')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking credits:', error);
    return false;
  }

  return data && data.credits_remaining >= creditsRequired;
}

/**
 * Deduct credits from user account
 * @param {string} userId - User's ID
 * @param {number} creditsToDeduct - Number of credits to deduct (default: 1)
 * @returns {Promise<boolean>} True if successful
 */
export async function deductCredits(userId, creditsToDeduct = 1) {
  const client = getSupabaseClient();

  // Use a transaction-like approach: get current credits, then update
  const { data: user, error: fetchError } = await client
    .from('users')
    .select('credits_remaining')
    .eq('id', userId)
    .single();

  if (fetchError || !user) {
    console.error('Error fetching user for credit deduction:', fetchError);
    return false;
  }

  const newCredits = Math.max(0, user.credits_remaining - creditsToDeduct);

  const { error: updateError } = await client
    .from('users')
    .update({ credits_remaining: newCredits })
    .eq('id', userId);

  if (updateError) {
    console.error('Error deducting credits:', updateError);
    return false;
  }

  return true;
}

/**
 * Log usage for analytics and auditing
 * @param {string} userId - User's ID
 * @param {string} action - Action performed (humanize, rewrite, improve)
 * @param {number} textLength - Length of text processed
 * @param {number} creditsUsed - Credits consumed (default: 1)
 * @returns {Promise<boolean>} True if successful
 */
export async function logUsage(userId, action, textLength, creditsUsed = 1) {
  const client = getSupabaseClient();

  const { error } = await client
    .from('usage_logs')
    .insert([
      {
        user_id: userId,
        action: action,
        text_length: textLength,
        credits_used: creditsUsed
      }
    ]);

  if (error) {
    console.error('Error logging usage:', error);
    return false;
  }

  return true;
}

/**
 * Get user's credit balance
 * @param {string} userId - User's ID
 * @returns {Promise<number|null>} Credits remaining or null if error
 */
export async function getCreditBalance(userId) {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('users')
    .select('credits_remaining')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error getting credit balance:', error);
    return null;
  }

  return data ? data.credits_remaining : null;
}

/**
 * Create a new user with API key
 * @param {string} email - User's email
 * @param {string} apiKey - Generated API key
 * @param {number} initialCredits - Initial credit balance (default: 100 for trial)
 * @returns {Promise<object|null>} Created user or null if error
 */
export async function createUser(email, apiKey, initialCredits = 100) {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('users')
    .insert([
      {
        email: email,
        api_key: apiKey,
        credits_remaining: initialCredits,
        tier: 'trial'
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data;
}

/**
 * Update user's subscription tier
 * @param {string} userId - User's ID
 * @param {string} tier - New tier (trial, paid)
 * @param {number} creditsToAdd - Credits to add (optional)
 * @returns {Promise<boolean>} True if successful
 */
export async function updateUserTier(userId, tier, creditsToAdd = 0) {
  const client = getSupabaseClient();

  const updates = { tier: tier };

  if (creditsToAdd > 0) {
    // Get current credits first
    const { data: user } = await client
      .from('users')
      .select('credits_remaining')
      .eq('id', userId)
      .single();

    if (user) {
      updates.credits_remaining = user.credits_remaining + creditsToAdd;
    }
  }

  const { error } = await client
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user tier:', error);
    return false;
  }

  return true;
}
