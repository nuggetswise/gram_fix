/**
 * GhostWrite Content Script
 * Handles text selection, menu display, and two-stage pipeline UI
 */

// Import capability manager (assuming it's available in the extension context)
// If using modules, adjust import syntax accordingly

class GhostWriteUI {
  constructor() {
    this.selectedText = '';
    this.selectionRange = null;
    this.menuElement = null;
    this.previewElement = null;
    this.loadingElement = null;
    this.debounceTimer = null;
    this.currentMode = 'INITIALIZING';
    this.credits = 0;

    this.init();
  }

  /**
   * Initialize the UI components and event listeners
   */
  async init() {
    // Inject UI components into the page
    this.injectStyles();
    this.createMenuElement();
    this.createPreviewElement();
    this.createLoadingElement();

    // Set up event listeners
    this.setupEventListeners();

    // Get initial capability status from background
    await this.updateCapabilityStatus();

    console.log('[GhostWrite] UI initialized');
  }

  /**
   * Inject styles into the page
   */
  injectStyles() {
    if (document.getElementById('ghostwrite-styles')) return;

    const link = document.createElement('link');
    link.id = 'ghostwrite-styles';
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('ui/styles.css');
    document.head.appendChild(link);
  }

  /**
   * Create the ghost menu element
   */
  async createMenuElement() {
    const response = await fetch(chrome.runtime.getURL('ui/ghost-menu.html'));
    const html = await response.text();

    const template = document.createElement('template');
    template.innerHTML = html.trim();
    this.menuElement = template.content.firstChild;

    document.body.appendChild(this.menuElement);

    // Attach button event listeners
    this.menuElement.querySelectorAll('.ghost-button').forEach(button => {
      button.addEventListener('click', (e) => this.handleAction(e));
    });
  }

  /**
   * Create the correction preview element
   */
  async createPreviewElement() {
    const response = await fetch(chrome.runtime.getURL('ui/correction-preview.html'));
    const html = await response.text();

    const template = document.createElement('template');
    template.innerHTML = html.trim();
    this.previewElement = template.content.firstChild;

    document.body.appendChild(this.previewElement);

    // Attach event listeners
    const closeBtn = this.previewElement.querySelector('.ghost-close');
    const acceptBtn = this.previewElement.querySelector('#ghost-accept-btn');
    const rejectBtn = this.previewElement.querySelector('#ghost-reject-btn');

    closeBtn?.addEventListener('click', () => this.hidePreview());
    acceptBtn?.addEventListener('click', () => this.acceptChanges());
    rejectBtn?.addEventListener('click', () => this.rejectChanges());
  }

  /**
   * Create the loading overlay element
   */
  createLoadingElement() {
    this.loadingElement = document.getElementById('ghostwrite-menu-loading');
  }

  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Text selection listener with debounce
    document.addEventListener('mouseup', () => this.handleSelection());
    document.addEventListener('keyup', () => this.handleSelection());

    // Click outside to close menu
    document.addEventListener('click', (e) => {
      if (!this.menuElement?.contains(e.target) &&
          !this.previewElement?.contains(e.target)) {
        this.hideMenu();
        this.hidePreview();
      }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideMenu();
        this.hidePreview();
      }
    });

    // Listen for capability status updates from background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'CAPABILITY_UPDATE') {
        this.updateUIState(message.status);
      }
    });
  }

  /**
   * Handle text selection with debounce
   */
  handleSelection() {
    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // 400ms debounce to avoid triggering on copy/paste
    this.debounceTimer = setTimeout(() => {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text.length > 0 && text.length < 10000) {
        this.selectedText = text;
        this.selectionRange = selection.getRangeAt(0);
        this.showMenu();
      } else {
        this.hideMenu();
      }
    }, 400);
  }

  /**
   * Show the ghost menu near the selection
   */
  showMenu() {
    if (!this.menuElement || !this.selectionRange) return;

    const rect = this.selectionRange.getBoundingClientRect();
    const menuHeight = 100; // Approximate menu height

    // Position above selection, or below if not enough space
    let top = rect.top + window.scrollY - menuHeight - 8;
    if (top < window.scrollY) {
      top = rect.bottom + window.scrollY + 8;
    }

    const left = rect.left + window.scrollX + (rect.width / 2);

    this.menuElement.style.top = `${top}px`;
    this.menuElement.style.left = `${left}px`;
    this.menuElement.style.transform = 'translateX(-50%)';
    this.menuElement.style.display = 'block';

    // Detect theme based on page background
    const theme = this.detectTheme();
    this.menuElement.setAttribute('data-theme', theme);
  }

  /**
   * Hide the ghost menu
   */
  hideMenu() {
    if (this.menuElement) {
      this.menuElement.style.display = 'none';
    }
  }

  /**
   * Detect page theme (light/dark)
   */
  detectTheme() {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    const rgb = bg.match(/\d+/g);
    if (!rgb) return 'light';

    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness > 128 ? 'light' : 'dark';
  }

  /**
   * Handle button actions (Fix Grammar, Humanize, Rewrite)
   */
  async handleAction(event) {
    const button = event.currentTarget;
    const action = button.getAttribute('data-action');

    if (!this.selectedText) return;

    // Check if button is locked (no credits)
    if (button.classList.contains('locked')) {
      this.showUpgradePrompt(action);
      return;
    }

    // Hide menu and show loading
    this.hideMenu();
    this.showLoading(action);

    try {
      let result;

      switch (action) {
        case 'fix-grammar':
          result = await this.checkGrammar(this.selectedText);
          break;

        case 'humanize':
          result = await this.humanizeText(this.selectedText);
          break;

        case 'rewrite':
          result = await this.rewriteText(this.selectedText);
          break;
      }

      // Hide loading and show preview
      this.hideLoading();
      this.showPreview(result, action);

    } catch (error) {
      console.error('[GhostWrite] Action failed:', error);
      this.hideLoading();
      this.showError(error.message);
    }
  }

  /**
   * Call background script to check grammar
   */
  async checkGrammar(text) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'CHECK_GRAMMAR', text },
        (response) => {
          if (response.success) {
            resolve({
              text: text,
              grammarErrors: response.errors || [],
              action: 'grammar'
            });
          } else {
            reject(new Error(response.error || 'Grammar check failed'));
          }
        }
      );
    });
  }

  /**
   * Call background script to humanize text (two-stage pipeline)
   */
  async humanizeText(text) {
    return new Promise((resolve, reject) => {
      // Update loading to show stage 1
      this.updateLoadingStage('ai');

      chrome.runtime.sendMessage(
        { action: 'HUMANIZE_TEXT', text },
        async (response) => {
          if (response.success) {
            // Stage 1 complete, update loading to stage 2
            this.updateLoadingStage('grammar');

            // Response includes both AI result and grammar errors
            resolve({
              originalText: text,
              text: response.text,
              grammarErrors: response.grammarErrors || [],
              provider: response.provider,
              creditsRemaining: response.creditsRemaining,
              pipelineComplete: response.pipelineComplete,
              action: 'humanize'
            });
          } else {
            reject(new Error(response.error || 'Humanization failed'));
          }
        }
      );
    });
  }

  /**
   * Call background script to rewrite text (two-stage pipeline)
   */
  async rewriteText(text) {
    return new Promise((resolve, reject) => {
      // Update loading to show stage 1
      this.updateLoadingStage('ai');

      chrome.runtime.sendMessage(
        { action: 'REWRITE_TEXT', text },
        async (response) => {
          if (response.success) {
            // Stage 1 complete, update loading to stage 2
            this.updateLoadingStage('grammar');

            // Response includes both AI result and grammar errors
            resolve({
              originalText: text,
              text: response.text,
              grammarErrors: response.grammarErrors || [],
              provider: response.provider,
              creditsRemaining: response.creditsRemaining,
              pipelineComplete: response.pipelineComplete,
              action: 'rewrite'
            });
          } else {
            reject(new Error(response.error || 'Rewrite failed'));
          }
        }
      );
    });
  }

  /**
   * Show loading overlay with stage indication
   */
  showLoading(action) {
    if (!this.loadingElement) return;

    const rect = this.selectionRange?.getBoundingClientRect();
    if (!rect) return;

    this.loadingElement.style.top = `${rect.top + window.scrollY}px`;
    this.loadingElement.style.left = `${rect.left + window.scrollX}px`;
    this.loadingElement.style.display = 'flex';

    // Show appropriate loading message
    const aiStage = this.loadingElement.querySelector('#ghost-stage-ai');
    const grammarStage = this.loadingElement.querySelector('#ghost-stage-grammar');

    if (action === 'fix-grammar') {
      aiStage.style.display = 'none';
      grammarStage.style.display = 'flex';
    } else {
      aiStage.style.display = 'flex';
      grammarStage.style.display = 'none';
    }
  }

  /**
   * Update loading stage (AI → Grammar)
   */
  updateLoadingStage(stage) {
    if (!this.loadingElement) return;

    const aiStage = this.loadingElement.querySelector('#ghost-stage-ai');
    const grammarStage = this.loadingElement.querySelector('#ghost-stage-grammar');

    if (stage === 'grammar') {
      aiStage.style.display = 'none';
      grammarStage.style.display = 'flex';
    }
  }

  /**
   * Hide loading overlay
   */
  hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
  }

  /**
   * Show preview with results
   */
  showPreview(result, action) {
    if (!this.previewElement) return;

    // Position preview
    const rect = this.selectionRange?.getBoundingClientRect();
    if (rect) {
      this.previewElement.style.top = `${rect.top + window.scrollY}px`;
      this.previewElement.style.left = `${rect.left + window.scrollX}px`;
    }

    // Update heading based on action
    const heading = this.previewElement.querySelector('#ghost-preview-heading');
    const headings = {
      'grammar': 'Grammar Check',
      'humanize': 'Humanized Text',
      'rewrite': 'Rewritten Text'
    };
    heading.textContent = headings[action] || 'Suggestions';

    // Show AI result section if applicable
    const aiResultSection = this.previewElement.querySelector('#ghost-ai-result');
    const grammarResultSection = this.previewElement.querySelector('#ghost-grammar-result');
    const noIssuesSection = this.previewElement.querySelector('#ghost-no-issues');
    const pipelineComplete = this.previewElement.querySelector('#ghost-pipeline-complete');

    // Reset visibility
    aiResultSection.style.display = 'none';
    grammarResultSection.style.display = 'none';
    noIssuesSection.style.display = 'none';
    pipelineComplete.style.display = 'none';

    // Show AI improvements if applicable
    if (action === 'humanize' || action === 'rewrite') {
      aiResultSection.style.display = 'block';

      const originalTextEl = this.previewElement.querySelector('#ghost-original-text');
      const aiTextEl = this.previewElement.querySelector('#ghost-ai-text');
      const providerLabel = this.previewElement.querySelector('#ghost-provider-label');

      originalTextEl.textContent = result.originalText;
      aiTextEl.textContent = result.text;
      providerLabel.textContent = `via ${result.provider || 'AI'}`;

      // Update credits display
      const creditsUsed = this.previewElement.querySelector('#ghost-credits-used');
      const metaRemaining = this.previewElement.querySelector('#ghost-meta-remaining');

      creditsUsed.style.display = 'flex';
      metaRemaining.textContent = `(${result.creditsRemaining} remaining)`;
    }

    // Show grammar errors if any
    if (result.grammarErrors && result.grammarErrors.length > 0) {
      grammarResultSection.style.display = 'block';

      const errorCount = this.previewElement.querySelector('#ghost-error-count');
      const errorList = this.previewElement.querySelector('#ghost-grammar-list');

      errorCount.textContent = `${result.grammarErrors.length} issue${result.grammarErrors.length !== 1 ? 's' : ''} found`;

      // Clear existing errors
      errorList.innerHTML = '';

      // Add error items
      result.grammarErrors.forEach(error => {
        const errorItem = this.createErrorItem(error);
        errorList.appendChild(errorItem);
      });
    } else if (action === 'grammar') {
      // Show "no issues" for grammar-only checks
      noIssuesSection.style.display = 'block';
    }

    // Show pipeline complete indicator for two-stage operations
    if (result.pipelineComplete) {
      pipelineComplete.style.display = 'flex';
    }

    // Store result for accept/reject
    this.currentResult = result;

    // Show preview
    this.previewElement.style.display = 'block';
  }

  /**
   * Create grammar error item element
   */
  createErrorItem(error) {
    const template = document.getElementById('ghost-error-item-template');
    const clone = template.content.cloneNode(true);

    const item = clone.querySelector('.ghost-error-item');
    const typeEl = clone.querySelector('.ghost-error-type');
    const wordEl = clone.querySelector('.ghost-error-word');
    const fixEl = clone.querySelector('.ghost-error-fix');
    const messageEl = clone.querySelector('.ghost-error-message');
    const applyBtn = clone.querySelector('.ghost-error-apply');

    // Assuming error format: { span: [start, end], message: "...", suggestion: "..." }
    const errorWord = this.selectedText.substring(error.span[0], error.span[1]);

    typeEl.textContent = error.type || 'Grammar';
    wordEl.textContent = errorWord;
    fixEl.textContent = error.suggestion || '';
    messageEl.textContent = error.message || '';

    // Apply button handler
    applyBtn.addEventListener('click', () => {
      // Apply this specific fix (future enhancement)
      console.log('[GhostWrite] Apply fix:', error);
    });

    return clone;
  }

  /**
   * Hide preview
   */
  hidePreview() {
    if (this.previewElement) {
      this.previewElement.style.display = 'none';
    }
  }

  /**
   * Accept changes and replace text
   */
  acceptChanges() {
    if (!this.currentResult || !this.selectionRange) return;

    try {
      // Replace selected text with improved text
      const range = this.selectionRange;
      range.deleteContents();
      range.insertNode(document.createTextNode(this.currentResult.text));

      // Clear selection
      window.getSelection().removeAllRanges();

      // Hide preview
      this.hidePreview();

      // Show success feedback (optional)
      this.showSuccess();

    } catch (error) {
      console.error('[GhostWrite] Failed to replace text:', error);
      this.showError('Failed to replace text');
    }
  }

  /**
   * Reject changes
   */
  rejectChanges() {
    this.hidePreview();
    this.currentResult = null;
  }

  /**
   * Show success message
   */
  showSuccess() {
    // Could implement a toast notification
    console.log('[GhostWrite] Changes applied successfully');
  }

  /**
   * Show error message
   */
  showError(message) {
    // Could implement error UI
    alert(`GhostWrite Error: ${message}`);
  }

  /**
   * Show upgrade prompt for locked features
   */
  showUpgradePrompt(action) {
    const message = `${action === 'humanize' ? 'Humanize' : 'Rewrite'} requires AI credits.\n\nGet 100 free credits to try it out!`;

    if (confirm(message)) {
      // Open upgrade page or popup
      chrome.runtime.sendMessage({ action: 'OPEN_UPGRADE' });
    }
  }

  /**
   * Update capability status from background
   */
  async updateCapabilityStatus() {
    chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (status) => {
      if (status) {
        this.updateUIState(status);
      }
    });
  }

  /**
   * Update UI based on capability status
   */
  updateUIState(status) {
    if (!status) return;

    this.currentMode = status.mode;
    this.credits = status.credits?.remaining || 0;

    // Update menu buttons
    this.updateMenuButtons(status);
  }

  /**
   * Update menu button states (locked/unlocked, badges)
   */
  updateMenuButtons(status) {
    if (!this.menuElement) return;

    const humanizeBtn = this.menuElement.querySelector('[data-action="humanize"]');
    const rewriteBtn = this.menuElement.querySelector('[data-action="rewrite"]');
    const creditsDisplay = this.menuElement.querySelector('.ghost-credits');
    const creditsCount = this.menuElement.querySelector('#ghost-credits-count');

    const aiEnabled = status.features?.humanize?.enabled || false;

    // Update humanize button
    if (humanizeBtn) {
      const lockedBadge = humanizeBtn.querySelector('.ghost-badge--locked');
      const trialBadge = humanizeBtn.querySelector('.ghost-badge--trial');

      if (aiEnabled) {
        humanizeBtn.classList.remove('locked');
        lockedBadge.style.display = 'none';

        if (status.credits?.tier === 'trial') {
          trialBadge.style.display = 'inline-flex';
        }
      } else {
        humanizeBtn.classList.add('locked');
        lockedBadge.style.display = 'inline-flex';
        trialBadge.style.display = 'none';
      }
    }

    // Update rewrite button (same logic)
    if (rewriteBtn) {
      const lockedBadge = rewriteBtn.querySelector('.ghost-badge--locked');
      const trialBadge = rewriteBtn.querySelector('.ghost-badge--trial');

      if (aiEnabled) {
        rewriteBtn.classList.remove('locked');
        lockedBadge.style.display = 'none';

        if (status.credits?.tier === 'trial') {
          trialBadge.style.display = 'inline-flex';
        }
      } else {
        rewriteBtn.classList.add('locked');
        lockedBadge.style.display = 'inline-flex';
        trialBadge.style.display = 'none';
      }
    }

    // Update credits display
    if (creditsDisplay && creditsCount) {
      if (aiEnabled) {
        creditsDisplay.style.display = 'flex';
        creditsCount.textContent = this.credits;
      } else {
        creditsDisplay.style.display = 'none';
      }
    }
  }
}

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new GhostWriteUI());
} else {
  new GhostWriteUI();
}
