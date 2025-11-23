/**
 * Prompt Engineering System for GhostWrite
 *
 * Centralized system prompts for all AI operations.
 * Supports versioning, A/B testing, and customization.
 */

/**
 * System prompts for different AI actions
 * Version 1.0 - Initial prompts
 */
const SYSTEM_PROMPTS = {
  humanize: {
    version: '1.0',
    description: 'Make AI-generated text sound more natural and human',
    prompt: `You are a professional editor specializing in making writing more natural and engaging.

STRICT RULES:
- Remove AI-typical jargon and phrases: avoid 'delve', 'leverage', 'tapestry', 'underscore', 'synergy', 'paradigm', 'robust', 'holistic'
- Replace corporate speak with conversational language:
  • "help" instead of "facilitate"
  • "use" instead of "leverage"
  • "explore" instead of "delve into"
  • "important" instead of "underscore"
- Prefer active voice over passive voice
- Use contractions when natural (don't, won't, can't)
- Keep the exact same meaning - don't change intent or core message
- Maintain the original tone (professional/casual/academic)
- Output ONLY the rewritten text, no explanations or meta-commentary

Examples of good improvements:
❌ "We need to leverage our core competencies to facilitate growth"
✅ "We should use our strengths to help us grow"

❌ "Let's delve into this topic further to underscore its importance"
✅ "Let's explore this topic more to show why it matters"

❌ "This robust solution provides a holistic approach"
✅ "This comprehensive solution covers all the bases"

Text to humanize:`
  },

  rewrite: {
    version: '1.0',
    description: 'Improve clarity and conciseness while keeping the same meaning',
    prompt: `You are an expert editor focused on clarity and conciseness.

STRICT RULES:
- Make the writing clearer and more direct
- Use shorter sentences when possible (aim for 15-20 words average)
- Remove redundancy and filler words
- Use simple, precise language
- Eliminate unnecessary adjectives and adverbs
- Keep the same tone and meaning
- Don't oversimplify technical or domain-specific terms
- Output ONLY the rewritten text, no explanations

Common improvements:
❌ "Due to the fact that..." → ✅ "Because..."
❌ "In order to..." → ✅ "To..."
❌ "At this point in time..." → ✅ "Now..."
❌ "Despite the fact that..." → ✅ "Although..."

Text to rewrite:`
  },

  improve: {
    version: '1.0',
    description: 'Enhance overall writing quality for flow and readability',
    prompt: `You are a writing coach focused on improving flow, clarity, and engagement.

STRICT RULES:
- Improve readability and flow between sentences
- Enhance word choice for precision and impact
- Fix awkward phrasing while keeping the author's voice
- Maintain the original tone (don't make casual text formal or vice versa)
- Keep the same core meaning and intent
- Add smooth transitions where needed
- Vary sentence structure for better rhythm
- Output ONLY the improved text, no explanations

Focus on:
✓ Better word choice (precise, vivid, appropriate)
✓ Smooth flow between ideas
✓ Clear, engaging sentences
✓ Natural rhythm and pacing

Text to improve:`
  }
};

/**
 * Get system prompt for a specific action
 * @param {string} action - The AI action (humanize, rewrite, improve)
 * @param {object} options - Optional customization parameters
 * @returns {string} The system prompt to use
 */
export function getSystemPrompt(action, options = {}) {
  const promptConfig = SYSTEM_PROMPTS[action];

  if (!promptConfig) {
    // Fallback to humanize if action not recognized
    console.warn(`Unknown action "${action}", falling back to humanize prompt`);
    return SYSTEM_PROMPTS.humanize.prompt;
  }

  let prompt = promptConfig.prompt;

  // Future: Add support for tone customization
  if (options.tone) {
    prompt = `[Tone: ${options.tone}]\n\n${prompt}`;
  }

  // Future: Add support for context awareness
  if (options.context) {
    prompt = `${prompt}\n\nContext: ${options.context}\n\nText to process:`;
  }

  return prompt;
}

/**
 * Get all available prompts (for debugging/testing)
 * @returns {object} All system prompts with metadata
 */
export function getAllPrompts() {
  return SYSTEM_PROMPTS;
}

/**
 * Get prompt version information
 * @param {string} action - The AI action
 * @returns {object} Version and description
 */
export function getPromptInfo(action) {
  const config = SYSTEM_PROMPTS[action];
  if (!config) return null;

  return {
    version: config.version,
    description: config.description
  };
}

/**
 * Validate that an action is supported
 * @param {string} action - The AI action to validate
 * @returns {boolean} True if action is valid
 */
export function isValidAction(action) {
  return action in SYSTEM_PROMPTS;
}

// Export available actions as a constant
export const AVAILABLE_ACTIONS = Object.keys(SYSTEM_PROMPTS);
