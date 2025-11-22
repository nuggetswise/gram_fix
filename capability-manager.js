/**
 * GhostWrite Capability Manager
 * Handles detection and management of Harper WASM and Gemini Nano availability
 * Provides clear user feedback about feature availability
 */

class CapabilityManager {
  constructor() {
    this.state = {
      harper: {
        loaded: false,
        error: null,
        loadTime: null
      },
      geminiNano: {
        available: false,
        status: 'unknown', // 'readily' | 'after-download' | 'no' | 'unknown'
        error: null,
        checkTime: null
      },
      mode: 'INITIALIZING' // 'AI_READY' | 'BASIC_ONLY' | 'ERROR' | 'INITIALIZING'
    };

    this.listeners = new Set();
    this.harperInstance = null;
    this.geminiSession = null;
  }

  /**
   * Initialize all capabilities on extension load
   * @returns {Promise<Object>} Final capability state
   */
  async initialize() {
    console.log('[GhostWrite] Initializing capabilities...');

    // Run checks in parallel for speed
    const [harperResult, geminiResult] = await Promise.allSettled([
      this.initHarper(),
      this.checkGeminiNano()
    ]);

    // Update state based on results
    if (harperResult.status === 'fulfilled') {
      this.state.harper = harperResult.value;
    } else {
      this.state.harper.error = harperResult.reason?.message || 'Failed to load';
    }

    if (geminiResult.status === 'fulfilled') {
      this.state.geminiNano = geminiResult.value;
    } else {
      this.state.geminiNano.error = geminiResult.reason?.message || 'Failed to check';
    }

    // Determine overall mode
    this.updateMode();

    // Update UI
    await this.updateBadge();
    this.notifyListeners();

    console.log('[GhostWrite] Initialization complete:', this.state);
    return this.state;
  }

  /**
   * Load Harper WASM for grammar checking
   * @returns {Promise<Object>} Harper state
   */
  async initHarper() {
    const startTime = performance.now();

    try {
      // Method 1: Try importing from NPM package (if using build system)
      if (typeof Harper !== 'undefined') {
        this.harperInstance = await Harper.init();
      }
      // Method 2: Load WASM directly (fallback)
      else {
        const response = await fetch(chrome.runtime.getURL('harper.wasm'));
        const wasmBytes = await response.arrayBuffer();
        const wasmModule = await WebAssembly.instantiate(wasmBytes);
        this.harperInstance = wasmModule.instance.exports;
      }

      const loadTime = performance.now() - startTime;

      return {
        loaded: true,
        error: null,
        loadTime: Math.round(loadTime)
      };
    } catch (error) {
      console.error('[GhostWrite] Harper load failed:', error);
      return {
        loaded: false,
        error: error.message,
        loadTime: null
      };
    }
  }

  /**
   * Check Gemini Nano availability
   * @returns {Promise<Object>} Gemini Nano state
   */
  async checkGeminiNano() {
    const startTime = performance.now();

    try {
      // Check if window.ai exists
      if (!self.ai?.languageModel) {
        return {
          available: false,
          status: 'no',
          error: 'window.ai not found (use Chrome Canary)',
          checkTime: Math.round(performance.now() - startTime)
        };
      }

      // Check capabilities
      const capabilities = await self.ai.languageModel.capabilities();

      const checkTime = performance.now() - startTime;

      // Parse status
      const status = capabilities.available;
      const isReady = status === 'readily';

      return {
        available: isReady,
        status: status,
        error: isReady ? null : this.getGeminiStatusMessage(status),
        checkTime: Math.round(checkTime)
      };
    } catch (error) {
      console.error('[GhostWrite] Gemini Nano check failed:', error);
      return {
        available: false,
        status: 'error',
        error: error.message,
        checkTime: Math.round(performance.now() - startTime)
      };
    }
  }

  /**
   * Get user-friendly message for Gemini Nano status
   * @param {string} status - Raw capability status
   * @returns {string} User-friendly message
   */
  getGeminiStatusMessage(status) {
    const messages = {
      'no': 'Not available in this browser. Use Chrome Canary.',
      'after-download': 'Downloading AI model (5-10 min). Check back soon.',
      'unknown': 'Checking AI availability...',
      'error': 'Error checking AI availability.'
    };
    return messages[status] || 'Unknown status';
  }

  /**
   * Determine overall extension mode based on capabilities
   */
  updateMode() {
    if (!this.state.harper.loaded) {
      this.state.mode = 'ERROR';
      return;
    }

    if (this.state.geminiNano.available) {
      this.state.mode = 'AI_READY';
    } else {
      this.state.mode = 'BASIC_ONLY';
    }
  }

  /**
   * Update extension badge to reflect current mode
   */
  async updateBadge() {
    const badgeConfig = {
      'AI_READY': {
        text: '✨ AI',
        color: '#10b981', // Green
        title: 'GhostWrite (AI Mode)\nGrammar + Humanization active'
      },
      'BASIC_ONLY': {
        text: '📝',
        color: '#6b7280', // Gray
        title: 'GhostWrite (Basic Mode)\nGrammar checking only'
      },
      'ERROR': {
        text: '⚠️',
        color: '#ef4444', // Red
        title: 'GhostWrite (Error)\nClick to see details'
      },
      'INITIALIZING': {
        text: '⏳',
        color: '#f59e0b', // Orange
        title: 'GhostWrite (Loading...)'
      }
    };

    const config = badgeConfig[this.state.mode];

    try {
      await chrome.action.setBadgeText({ text: config.text });
      await chrome.action.setBadgeBackgroundColor({ color: config.color });
      await chrome.action.setTitle({ title: config.title });
    } catch (error) {
      console.error('[GhostWrite] Badge update failed:', error);
    }
  }

  /**
   * Get formatted status for popup UI
   * @returns {Object} Status object for display
   */
  getStatusForUI() {
    return {
      mode: this.state.mode,
      features: {
        grammar: {
          enabled: this.state.harper.loaded,
          label: 'Grammar Checking',
          detail: this.state.harper.loaded
            ? `Ready (loaded in ${this.state.harper.loadTime}ms)`
            : `Error: ${this.state.harper.error}`
        },
        humanize: {
          enabled: this.state.geminiNano.available,
          label: 'AI Humanization',
          detail: this.state.geminiNano.available
            ? `Ready (Gemini Nano)`
            : this.state.geminiNano.error
        },
        rewrite: {
          enabled: this.state.geminiNano.available,
          label: 'AI Rewrite',
          detail: this.state.geminiNano.available
            ? `Ready (Gemini Nano)`
            : this.state.geminiNano.error
        }
      },
      upgradePrompt: !this.state.geminiNano.available ? {
        title: 'Enable AI Features',
        message: this.state.geminiNano.error,
        action: 'SHOW_SETUP_GUIDE'
      } : null
    };
  }

  /**
   * Create Gemini Nano session for humanization
   * @returns {Promise<Object>} Session object
   */
  async createGeminiSession() {
    if (!this.state.geminiNano.available) {
      throw new Error('Gemini Nano not available');
    }

    try {
      // Destroy old session if exists
      if (this.geminiSession) {
        this.geminiSession.destroy();
      }

      // Create new session with system prompt
      this.geminiSession = await self.ai.languageModel.create({
        systemPrompt: `You are a professional editor. Rewrite text to sound more human and less robotic.

Rules:
- Remove AI jargon: "delve", "leverage", "tapestry", "underscore", "testament", "foster"
- Simplify complex sentences
- Use active voice
- Keep the original meaning
- Match the original tone (formal/casual)
- Return ONLY the rewritten text, no explanations`
      });

      return this.geminiSession;
    } catch (error) {
      console.error('[GhostWrite] Gemini session creation failed:', error);
      throw error;
    }
  }

  /**
   * Humanize text using Gemini Nano
   * @param {string} text - Text to humanize
   * @returns {Promise<string>} Humanized text
   */
  async humanizeText(text) {
    if (!this.state.geminiNano.available) {
      // Fallback to heuristic
      return this.heuristicHumanize(text);
    }

    try {
      // Ensure session exists
      if (!this.geminiSession) {
        await this.createGeminiSession();
      }

      const result = await this.geminiSession.prompt(text);
      return result.trim();
    } catch (error) {
      console.error('[GhostWrite] Humanization failed:', error);
      // Fallback to heuristic
      return this.heuristicHumanize(text);
    }
  }

  /**
   * Heuristic humanization (fallback when Gemini Nano unavailable)
   * @param {string} text - Text to process
   * @returns {string} Processed text
   */
  heuristicHumanize(text) {
    const replacements = {
      // AI jargon → simple words
      'delve': 'dig',
      'delves': 'digs',
      'delving': 'digging',
      'leverage': 'use',
      'leverages': 'uses',
      'leveraging': 'using',
      'utilize': 'use',
      'utilizes': 'uses',
      'utilizing': 'using',
      'tapestry': 'mix',
      'underscore': 'highlight',
      'underscores': 'highlights',
      'testament': 'proof',
      'foster': 'build',
      'fosters': 'builds',
      'fostering': 'building',
      'facilitate': 'help',
      'facilitates': 'helps',
      'holistic': 'complete',
      'synergy': 'teamwork',
      'paradigm': 'model',
      'robust': 'strong',
      'seamless': 'smooth'
    };

    let result = text;

    // Replace each word (case-insensitive, preserve original case)
    Object.entries(replacements).forEach(([aiWord, simpleWord]) => {
      const regex = new RegExp(`\\b${aiWord}\\b`, 'gi');
      result = result.replace(regex, (match) => {
        // Preserve capitalization
        if (match[0] === match[0].toUpperCase()) {
          return simpleWord.charAt(0).toUpperCase() + simpleWord.slice(1);
        }
        return simpleWord;
      });
    });

    return result;
  }

  /**
   * Check grammar using Harper
   * @param {string} text - Text to check
   * @returns {Promise<Array>} Array of grammar errors
   */
  async checkGrammar(text) {
    if (!this.state.harper.loaded) {
      throw new Error('Harper not loaded');
    }

    try {
      // Call Harper WASM (API depends on actual harper.js implementation)
      // This is a placeholder - adjust based on real API
      const errors = await this.harperInstance.lint(text);

      // Expected format: [{ span: [start, end], message: "...", suggestion: "..." }]
      return errors || [];
    } catch (error) {
      console.error('[GhostWrite] Grammar check failed:', error);
      return [];
    }
  }

  /**
   * Subscribe to capability state changes
   * @param {Function} callback - Called when state changes
   */
  addListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * Unsubscribe from state changes
   * @param {Function} callback - Callback to remove
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.getStatusForUI());
      } catch (error) {
        console.error('[GhostWrite] Listener error:', error);
      }
    });
  }

  /**
   * Re-check Gemini Nano availability (for polling during download)
   */
  async recheckGeminiNano() {
    console.log('[GhostWrite] Rechecking Gemini Nano...');

    const geminiResult = await this.checkGeminiNano();
    this.state.geminiNano = geminiResult;

    // Update mode if status changed
    const oldMode = this.state.mode;
    this.updateMode();

    if (oldMode !== this.state.mode) {
      console.log(`[GhostWrite] Mode changed: ${oldMode} → ${this.state.mode}`);
      await this.updateBadge();

      // Show celebration if upgraded to AI mode
      if (this.state.mode === 'AI_READY') {
        this.showUpgradeNotification();
      }
    }

    this.notifyListeners();
  }

  /**
   * Show notification when AI features become available
   */
  async showUpgradeNotification() {
    try {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'GhostWrite AI Features Ready! 🎉',
        message: 'Humanization and advanced rewriting are now available.',
        priority: 2
      });
    } catch (error) {
      console.error('[GhostWrite] Notification failed:', error);
    }
  }

  /**
   * Start polling for Gemini Nano if it's downloading
   */
  startPolling() {
    if (this.state.geminiNano.status === 'after-download') {
      console.log('[GhostWrite] Starting Gemini Nano download poll...');

      // Poll every 30 seconds
      this.pollInterval = setInterval(() => {
        this.recheckGeminiNano();
      }, 30000);
    }
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopPolling();

    if (this.geminiSession) {
      this.geminiSession.destroy();
      this.geminiSession = null;
    }

    this.listeners.clear();
  }
}

// Export for use in background.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CapabilityManager;
}
