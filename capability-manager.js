/**
 * GhostWrite Capability Manager
 * Handles detection and management of Harper WASM and Cloud API availability
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
      cloudAPI: {
        connected: false,
        status: 'unknown', // 'connected' | 'offline' | 'error' | 'unknown'
        credits: 0,
        tier: 'free', // 'free' | 'trial' | 'paid'
        error: null,
        checkTime: null
      },
      mode: 'INITIALIZING' // 'AI_READY' | 'BASIC_ONLY' | 'ERROR' | 'INITIALIZING'
    };

    this.listeners = new Set();
    this.harperInstance = null;
    this.apiKey = null;
    this.apiEndpoint = 'https://your-api-endpoint.com'; // TODO: Configure this
  }

  /**
   * Initialize all capabilities on extension load
   * @returns {Promise<Object>} Final capability state
   */
  async initialize() {
    console.log('[GhostWrite] Initializing capabilities...');

    // Load API key from storage
    await this.loadAPIKey();

    // Run checks in parallel for speed
    const [harperResult, apiResult] = await Promise.allSettled([
      this.initHarper(),
      this.checkCloudAPI()
    ]);

    // Update state based on results
    if (harperResult.status === 'fulfilled') {
      this.state.harper = harperResult.value;
    } else {
      this.state.harper.error = harperResult.reason?.message || 'Failed to load';
    }

    if (apiResult.status === 'fulfilled') {
      this.state.cloudAPI = apiResult.value;
    } else {
      this.state.cloudAPI.error = apiResult.reason?.message || 'Failed to check';
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
   * Load API key from chrome.storage
   */
  async loadAPIKey() {
    try {
      const result = await chrome.storage.local.get(['apiKey']);
      this.apiKey = result.apiKey || null;
    } catch (error) {
      console.error('[GhostWrite] Failed to load API key:', error);
    }
  }

  /**
   * Save API key to chrome.storage
   * @param {string} apiKey - API key to save
   */
  async saveAPIKey(apiKey) {
    try {
      await chrome.storage.local.set({ apiKey });
      this.apiKey = apiKey;
      // Re-check API availability
      await this.checkCloudAPI();
      this.updateMode();
      await this.updateBadge();
      this.notifyListeners();
    } catch (error) {
      console.error('[GhostWrite] Failed to save API key:', error);
    }
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
   * Check Cloud API availability and credits
   * @returns {Promise<Object>} Cloud API state
   */
  async checkCloudAPI() {
    const startTime = performance.now();

    // If no API key, user is in free tier (grammar only)
    if (!this.apiKey) {
      return {
        connected: false,
        status: 'offline',
        credits: 0,
        tier: 'free',
        error: 'No API key configured',
        checkTime: Math.round(performance.now() - startTime)
      };
    }

    try {
      // Check API connectivity and fetch credit balance
      const response = await fetch(`${this.apiEndpoint}/api/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const checkTime = performance.now() - startTime;

      return {
        connected: true,
        status: 'connected',
        credits: data.credits || 0,
        tier: data.tier || 'trial',
        error: null,
        checkTime: Math.round(checkTime)
      };
    } catch (error) {
      console.error('[GhostWrite] Cloud API check failed:', error);

      // Check if offline
      if (!navigator.onLine) {
        return {
          connected: false,
          status: 'offline',
          credits: 0,
          tier: 'free',
          error: 'No internet connection',
          checkTime: Math.round(performance.now() - startTime)
        };
      }

      return {
        connected: false,
        status: 'error',
        credits: 0,
        tier: 'free',
        error: error.message,
        checkTime: Math.round(performance.now() - startTime)
      };
    }
  }

  /**
   * Determine overall extension mode based on capabilities
   */
  updateMode() {
    if (!this.state.harper.loaded) {
      this.state.mode = 'ERROR';
      return;
    }

    if (this.state.cloudAPI.connected && this.state.cloudAPI.credits > 0) {
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
        text: '✨',
        color: '#10b981', // Green
        title: `GhostWrite (AI Ready)\nGrammar + AI Features\n${this.state.cloudAPI.credits} credits remaining`
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
          enabled: this.state.cloudAPI.connected && this.state.cloudAPI.credits > 0,
          label: 'AI Humanization',
          detail: this.state.cloudAPI.connected
            ? `Ready (${this.state.cloudAPI.credits} credits)`
            : this.state.cloudAPI.error
        },
        rewrite: {
          enabled: this.state.cloudAPI.connected && this.state.cloudAPI.credits > 0,
          label: 'AI Rewrite',
          detail: this.state.cloudAPI.connected
            ? `Ready (${this.state.cloudAPI.credits} credits)`
            : this.state.cloudAPI.error
        }
      },
      credits: {
        remaining: this.state.cloudAPI.credits,
        tier: this.state.cloudAPI.tier
      },
      upgradePrompt: !this.state.cloudAPI.connected || this.state.cloudAPI.credits === 0 ? {
        title: this.state.cloudAPI.credits === 0 ? 'Credits Depleted' : 'Enable AI Features',
        message: this.state.cloudAPI.credits === 0
          ? 'Buy more credits to continue using AI features'
          : this.state.cloudAPI.error || 'Sign up to get 100 free credits',
        action: this.state.cloudAPI.credits === 0 ? 'BUY_CREDITS' : 'SIGN_UP'
      } : null
    };
  }

  /**
   * Humanize text using Cloud API (Gemini primary, OpenAI fallback)
   * TWO-STAGE PIPELINE: 1) AI Humanize → 2) Auto Grammar Check
   * @param {string} text - Text to humanize
   * @returns {Promise<Object>} Result with humanized text and grammar errors
   */
  async humanizeText(text) {
    // Check if API available
    if (!this.state.cloudAPI.connected || this.state.cloudAPI.credits < 1) {
      throw new Error('No credits available. Please purchase credits to use AI features.');
    }

    try {
      console.log('[GhostWrite] Starting two-stage pipeline: AI Humanize → Grammar Check');

      // STAGE 1: AI Humanization
      const response = await fetch(`${this.apiEndpoint}/api/humanize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          text,
          action: 'humanize'
        })
      });

      if (response.status === 402) {
        throw new Error('No credits remaining');
      }

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      // Update credit balance
      this.state.cloudAPI.credits = data.credits_remaining || this.state.cloudAPI.credits - 1;
      this.updateMode();
      await this.updateBadge();
      this.notifyListeners();

      // STAGE 2: Automatic Grammar Check (if enabled and Harper loaded)
      let grammarErrors = [];
      if (data.should_check_grammar && this.state.harper.loaded) {
        console.log('[GhostWrite] Stage 2: Running automatic grammar check on AI output');
        try {
          grammarErrors = await this.checkGrammar(data.result);
          console.log(`[GhostWrite] Found ${grammarErrors.length} grammar issues in AI output`);
        } catch (grammarError) {
          console.warn('[GhostWrite] Grammar check failed, returning AI result without grammar info:', grammarError);
        }
      }

      // Return complete pipeline result
      return {
        text: data.result,
        grammarErrors: grammarErrors,
        provider: data.provider,
        creditsRemaining: data.credits_remaining,
        pipelineComplete: true
      };
    } catch (error) {
      console.error('[GhostWrite] Humanization failed:', error);
      throw error;
    }
  }

  /**
   * Rewrite text using Cloud API
   * TWO-STAGE PIPELINE: 1) AI Rewrite → 2) Auto Grammar Check
   * @param {string} text - Text to rewrite
   * @returns {Promise<Object>} Result with rewritten text and grammar errors
   */
  async rewriteText(text) {
    if (!this.state.cloudAPI.connected || this.state.cloudAPI.credits < 1) {
      throw new Error('No credits available. Please purchase credits to use AI features.');
    }

    try {
      console.log('[GhostWrite] Starting two-stage pipeline: AI Rewrite → Grammar Check');

      // STAGE 1: AI Rewrite
      const response = await fetch(`${this.apiEndpoint}/api/rewrite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          text,
          action: 'rewrite'
        })
      });

      if (response.status === 402) {
        throw new Error('No credits remaining');
      }

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      // Update credit balance
      this.state.cloudAPI.credits = data.credits_remaining || this.state.cloudAPI.credits - 1;
      this.updateMode();
      await this.updateBadge();
      this.notifyListeners();

      // STAGE 2: Automatic Grammar Check (if enabled and Harper loaded)
      let grammarErrors = [];
      if (data.should_check_grammar && this.state.harper.loaded) {
        console.log('[GhostWrite] Stage 2: Running automatic grammar check on AI output');
        try {
          grammarErrors = await this.checkGrammar(data.result);
          console.log(`[GhostWrite] Found ${grammarErrors.length} grammar issues in AI output`);
        } catch (grammarError) {
          console.warn('[GhostWrite] Grammar check failed, returning AI result without grammar info:', grammarError);
        }
      }

      // Return complete pipeline result
      return {
        text: data.result,
        grammarErrors: grammarErrors,
        provider: data.provider,
        creditsRemaining: data.credits_remaining,
        pipelineComplete: true
      };
    } catch (error) {
      console.error('[GhostWrite] Rewrite failed:', error);
      throw error;
    }
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
   * Re-check Cloud API availability (for credit balance updates)
   */
  async recheckCloudAPI() {
    console.log('[GhostWrite] Rechecking Cloud API...');

    const apiResult = await this.checkCloudAPI();
    this.state.cloudAPI = apiResult;

    // Update mode if status changed
    const oldMode = this.state.mode;
    this.updateMode();

    if (oldMode !== this.state.mode) {
      console.log(`[GhostWrite] Mode changed: ${oldMode} → ${this.state.mode}`);
      await this.updateBadge();

      // Show notification if mode changed
      if (this.state.mode === 'AI_READY' && oldMode === 'BASIC_ONLY') {
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
        message: `You now have ${this.state.cloudAPI.credits} credits for AI features.`,
        priority: 2
      });
    } catch (error) {
      console.error('[GhostWrite] Notification failed:', error);
    }
  }

  /**
   * Show low credits warning
   */
  async showLowCreditsWarning() {
    if (this.state.cloudAPI.credits <= 10 && this.state.cloudAPI.credits > 0) {
      try {
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon128.png',
          title: 'GhostWrite Credits Running Low ⚠️',
          message: `Only ${this.state.cloudAPI.credits} credits remaining. Buy more to continue using AI features.`,
          priority: 1
        });
      } catch (error) {
        console.error('[GhostWrite] Notification failed:', error);
      }
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.listeners.clear();
  }
}

// Export for use in background.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CapabilityManager;
}
