# GhostWrite Implementation Plan

## Project Overview
A privacy-first Chrome extension that provides instant grammar checking and AI-powered text humanization, competing with Grammarly/Wordtune while running 100% locally.

---

## Architecture: Hybrid Stack

### Layer 1: Fast Grammar (Harper WASM)
- **Purpose**: Instant red/green squiggles for grammar errors
- **Speed**: Milliseconds (< 50ms)
- **Technology**: Harper WASM binary
- **Trigger**: Every keystroke

### Layer 2: AI Enhancement (Gemini Nano)
- **Purpose**: "Humanize", "Rewrite", "Fix Complex Sentences"
- **Speed**: ~500ms
- **Technology**: Chrome Built-in AI (`window.ai`)
- **Trigger**: User selection + button click

### Layer 3: Fallback (Heuristics)
- **Purpose**: Basic de-AI when Gemini Nano unavailable
- **Speed**: Instant
- **Technology**: Simple word replacement dictionary
- **Trigger**: When `window.ai` not available

---

## Harper Repository Findings

### What We Can Repurpose:
1. **harper.js** - Official JavaScript/WASM binding available via NPM
2. **Pre-built WASM binaries** - Available in GitHub releases
3. **Browser-ready** - Already proven at writewithharper.com
4. **Lightweight** - Uses 1/50th of LanguageTool's memory
5. **Privacy-first** - Runs 100% offline, no data transmission
6. **Examples directory** - Contains web integration samples

### Integration Path:
```bash
npm install harper.js
```

Instead of manually downloading WASM, we can use the official NPM package which includes:
- TypeScript definitions
- WASM binary bundled
- Browser-optimized API
- Examples for web integration

---

## Implementation Phases

### Phase 1: Project Setup ✓
**Goal**: Initialize Chrome extension structure

**Files to Create**:
- [ ] `manifest.json` - Extension configuration
- [ ] `package.json` - NPM dependencies (harper.js)
- [ ] `.gitignore` - Exclude node_modules, dist
- [ ] `README.md` - Setup and usage instructions

**Key Configuration**:
- Manifest V3
- Content Security Policy for WASM
- Side panel permissions
- Active tab permissions

---

### Phase 2: Harper Integration
**Goal**: Install and configure Harper.js for instant grammar checking

**Tasks**:
- [ ] Install `harper.js` via NPM
- [ ] Create build script to bundle WASM
- [ ] Implement grammar check API wrapper
- [ ] Test WASM loading in extension context
- [ ] Create error highlighting system

**Technical Details**:
```javascript
// Expected API usage (to be confirmed from harper.js docs)
import { Harper } from 'harper.js';

const checker = await Harper.init();
const errors = await checker.lint(text);
// errors: [{ span: [start, end], message: "...", ... }]
```

**Deliverable**: Background service that returns grammar errors in < 50ms

---

### Phase 3: Gemini Nano Integration
**Goal**: Connect Chrome's built-in AI for humanization features

**Tasks**:
- [ ] Implement `humanizeText()` function using `window.ai`
- [ ] Configure system prompt for de-AI rewriting
- [ ] Add session management (create/destroy)
- [ ] Implement capability detection
- [ ] Create fallback to heuristic mode

**System Prompt**:
```
You are a professional editor. Rewrite the following text to sound more
human and less robotic. Remove jargon like 'delve', 'leverage', 'tapestry'.
Keep the meaning identical.
```

**Deliverable**: Background service that humanizes text in ~500ms

---

### Phase 4: Heuristic Fallback
**Goal**: Provide basic de-AI without requiring Gemini Nano

**Tasks**:
- [ ] Create AI word dictionary (delve→dig, leverage→use, etc.)
- [ ] Implement pattern matching replacements
- [ ] Add passive voice detection (optional)
- [ ] Test fallback accuracy

**Dictionary** (expandable):
- delve → dig
- leverage → use
- utilize → use
- tapestry → mix
- underscore → highlight
- testament → proof
- foster → build

**Deliverable**: Instant text improvement when AI unavailable

---

### Phase 5: Content Script (Ghost Mode UI)
**Goal**: Inject floating menu that appears on text selection

**Tasks**:
- [ ] Implement selection detection
- [ ] Add 600ms delay (avoid false triggers on copy/paste)
- [ ] Create floating button menu
- [ ] Position menu near selection
- [ ] Wire up button actions (Humanize, Fix Grammar, Rewrite)
- [ ] Add visual feedback (loading states)

**UX Flow** (General):
1. User selects text
2. Waits 600ms (filters out quick copy actions)
3. Floating menu appears near selection
4. User clicks "Humanize" or "Fix Grammar"
5. Extension processes text
6. Replacement text appears with "Accept/Reject" option

**Deliverable**: Non-intrusive UI that feels premium

---

### Detailed Rewrite Flow

**End-to-End User Journey**:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ACTION: Text Selection                             │
│    User highlights text on any webpage                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CONTENT SCRIPT: Selection Detection                      │
│    • document.addEventListener('selectionchange')            │
│    • Capture selection range & text                         │
│    • Start 600ms debounce timer                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ (after 600ms)
┌─────────────────────────────────────────────────────────────┐
│ 3. CONTENT SCRIPT: Show Ghost Menu                          │
│    • Calculate selection bounding box                        │
│    • Position floating menu near selection                   │
│    • Display buttons: [Fix Grammar] [Humanize] [Rewrite]    │
│    • Store reference to original selection range            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ User clicks "Rewrite"
┌─────────────────────────────────────────────────────────────┐
│ 4. CONTENT SCRIPT: Send Message to Background               │
│    chrome.runtime.sendMessage({                             │
│      action: "REWRITE",                                      │
│      text: selectedText,                                     │
│      context: "user-requested"                              │
│    })                                                        │
│    • Show loading spinner on button                         │
│    • Disable all menu buttons                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. BACKGROUND SERVICE: Receive Message                      │
│    • Validate message action === "REWRITE"                  │
│    • Check Gemini Nano availability                         │
│    • Route to appropriate handler                           │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌─────────────────────┐
│ 6a. AI PATH      │    │ 6b. FALLBACK PATH   │
│ (Gemini Nano)    │    │ (Heuristics)        │
├──────────────────┤    ├─────────────────────┤
│ • Create session │    │ • Apply word dict   │
│ • Send prompt    │    │ • Pattern matching  │
│ • Get response   │    │ • Return instantly  │
│ • ~500ms         │    │ • <10ms             │
└────────┬─────────┘    └──────────┬──────────┘
         │                         │
         └────────────┬────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. BACKGROUND SERVICE: Return Result                        │
│    chrome.runtime.sendMessage(tabId, {                      │
│      success: true,                                          │
│      original: selectedText,                                 │
│      rewritten: newText,                                     │
│      method: "gemini-nano" | "heuristic"                    │
│    })                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. CONTENT SCRIPT: Show Preview                             │
│    • Hide loading spinner                                    │
│    • Create preview overlay near selection                   │
│    • Show diff view (optional):                             │
│      - Strikethrough original text                          │
│      - Green highlight new text                             │
│    • Display buttons: [✓ Accept] [✗ Reject] [↻ Retry]      │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌─────────────────────┐
│ 9a. ACCEPT       │    │ 9b. REJECT          │
├──────────────────┤    ├─────────────────────┤
│ • Delete range   │    │ • Close preview     │
│ • Insert new txt │    │ • Restore selection │
│ • Fade out menu  │    │ • Keep original     │
│ • Track action   │    │ • Fade out menu     │
└──────────────────┘    └─────────────────────┘
```

**Technical Implementation Details**:

**Content Script** (`content.js`):
```javascript
let selectionRange = null;
let ghostMenu = null;

// Step 2: Detect selection
document.addEventListener('selectionchange', debounce(() => {
  const selection = window.getSelection();
  if (selection.toString().length > 0) {
    selectionRange = selection.getRangeAt(0);
    showGhostMenu(selection);
  }
}, 600));

// Step 3: Show menu
function showGhostMenu(selection) {
  const rect = selection.getRangeAt(0).getBoundingClientRect();
  ghostMenu = createFloatingMenu(rect);
  document.body.appendChild(ghostMenu);
}

// Step 4: Handle rewrite click
async function handleRewriteClick() {
  const selectedText = selectionRange.toString();
  showLoadingState();

  const response = await chrome.runtime.sendMessage({
    action: "REWRITE",
    text: selectedText
  });

  showPreview(response);
}

// Step 8: Show preview
function showPreview({ original, rewritten, method }) {
  const previewUI = createPreviewOverlay(rewritten);
  previewUI.innerHTML = `
    <div class="ghostwrite-preview">
      <div class="diff">
        <span class="original">${original}</span>
        <span class="arrow">→</span>
        <span class="rewritten">${rewritten}</span>
      </div>
      <div class="actions">
        <button onclick="acceptRewrite()">✓ Accept</button>
        <button onclick="rejectRewrite()">✗ Reject</button>
      </div>
      <div class="meta">via ${method}</div>
    </div>
  `;
}

// Step 9a: Accept
function acceptRewrite() {
  selectionRange.deleteContents();
  selectionRange.insertNode(document.createTextNode(rewrittenText));
  closePreview();
}
```

**Background Service** (`background.js`):
```javascript
let geminiSession = null;

// Step 5: Message router
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "REWRITE") {
    handleRewrite(message.text).then(sendResponse);
    return true; // async response
  }
});

// Step 6a/6b: Process rewrite
async function handleRewrite(text) {
  try {
    // Try AI path first
    if (await isGeminiNanoAvailable()) {
      const rewritten = await rewriteWithAI(text);
      return {
        success: true,
        original: text,
        rewritten,
        method: "gemini-nano"
      };
    }
  } catch (error) {
    console.warn("AI failed, using heuristics:", error);
  }

  // Fallback to heuristics
  const rewritten = rewriteWithHeuristics(text);
  return {
    success: true,
    original: text,
    rewritten,
    method: "heuristic"
  };
}

// AI implementation
async function rewriteWithAI(text) {
  if (!geminiSession) {
    geminiSession = await window.ai.createTextSession({
      systemPrompt: "Rewrite this text to sound more natural and human. Remove AI jargon like 'delve', 'leverage', 'tapestry'. Keep the meaning identical."
    });
  }

  return await geminiSession.prompt(text);
}

// Heuristic fallback
function rewriteWithHeuristics(text) {
  const replacements = {
    'delve into': 'explore',
    'leverage': 'use',
    'utilize': 'use',
    'tapestry of': 'mix of',
    'underscore': 'highlight'
  };

  let result = text;
  for (const [old, new] of Object.entries(replacements)) {
    result = result.replace(new RegExp(old, 'gi'), new);
  }
  return result;
}
```

**Performance Benchmarks**:
- **Step 2** (Selection detection): < 10ms
- **Step 3** (Menu render): < 100ms
- **Step 6a** (AI rewrite): 300-800ms
- **Step 6b** (Heuristic): < 10ms
- **Step 8** (Preview render): < 50ms
- **Step 9a** (DOM update): < 20ms

**Error Handling**:
- **Network timeout** (AI): Fall back to heuristics after 3s
- **Session creation fails**: Show error, offer retry
- **Invalid selection** (disappeared): Show "Selection lost, please try again"
- **DOM manipulation blocked**: Log error, show notification

**Analytics Events** (Privacy-safe, no text content):
```javascript
{
  event: "rewrite_success",
  method: "gemini-nano",
  text_length: 156,
  latency_ms: 487
}
```

---

### Phase 6: Liquid Design System
**Goal**: Create high-end visual design matching Linear/Vercel aesthetic

**Tasks**:
- [ ] Implement glassmorphic buttons (backdrop-blur)
- [ ] Add smooth animations (opacity, transform)
- [ ] Create color system (neutral palette)
- [ ] Add hover states with glow effects
- [ ] Ensure dark mode compatibility
- [ ] Test across different websites

**Design Principles**:
- Minimal footprint
- Blurred backgrounds
- Subtle shadows
- Fast transitions (200ms)
- High contrast for readability

**Deliverable**: CSS file with professional, modern styling

---

### Phase 7: Settings & Popup
**Goal**: Simple configuration UI for BYOK (Bring Your Own Key)

**Tasks**:
- [ ] Create `popup.html` with settings form
- [ ] Add API key input (for future external AI fallback)
- [ ] Add enable/disable toggle
- [ ] Show Harper status (loaded/error)
- [ ] Show Gemini Nano availability
- [ ] Add keyboard shortcut configuration

**Settings Storage**:
```javascript
chrome.storage.sync.set({
  enabled: true,
  apiKey: '',
  keyboardShortcut: 'Ctrl+Shift+H'
});
```

**Deliverable**: Clean settings interface

---

### Phase 8: Background Service (Brain)
**Goal**: Central coordinator for Harper + Gemini Nano

**Tasks**:
- [ ] Create `background.js` service worker
- [ ] Load Harper WASM on extension startup
- [ ] Initialize Gemini Nano session
- [ ] Handle message routing from content script
- [ ] Implement error handling and retries
- [ ] Add performance monitoring

**Message API**:
```javascript
// CHECK_GRAMMAR
{ action: "CHECK_GRAMMAR", text: "..." }
→ { success: true, errors: [...] }

// HUMANIZE
{ action: "HUMANIZE", text: "..." }
→ { success: true, text: "..." }
```

**Deliverable**: Reliable background service

---

### Phase 9: Testing & Optimization
**Goal**: Ensure reliability and performance

**Tasks**:
- [ ] Test on various websites (Google Docs, Gmail, Twitter, etc.)
- [ ] Test with different text lengths (short, medium, long)
- [ ] Measure performance (grammar check speed, AI response time)
- [ ] Test error cases (WASM load failure, AI unavailable)
- [ ] Test memory usage over extended sessions
- [ ] Cross-browser testing (Chrome, Edge, Brave)

**Performance Targets**:
- Grammar check: < 50ms for 1000 words
- AI humanization: < 1s for 200 words
- Memory: < 50MB after 1 hour of use
- UI response: < 100ms to show menu

**Deliverable**: Stable, performant extension

---

### Phase 10: Documentation & Packaging
**Goal**: Prepare for distribution

**Tasks**:
- [ ] Write comprehensive README.md
- [ ] Add installation instructions
- [ ] Document keyboard shortcuts
- [ ] Create privacy policy
- [ ] Add screenshots/demo GIF
- [ ] Write Chrome Web Store description
- [ ] Create promotional materials

**Distribution**:
- Load unpacked (dev mode)
- Future: Chrome Web Store submission

**Deliverable**: Production-ready extension

---

## Technology Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Grammar Engine | Harper WASM (harper.js) | Fast, local grammar checking |
| AI Layer | Gemini Nano (window.ai) | Text humanization & rewriting |
| Fallback | Heuristic word replacement | De-AI without internet |
| UI Injection | Content Script | Floating menu on text selection |
| Orchestration | Background Service Worker | Message routing & coordination |
| Storage | Chrome Storage API | Settings & preferences |
| UI Design | CSS3 (glassmorphism) | Premium, liquid aesthetic |

---

## Privacy Guarantees

✅ **No external API calls** (unless user adds BYOK)
✅ **No data collection** or telemetry
✅ **No server requirements** - 100% local
✅ **Open source** - auditable code
✅ **Chrome extension only** - No desktop app

---

## Competitive Analysis

### Direct Competitor: Wandpen

**Wandpen's Architecture** (Based on Pricing Page Analysis):
- ✅ Local AI (Gemini Nano) - unlimited free
- ✅ Cloud AI (Gemini 2.5 Flash Lite) - 100 generations/month free
- ✅ Unlimited transcription (voice-to-text)
- ❌ No grammar checking mentioned
- 💰 Pro tier: $10/mo for unlimited cloud access
- 💰 BYOK tier: $29 one-time for API key management

**GhostWrite's Differentiation Strategy**:

| Feature | GhostWrite | Wandpen | Advantage |
|---------|------------|---------|-----------|
| **Grammar Checking** | ✅ Harper WASM (instant) | ❌ Not offered | **PRIMARY DIFFERENTIATOR** |
| **Local AI** | ✅ Gemini Nano | ✅ Gemini Nano | Equal |
| **Cloud AI** | ❌ None (privacy-first) | ✅ 100/month free | Privacy advantage |
| **Account Required** | ❌ Zero signup | ✅ Required | **PRIVACY WIN** |
| **Pricing** | 💯 Free forever | 💰 Freemium ($10/mo Pro) | **COST WIN** |
| **UI Paradigm** | 👻 Ghost mode (selection) | 🎨 Always-on interface | Less intrusive |
| **Open Source** | ✅ Auditable code | ❌ Proprietary | Trust advantage |
| **Telemetry** | ❌ Zero tracking | ⚠️ Account-based | **PRIVACY WIN** |
| **Primary Use Case** | Grammar + De-AI | General writing assistant | Focused |
| **Transcription** | ❌ Not planned | ✅ Unlimited | Wandpen wins |

**Key Insight**: Wandpen is a **general writing assistant** with AI rewriting. GhostWrite is a **grammar-first tool** with humanization as a bonus feature.

---

### Target User Comparison

**Wandpen User:**
- "I need help writing better content"
- Wants AI to expand ideas
- Willing to create account
- May pay $10/mo for unlimited AI

**GhostWrite User:**
- "I need to fix grammar and de-AI my text"
- Privacy-conscious (no account)
- Uses AI-generated content that needs humanization
- Wants instant grammar feedback (red squiggles)
- Won't pay for subscriptions

**Market Position**: GhostWrite targets the **"AI content editor"** niche, not the general writing assistant market.

---

### Full Competitive Landscape

#### vs **Grammarly**:
| GhostWrite Advantage | Grammarly Weakness |
|---------------------|-------------------|
| ✅ Runs 100% locally | ❌ Cloud-based (privacy risk) |
| ✅ Free forever | ❌ $12/mo for premium |
| ✅ Faster (WASM < 50ms) | ❌ API latency (~200ms) |
| ✅ Humanization feature | ❌ No de-AI tools |
| ✅ No account required | ❌ Mandatory login |

**Grammarly's Advantages:**
- ❌ More comprehensive grammar rules
- ❌ Style suggestions
- ❌ Plagiarism checker
- ❌ Browser + desktop apps

---

#### vs **Wordtune**:
| GhostWrite Advantage | Wordtune Weakness |
|---------------------|-------------------|
| ✅ Free (no subscription) | ❌ $10/mo required |
| ✅ Private (local processing) | ❌ Uploads text to servers |
| ✅ Ghost mode UI | ❌ Intrusive sidebar |
| ✅ De-AI focus | ❌ Makes text MORE formal/robotic |

**Wordtune's Advantages:**
- ❌ More rewrite variations
- ❌ Tone adjustment (casual/formal)
- ❌ Sentence shortening/expanding

---

#### vs **LanguageTool**:
| GhostWrite Advantage | LanguageTool Weakness |
|---------------------|-------------------|
| ✅ 50x less memory (Harper) | ❌ Heavy memory usage |
| ✅ Humanization feature | ❌ Grammar-only |
| ✅ Modern UI design | ❌ Dated interface |
| ✅ Faster (<50ms) | ❌ Slower (~100-200ms) |

**LanguageTool's Advantages:**
- ❌ Multi-language support (20+ languages)
- ❌ More grammar rules
- ❌ Browser + desktop + API

---

#### vs **QuillBot**:
| GhostWrite Advantage | QuillBot Weakness |
|---------------------|-------------------|
| ✅ Free grammar + AI | ❌ Freemium ($8.33/mo) |
| ✅ Instant local processing | ❌ Cloud-based paraphrasing |
| ✅ Privacy-first | ❌ Stores text on servers |

**QuillBot's Advantages:**
- ❌ Paraphrasing engine
- ❌ Summarization tool
- ❌ Citation generator

---

### Competitive Positioning Statement

**GhostWrite is the only privacy-first grammar extension that combines instant WASM-based checking with local AI humanization, targeting users who edit AI-generated content and refuse to upload text to cloud services.**

**Tagline Options:**
1. "Grammar + De-AI. Zero Cloud. Zero Cost."
2. "Edit like Grammarly. Humanize like Wordtune. All on your device."
3. "The privacy-first grammar extension for the AI age."

---

### Market Gaps GhostWrite Fills

1. **No competitor offers grammar + humanization** in one tool
2. **No competitor runs 100% locally** (Grammarly, Wordtune, QuillBot all cloud-based)
3. **No competitor is truly free** (all have paid tiers or limits)
4. **No competitor targets AI content editors** specifically

---

### Why Users Will Switch

**From Grammarly:**
- "I'm tired of paying $144/year for grammar checking"
- "I don't trust uploading sensitive docs to the cloud"
- "I need to de-AI my ChatGPT drafts"

**From Wandpen:**
- "I don't need unlimited AI rewrites, I need grammar checking"
- "I don't want another account"
- "I want instant feedback, not 500ms delays"

**From Manual Editing:**
- "I'm copy-pasting into ChatGPT to fix grammar—too slow"
- "I need red squiggles while I type"
- "I want one-click humanization for AI text"

---

## Next Steps

1. **Confirm harper.js API** - Review examples directory or docs
2. **Start Phase 1** - Create manifest.json and package.json
3. **Prototype Harper integration** - Verify WASM loading in extension
4. **Build minimal UI** - Test content script injection
5. **Iterate** - Get feedback, refine UX

---

## Success Metrics

- ⚡ Grammar check in < 50ms
- 🤖 Humanization in < 1s
- 👻 Non-intrusive "ghost" UX
- 🔒 100% local processing
- 🎨 Premium visual design
- 📦 < 5MB extension size

---

*Last Updated: 2025-11-22*
