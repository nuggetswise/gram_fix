/**
 * GhostWrite Popup Script
 * Manages the extension popup UI and displays capability status
 */

class GhostWritePopup {
  constructor() {
    this.status = null;
    this.init();
  }

  /**
   * Initialize popup
   */
  async init() {
    console.log('[GhostWrite Popup] Initializing...');

    // Get capability status from background
    await this.fetchStatus();

    // Set up event listeners
    this.setupEventListeners();

    // Update UI
    this.updateUI();
  }

  /**
   * Fetch capability status from background script
   */
  async fetchStatus() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
        if (response) {
          this.status = response;
          console.log('[GhostWrite Popup] Status:', this.status);
        }
        resolve();
      });
    });
  }

  /**
   * Set up event listeners for buttons
   */
  setupEventListeners() {
    // Upgrade button
    const upgradeButton = document.getElementById('upgrade-button');
    upgradeButton?.addEventListener('click', () => this.handleUpgrade());

    // Settings button
    const settingsButton = document.getElementById('settings-button');
    settingsButton?.addEventListener('click', () => this.openSettings());

    // Keyboard shortcuts button
    const keyboardButton = document.getElementById('keyboard-button');
    keyboardButton?.addEventListener('click', () => this.openKeyboardShortcuts());

    // Billing button
    const billingButton = document.getElementById('billing-button');
    billingButton?.addEventListener('click', () => this.openBilling());

    // Footer links
    const helpLink = document.getElementById('help-link');
    helpLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openHelp();
    });

    const privacyLink = document.getElementById('privacy-link');
    privacyLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openPrivacy();
    });

    // Listen for status updates
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'CAPABILITY_UPDATE') {
        this.status = message.status;
        this.updateUI();
      }
    });
  }

  /**
   * Update all UI elements based on current status
   */
  updateUI() {
    if (!this.status) {
      console.warn('[GhostWrite Popup] No status available');
      return;
    }

    this.updateStatusBadge();
    this.updateFeatureStatuses();
    this.updateCreditsSection();
    this.updateUpgradeSection();
  }

  /**
   * Update the status badge in the header
   */
  updateStatusBadge() {
    const badge = document.getElementById('ghost-status-badge');
    if (!badge) return;

    const badgeIcon = badge.querySelector('.ghost-badge-icon');
    const badgeText = badge.querySelector('.ghost-badge-text');

    // Remove all status classes
    badge.classList.remove('ai-ready', 'basic-only', 'error');

    const modeConfig = {
      'AI_READY': {
        icon: '✨',
        text: 'AI Ready',
        class: 'ai-ready'
      },
      'BASIC_ONLY': {
        icon: '📝',
        text: 'Basic Mode',
        class: 'basic-only'
      },
      'ERROR': {
        icon: '⚠️',
        text: 'Error',
        class: 'error'
      },
      'INITIALIZING': {
        icon: '⏳',
        text: 'Loading...',
        class: ''
      }
    };

    const config = modeConfig[this.status.mode] || modeConfig['INITIALIZING'];

    badgeIcon.textContent = config.icon;
    badgeText.textContent = config.text;

    if (config.class) {
      badge.classList.add(config.class);
    }
  }

  /**
   * Update feature status indicators
   */
  updateFeatureStatuses() {
    // Grammar feature
    this.updateFeature(
      'grammar',
      this.status.features?.grammar
    );

    // Humanize feature
    this.updateFeature(
      'humanize',
      this.status.features?.humanize
    );

    // Rewrite feature
    this.updateFeature(
      'rewrite',
      this.status.features?.rewrite
    );
  }

  /**
   * Update individual feature status
   */
  updateFeature(featureName, featureData) {
    const statusElement = document.getElementById(`${featureName}-status`);
    const indicatorElement = document.getElementById(`${featureName}-indicator`);

    if (!statusElement || !indicatorElement) return;

    if (featureData?.enabled) {
      statusElement.textContent = featureData.detail || 'Ready';
      statusElement.style.color = 'var(--ghost-success-text)';
      indicatorElement.innerHTML = '<span style="color: var(--ghost-success);">✓</span>';
    } else {
      statusElement.textContent = featureData?.detail || 'Disabled';
      statusElement.style.color = 'var(--ghost-text-tertiary)';
      indicatorElement.innerHTML = '<span style="color: var(--ghost-text-tertiary);">○</span>';
    }
  }

  /**
   * Update credits section
   */
  updateCreditsSection() {
    const creditsSection = document.getElementById('credits-section');
    const creditsRemaining = document.getElementById('credits-remaining');
    const creditsTier = document.getElementById('credits-tier');
    const creditsFill = document.getElementById('credits-fill');

    if (!creditsSection) return;

    const credits = this.status.credits?.remaining || 0;
    const tier = this.status.credits?.tier || 'free';

    if (credits > 0 || tier !== 'free') {
      // Show credits section
      creditsSection.style.display = 'block';

      creditsRemaining.textContent = credits;

      // Update tier badge
      const tierLabels = {
        'free': 'Free Tier',
        'trial': 'Trial',
        'paid': 'Pro'
      };
      creditsTier.textContent = tierLabels[tier] || 'Free Tier';

      // Update progress bar
      const maxCredits = tier === 'trial' ? 100 : (tier === 'paid' ? 1000 : 0);
      const percentage = maxCredits > 0 ? (credits / maxCredits) * 100 : 0;
      creditsFill.style.width = `${percentage}%`;

      // Change color based on remaining credits
      if (percentage < 20) {
        creditsFill.style.background = 'linear-gradient(90deg, var(--ghost-error), var(--ghost-warning))';
      } else if (percentage < 50) {
        creditsFill.style.background = 'linear-gradient(90deg, var(--ghost-warning), var(--ghost-accent))';
      } else {
        creditsFill.style.background = 'linear-gradient(90deg, var(--ghost-accent), var(--ghost-accent-hover))';
      }
    } else {
      // Hide credits section if no credits
      creditsSection.style.display = 'none';
    }
  }

  /**
   * Update upgrade prompt section
   */
  updateUpgradeSection() {
    const upgradeSection = document.getElementById('upgrade-section');
    const upgradeTitle = document.getElementById('upgrade-title');
    const upgradeMessage = document.getElementById('upgrade-message');
    const upgradeButtonText = document.getElementById('upgrade-button-text');

    if (!upgradeSection) return;

    const upgradePrompt = this.status.upgradePrompt;

    if (upgradePrompt) {
      // Show upgrade section
      upgradeSection.style.display = 'block';

      upgradeTitle.textContent = upgradePrompt.title;
      upgradeMessage.textContent = upgradePrompt.message;

      const buttonLabels = {
        'SIGN_UP': 'Get Free Credits',
        'BUY_CREDITS': 'Buy More Credits'
      };

      upgradeButtonText.textContent = buttonLabels[upgradePrompt.action] || 'Upgrade';
    } else {
      // Hide upgrade section
      upgradeSection.style.display = 'none';
    }

    // Show/hide billing button based on tier
    const billingButton = document.getElementById('billing-button');
    if (billingButton) {
      const tier = this.status.credits?.tier;
      billingButton.style.display = (tier === 'paid' || tier === 'trial') ? 'block' : 'none';
    }
  }

  /**
   * Handle upgrade button click
   */
  handleUpgrade() {
    const action = this.status.upgradePrompt?.action;

    if (action === 'SIGN_UP') {
      // Open sign-up page
      chrome.tabs.create({
        url: 'https://your-website.com/signup'  // TODO: Replace with actual URL
      });
    } else if (action === 'BUY_CREDITS') {
      // Open billing page
      chrome.tabs.create({
        url: 'https://your-website.com/billing'  // TODO: Replace with actual URL
      });
    }
  }

  /**
   * Open settings page
   */
  openSettings() {
    chrome.runtime.openOptionsPage();
  }

  /**
   * Open keyboard shortcuts page
   */
  openKeyboardShortcuts() {
    chrome.tabs.create({
      url: 'chrome://extensions/shortcuts'
    });
  }

  /**
   * Open billing portal
   */
  openBilling() {
    chrome.tabs.create({
      url: 'https://your-website.com/billing'  // TODO: Replace with actual URL
    });
  }

  /**
   * Open help page
   */
  openHelp() {
    chrome.tabs.create({
      url: 'https://your-website.com/help'  // TODO: Replace with actual URL
    });
  }

  /**
   * Open privacy policy
   */
  openPrivacy() {
    chrome.tabs.create({
      url: 'https://your-website.com/privacy'  // TODO: Replace with actual URL
    });
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new GhostWritePopup();
});
