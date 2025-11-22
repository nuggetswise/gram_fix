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
│ │ Load Harper WASM │      │ Check Gemini Nano  │           │
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
       │  │ Gemini Nano Ready  │              │ Gemini Nano Missing │
       │  │ (Chrome Canary     │              │ (Stable Chrome or   │
       │  │  or Dev Channel)   │              │  not enabled)       │
       │  └────────┬───────────┘              └──────────┬──────────┘
       │           │                                     │
       │           ▼                                     ▼
       │  ┌──────────────────────┐           ┌─────────────────────┐
       │  │ MODE: AI Enhanced    │           │ MODE: Basic Grammar │
       │  │ Badge: "✨ AI"       │           │ Badge: "📝 BASIC"  │
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
│ AI Enhanced Mode  │    │ Basic Grammar Mode   │
├───────────────────┤    ├──────────────────────┤
│ 🎯 Fix Grammar    │    │ 🎯 Fix Grammar       │
│ ✨ Humanize       │    │ 📖 Check Spelling    │
│ ✍️  Rewrite       │    │ ⚙️  Enable AI        │
│ 📋 Copy           │    │    (upgrade Chrome)  │
└───────┬───────────┘    └──────────┬───────────┘
        │                           │
        │ User clicks "Humanize"    │ User clicks "Enable AI"
        ▼                           ▼
┌──────────────────┐      ┌─────────────────────────┐
│ Gemini Nano      │      │ INFO POPUP:             │
│ Processing...    │      │ "AI features require    │
│ ~ 500ms          │      │  Chrome Canary/Dev      │
└────────┬─────────┘      │  with Gemini Nano       │
         │                │  enabled. Learn more >" │
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
                  │ Check Gemini    │
                  │ Nano API        │
                  └────────┬────────┘
                           │
        ┏━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━┓
        ▼                                    ▼
┌──────────────────┐              ┌───────────────────┐
│ capabilities =   │              │ capabilities =    │
│  'readily'       │              │  'no' or          │
│                  │              │  'after-download' │
└────────┬─────────┘              └──────────┬────────┘
         │                                   │
         ▼                                   ▼
┌────────────────────┐          ┌─────────────────────┐
│ STATE: AI_READY    │          │ STATE: BASIC_ONLY   │
│                    │          │                     │
│ Features:          │          │ Features:           │
│ ✅ Grammar (Harper)│          │ ✅ Grammar (Harper) │
│ ✅ Humanize (Nano) │          │ ❌ Humanize         │
│ ✅ Rewrite (Nano)  │          │ ❌ Rewrite          │
│                    │          │ ℹ️  Upgrade prompt  │
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
- **AI Mode**: Green badge with "✨ AI"
- **Basic Mode**: Gray badge with "📝 BASIC"
- **Error State**: Red badge with "⚠️"

### 2. **First-Time Experience** (On Install)
```
┌─────────────────────────────────────────┐
│ Welcome to GhostWrite! 👻               │
├─────────────────────────────────────────┤
│                                         │
│ ✅ Grammar checking: ACTIVE             │
│    Powered by Harper (local)            │
│                                         │
│ ⚠️  AI features: NOT AVAILABLE          │
│    Requires Chrome Canary/Dev           │
│                                         │
│ [ Learn How to Enable AI ]  [Got It]   │
└─────────────────────────────────────────┘
```

### 3. **Popup UI** (Click Extension Icon)

**AI Mode:**
```
┌────────────────────────────┐
│ GhostWrite     [✨ AI Mode]│
├────────────────────────────┤
│ Status:                    │
│ ✅ Grammar checking        │
│ ✅ AI humanization         │
│                            │
│ Usage:                     │
│ • Select text to start     │
│ • 400ms delay (customizable│
│                            │
│ [Settings] [Tutorial]      │
└────────────────────────────┘
```

**Basic Mode:**
```
┌────────────────────────────┐
│ GhostWrite   [📝 BASIC Mode]│
├────────────────────────────┤
│ Status:                    │
│ ✅ Grammar checking        │
│ ⚠️  AI features disabled   │
│                            │
│ AI requires Chrome Canary  │
│ with Gemini Nano enabled   │
│                            │
│ [Setup Guide] [Got It]     │
└────────────────────────────┘
```

### 4. **In-Context Education** (When User Tries AI Feature)

If user in Basic Mode clicks where "Humanize" would be:
```
┌─────────────────────────────────────┐
│ ✨ AI Feature Not Available         │
├─────────────────────────────────────┤
│ This requires Gemini Nano.          │
│                                     │
│ Setup (1 min):                      │
│ 1. Install Chrome Canary            │
│ 2. Enable AI flags                  │
│ 3. Restart browser                  │
│                                     │
│ [Step-by-Step Guide]  [Maybe Later] │
└─────────────────────────────────────┘
```

---

## Edge Cases & Error Handling

### Case 1: Gemini Nano Downloads in Background
```javascript
capabilities.available === 'after-download'
// Show: "AI features downloading... (may take 5-10 min)"
// Poll every 30s until ready
```

### Case 2: Harper WASM Fails to Load
```javascript
// Fallback: Disable grammar checking entirely
// Show error badge
// Popup message: "Grammar checking unavailable. Try reinstalling extension."
```

### Case 3: User on Unsupported Browser (Firefox, Safari)
```javascript
// Detect: !chrome || !chrome.runtime
// Show: "GhostWrite requires Chrome/Edge/Brave"
// Offer: Download link to Chrome Canary
```

### Case 4: Mid-Session Capability Change
```javascript
// Listen for Gemini Nano becoming available
// Auto-upgrade UI from Basic → AI mode
// Show celebration toast: "🎉 AI features now available!"
```

---

## Performance Metrics

| Action | Target Time | User Feedback |
|--------|-------------|---------------|
| Capability check | < 200ms | Extension badge updates |
| Harper load | < 100ms | "Grammar ready" in popup |
| Gemini Nano init | < 1s | "AI ready" badge |
| Menu appearance | < 100ms after 400ms delay | Smooth fade-in animation |
| Grammar check | < 50ms | Instant red/green squiggles |
| AI humanization | < 1s | Loading spinner |

---

## Accessibility Considerations

1. **Keyboard Navigation**: All menu items accessible via Tab/Enter
2. **Screen Readers**: Announce capability status changes
3. **High Contrast**: Ensure badge colors visible in all themes
4. **Motion Sensitivity**: Respect `prefers-reduced-motion` for animations

---

## Testing Checklist

- [ ] Fresh install on Chrome Stable (expect Basic Mode)
- [ ] Fresh install on Chrome Canary with Gemini Nano (expect AI Mode)
- [ ] Toggle Gemini Nano flags while extension running
- [ ] Test with Harper WASM blocked by CSP
- [ ] Test on slow network (Harper bundle download)
- [ ] Test badge visibility in light/dark theme
- [ ] Test popup UI with window.ai = undefined
- [ ] Test graceful degradation (AI → Basic after API error)

---

*Last Updated: 2025-11-22*
