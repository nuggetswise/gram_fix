/**
 * GhostWrite Background Service Worker
 * Manages capability detection, API communication, and message handling
 */

// Import CapabilityManager
importScripts('capability-manager.js');

// Initialize capability manager
const capabilityManager = new CapabilityManager();

// Initialize on extension install/startup
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[GhostWrite] Extension installed/updated:', details.reason);
  await capabilityManager.initialize();

  // Show welcome notification on first install
  if (details.reason === 'install') {
    console.log('[GhostWrite] First install - showing welcome');
  }
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('[GhostWrite] Extension started');
  await capabilityManager.initialize();
});

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle async operations
  (async () => {
    try {
      switch (message.action) {
        case 'GET_STATUS':
          // Return capability status for UI
          const status = capabilityManager.getStatusForUI();
          sendResponse(status);
          break;

        case 'CHECK_GRAMMAR':
          // Grammar check only (free tier)
          const grammarErrors = await capabilityManager.checkGrammar(message.text);
          sendResponse({
            success: true,
            errors: grammarErrors
          });
          break;

        case 'HUMANIZE_TEXT':
          // Two-stage pipeline: AI humanize → Grammar check
          try {
            const humanizeResult = await capabilityManager.humanizeText(message.text);
            sendResponse({
              success: true,
              text: humanizeResult.text,
              grammarErrors: humanizeResult.grammarErrors,
              provider: humanizeResult.provider,
              creditsRemaining: humanizeResult.creditsRemaining,
              pipelineComplete: humanizeResult.pipelineComplete
            });
          } catch (error) {
            sendResponse({
              success: false,
              error: error.message
            });
          }
          break;

        case 'REWRITE_TEXT':
          // Two-stage pipeline: AI rewrite → Grammar check
          try {
            const rewriteResult = await capabilityManager.rewriteText(message.text);
            sendResponse({
              success: true,
              text: rewriteResult.text,
              grammarErrors: rewriteResult.grammarErrors,
              provider: rewriteResult.provider,
              creditsRemaining: rewriteResult.creditsRemaining,
              pipelineComplete: rewriteResult.pipelineComplete
            });
          } catch (error) {
            sendResponse({
              success: false,
              error: error.message
            });
          }
          break;

        case 'SAVE_API_KEY':
          // Save user's API key
          await capabilityManager.saveAPIKey(message.apiKey);
          sendResponse({ success: true });
          break;

        case 'RECHECK_API':
          // Manually recheck API availability
          await capabilityManager.recheckCloudAPI();
          const updatedStatus = capabilityManager.getStatusForUI();
          sendResponse(updatedStatus);
          break;

        case 'OPEN_UPGRADE':
          // Open upgrade page
          chrome.tabs.create({
            url: 'https://ghostwrite.example.com/signup'  // TODO: Replace with actual URL
          });
          sendResponse({ success: true });
          break;

        default:
          sendResponse({
            success: false,
            error: 'Unknown action: ' + message.action
          });
      }
    } catch (error) {
      console.error('[GhostWrite Background] Error handling message:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  })();

  // Return true to indicate async response
  return true;
});

/**
 * Broadcast capability updates to all tabs
 */
function broadcastCapabilityUpdate() {
  const status = capabilityManager.getStatusForUI();

  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'CAPABILITY_UPDATE',
        status: status
      }).catch(() => {
        // Ignore errors for tabs without content script
      });
    });
  });
}

/**
 * Listen for capability state changes
 */
capabilityManager.addListener((status) => {
  console.log('[GhostWrite Background] Capability status changed:', status);
  broadcastCapabilityUpdate();
});

/**
 * Periodic credit check (every 5 minutes)
 */
setInterval(async () => {
  if (capabilityManager.state.cloudAPI.connected) {
    await capabilityManager.recheckCloudAPI();
  }
}, 5 * 60 * 1000);

/**
 * Show low credits warning
 */
capabilityManager.addListener((status) => {
  if (status.credits?.remaining <= 10 && status.credits?.remaining > 0) {
    capabilityManager.showLowCreditsWarning();
  }
});

console.log('[GhostWrite Background] Service worker loaded');
