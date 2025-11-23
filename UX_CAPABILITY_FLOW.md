# GhostWrite - Capability Detection UX Flow

## User Journey: Extension Load → Feature Availability

```
┌─────────────────────────────────────────────────────────────┐
│ EXTENSION INSTALLATION                                      │
│ User installs GhostWrite from Chrome Web Store             │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKGROUND INITIALIZATION (background.js)                   │
│ ┌──────────────────┐      ┌────────────────────┐           │
│ │ Load Harper WASM │      │ Check Cloud API    │           │
│ │   < 100ms        │      │     ~ 200ms        │           │
│ └────┬─────────────┘      └──────┬─────────────┘           │
│      │                            │                         │
│      ▼                            ▼                         │
│ ✅ Grammar Ready            ⚠️ Status Check                 │
└──────┬────────────────────────────┬─────────────────────────┘
       │                            │
       │    ┌───────────────────────┴────────────────────┐
       │    │                                            │
       │    ▼                                            ▼
       │  ┌────────────────────┐              ┌─────────────────────┐
       │  │ API Connected      │              │ API Error/Offline   │
       │  │ (Credits Available)│              │ (No Connection)     │
       │  │                    │              │                     │
       │  └────────┬───────────┘              └──────────┬──────────┘
       │           │                                     │
       │           ▼                                     ▼
       │  ┌──────────────────────┐           ┌─────────────────────┐
       │  │ MODE: Full Featured  │           │ MODE: Basic Grammar │
       │  │ Badge: "✨ READY"    │           │ Badge: "📝 BASIC"  │
       │  └──────────┬───────────┘           └──────────┬──────────┘
       │             │                                   │
       └─────────────┴───────────────┬───────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────────┐
                    │ USER SELECTS TEXT                  │
                    │ (Waits 400ms to filter copy/paste) │
                    └────────────────┬───────────────────┘
                                     │
                                     ▼
              ┌──────────────────────────────────────────┐
              │ GHOST MENU APPEARS                       │
              │ (Positioned near selection)              │
              └───────┬──────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────────┐    ┌──────────────────────┐
│ Full Featured     │    │ Basic Grammar Mode   │
├───────────────────┤    ├──────────────────────┤
│ 🎯 Fix Grammar    │    │ 🎯 Fix Grammar       │
│ ✨ Humanize       │    │ 📖 Check Spelling    │
│ ✍️  Rewrite       │    │ 💳 Get AI Features   │
│ 📋 Copy           │    │    (sign up)         │
└───────┬───────────┘    └──────────┬───────────┘
        │                           │
        │ User clicks "Humanize"    │ User clicks "Get AI Features"
        ▼                           ▼
┌──────────────────┐      ┌─────────────────────────┐
│ Cloud API        │      │ INFO POPUP:             │
│ Processing...    │      │ "AI features require    │
│ ~ 500ms-1s       │      │  API connection.        │
└────────┬─────────┘      │  Sign up for free       │
         │                │  credits. Learn more >" │
         ▼                └─────────────────────────┘
┌──────────────────┐
│ Show Result      │
│ ┌──────────────┐ │
│ │ Accept/Reject│ │
│ └──────────────┘ │
└──────────────────┘
```

---

## State Diagram: Capability Detection

```
                    ┌──────────────┐
                    │ EXTENSION    │
                    │  INSTALLED   │
                    └──────┬───────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Check Cloud API │
                  │ Connectivity    │
                  └────────┬────────┘
                           │
        ┏━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━┓
        ▼                                    ▼
┌──────────────────┐              ┌───────────────────┐
│ API Connected    │              │ API Offline or    │
│ Credits > 0      │              │ No Credits        │
│                  │              │                   │
└────────┬─────────┘              └──────────┬────────┘
         │                                   │
         ▼                                   ▼
┌────────────────────┐          ┌─────────────────────┐
│ STATE: AI_READY    │          │ STATE: BASIC_ONLY   │
│                    │          │                     │
│ Features:          │          │ Features:           │
│ ✅ Grammar (Harper)│          │ ✅ Grammar (Harper) │
│ ✅ Humanize (API)  │          │ ❌ Humanize         │
│ ✅ Rewrite (API)   │          │ ❌ Rewrite          │
│                    │          │ ℹ️  Sign up prompt  │
└────────┬───────────┘          └──────────┬──────────┘
         │                                 │
         └─────────┬───────────────────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Store state in  │
          │ chrome.storage  │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Update badge    │
          │ Update popup UI │
          └─────────────────┘
```

---

## User Touchpoints & Feedback Mechanisms

### 1. **Extension Badge** (Always Visible)
- **AI Mode**: Green badge with "✨ READY"
- **Basic Mode**: Gray badge with "📝 BASIC"
- **Error State**: Red badge with "⚠️"

### 2. **First-Time Experience** (On Install)
```
┌─────────────────────────────────────────┐
│ Welcome to GhostWrite! 👻               │
├─────────────────────────────────────────┤
│                                         │
│ ✅ Grammar checking: ACTIVE             │
│    Powered by Harper (local, unlimited) │
│                                         │
│ 🎁 AI features: FREE TRIAL              │
│    100 free credits to start!           │
│                                         │
│ [ Try AI Now ]  [Maybe Later]          │
└─────────────────────────────────────────┘
```

### 3. **Popup UI** (Click Extension Icon)

**AI Mode (With Credits):**
```
┌────────────────────────────┐
│ GhostWrite    [✨ AI Ready]│
├────────────────────────────┤
│ Status:                    │
│ ✅ Grammar (unlimited)     │
│ ✅ AI features (cloud)     │
│                            │
│ Credits: 847 remaining     │
│ [ Buy More Credits ]       │
│                            │
│ Usage:                     │
│ • Select text to start     │
│ • 400ms delay (customizable│
│                            │
│ [Settings] [Tutorial]      │
└────────────────────────────┘
```

**Basic Mode (No Credits/Offline):**
```
┌────────────────────────────┐
│ GhostWrite   [📝 BASIC Mode]│
├────────────────────────────┤
│ Status:                    │
│ ✅ Grammar (unlimited)     │
│ ⚠️  AI features disabled   │
│                            │
│ Get AI Features:           │
│ • 100 free credits         │
│ • $5-10 for 1000 credits   │
│                            │
│ [ Sign Up Free ]  [Later] │
└────────────────────────────┘
```

### 4. **In-Context Education** (When User Tries AI Feature)

If user in Basic Mode clicks where "Humanize" would be:
```
┌─────────────────────────────────────┐
│ ✨ AI Feature Not Available         │
├─────────────────────────────────────┤
│ AI features require cloud API       │
│ connection (Gemini or OpenAI).      │
│                                     │
│ Get started:                        │
│ 🎁 100 FREE credits to try          │
│ 💰 1000 credits for $5-10/month     │
│                                     │
│ Privacy: Your text stays encrypted  │
│                                     │
│ [ Get Free Credits ]  [Maybe Later] │
└─────────────────────────────────────┘
```

---

## Edge Cases & Error Handling

### Case 1: API Rate Limit Reached
```javascript
// Response: 429 Too Many Requests
// Show: "API rate limit reached. Try again in 30s"
// Fallback: Queue requests or show retry timer
```

### Case 2: Harper WASM Fails to Load
```javascript
// Fallback: Disable grammar checking entirely
// Show error badge
// Popup message: "Grammar checking unavailable. Try reinstalling extension."
```

### Case 3: Network Offline
```javascript
// Detect: !navigator.onLine
// Show: "Offline mode - Grammar checking only"
// Cache: Queue AI requests for when connection restored
```

### Case 4: Credits Depleted Mid-Session
```javascript
// Show notification: "⚠️ Credits running low (10 remaining)"
// When 0: "Credits depleted. Buy more to continue using AI features"
// Auto-downgrade UI to Basic Mode
```

### Case 5: API Fallback (Gemini → OpenAI)
```javascript
// Primary: Gemini API fails
// Fallback: Automatically try OpenAI API
// Log: Track which API used for analytics
// User feedback: Transparent about which service processing request
```

### Case 6: API Service Outage
```javascript
// Both Gemini and OpenAI unavailable
// Show: "AI services temporarily unavailable. Grammar checking still works!"
// Retry: Exponential backoff (5s, 15s, 45s)
```

---

## Performance Metrics

| Action | Target Time | User Feedback |
|--------|-------------|---------------|
| API connectivity check | < 200ms | Extension badge updates |
| Harper load | < 100ms | "Grammar ready" in popup |
| Cloud API initialization | < 500ms | "AI ready" badge |
| Menu appearance | < 100ms after 400ms delay | Smooth fade-in animation |
| Grammar check | < 50ms | Instant red/green squiggles |
| AI humanization (Gemini) | < 1s | Loading spinner with progress |
| AI humanization (OpenAI fallback) | < 2s | "Using backup service..." |

---

## API Architecture

### Primary: Gemini API
- **Purpose**: Main AI processing (humanize, rewrite, etc.)
- **Advantages**: Fast response times, cost-effective
- **Rate Limits**: Monitor and handle gracefully

### Secondary: OpenAI API
- **Purpose**: Fallback when Gemini unavailable
- **Use Cases**: Service outages, rate limit exceeded
- **Failover**: Automatic, transparent to user

### Credit System
- **Free Tier**: 100 credits on sign-up
- **Paid Tier**: 1000 credits for $5-10/month
- **Usage**: Each AI action (humanize, rewrite) costs 1 credit
- **Storage**: Credits tracked server-side, synced to extension

---

## Accessibility Considerations

1. **Keyboard Navigation**: All menu items accessible via Tab/Enter
2. **Screen Readers**: Announce capability status changes and credit balance
3. **High Contrast**: Ensure badge colors visible in all themes
4. **Motion Sensitivity**: Respect `prefers-reduced-motion` for animations
5. **Network Indicators**: Clear visual feedback for API processing states

---

## Testing Checklist

- [ ] Fresh install with no API credentials (expect Basic Mode)
- [ ] Fresh install with valid API credentials (expect AI Mode)
- [ ] Test with Harper WASM blocked by CSP
- [ ] Test on slow network (Harper bundle download)
- [ ] Test badge visibility in light/dark theme
- [ ] Test API connectivity failure scenarios
- [ ] Test graceful degradation (Gemini fails → OpenAI fallback)
- [ ] Test credit depletion workflow
- [ ] Test offline mode (grammar only)
- [ ] Test rate limit handling
- [ ] Test both Gemini and OpenAI API failures

---

## Privacy & Security Notes

- **Grammar Checking**: 100% local via Harper WASM (no data sent)
- **AI Features**: Text sent to cloud APIs (Gemini/OpenAI) encrypted in transit
- **User Control**: Clear opt-in for cloud features
- **Data Retention**: No persistent storage of user text on servers
- **Transparency**: Always indicate when cloud processing occurs

---

*Last Updated: 2025-11-23*
