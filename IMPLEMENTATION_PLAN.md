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

**UX Flow**:
1. User selects text
2. Waits 600ms (filters out quick copy actions)
3. Floating menu appears near selection
4. User clicks "Humanize" or "Fix Grammar"
5. Extension processes text
6. Replacement text appears with "Accept/Reject" option

**Deliverable**: Non-intrusive UI that feels premium

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

## Competitive Advantages

vs **Grammarly**:
- ✓ Runs locally (privacy)
- ✓ No subscription required
- ✓ Faster (WASM vs cloud API)

vs **Wordtune**:
- ✓ Free (no $10/month)
- ✓ Private (no data upload)
- ✓ "Ghost Mode" (less intrusive UI)

vs **LanguageTool**:
- ✓ 50x less memory usage
- ✓ Humanization feature
- ✓ Modern UI design

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
