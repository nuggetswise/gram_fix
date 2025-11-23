# GhostWrite Team Collaboration Plan

## Team Structure

### Core Team Roles
- **🔧 Chrome Expert** - Extension architecture, manifest, APIs, performance
- **🤖 AI Engineer** - Harper integration, Cloud API (Gemini/OpenAI), prompt engineering for AI features
- **✍️ Prompt Engineer** - AI prompts for Humanize/Rewrite, quality assurance
- **🎨 UX Team** - Interface design, user flows, accessibility, visual polish

---

## Phase-by-Phase Team Collaboration

### Phase 1: Project Setup ✓
**Duration**: 1-2 days
**Goal**: Initialize Chrome extension structure

#### What We Accomplish:
- ✅ Create manifest.json with Manifest V3 configuration
- ✅ Set up package.json with harper.js dependency
- ✅ Configure build system for WASM bundling
- ✅ Initialize git repository and CI/CD
- ✅ Establish project structure and conventions

#### Team Responsibilities:

**🔧 Chrome Expert (Lead)**
- [ ] Design manifest.json with proper permissions
- [ ] Configure Content Security Policy for WASM
- [ ] Set up chrome.storage API architecture
- [ ] Review: Ensure MV3 best practices

**🤖 AI Engineer**
- [ ] Review package.json dependencies
- [ ] Plan Harper WASM loading strategy
- [ ] Review: Verify harper.js version compatibility

**🎨 UX Team**
- [ ] Define extension icon requirements (16x16, 48x48, 128x128)
- [ ] Review: Ensure accessibility standards in setup

**✍️ Prompt Engineer**
- [ ] Document prompt architecture needs
- [ ] Review: Plan for future AI integration

#### Collaboration Points:
```
Chrome Expert → AI Engineer: "Here's the manifest structure - confirm WASM CSP"
AI Engineer → Chrome Expert: "Harper needs wasm-unsafe-eval permission"
UX Team → Chrome Expert: "Extension icons ready for manifest"
```

#### Deliverable:
✅ Extension skeleton with manifest.json, package.json, proper CSP, git repo

---

### Phase 2: Harper Grammar Integration
**Duration**: 3-4 days
**Goal**: Wire up grammar checking (FREE TIER MVP)

#### What We Accomplish:
- ✅ Install and bundle harper.js WASM
- ✅ Load Harper in background service worker
- ✅ Create grammar check API wrapper
- ✅ Achieve < 50ms performance target
- ✅ Handle WASM loading errors gracefully

#### Team Responsibilities:

**🤖 AI Engineer (Lead)**
- [ ] Implement Harper initialization in background.js
- [ ] Create grammar check message passing API
- [ ] Optimize WASM loading performance
- [ ] Add error handling for WASM failures
- [ ] Review: Performance benchmarks < 50ms

**🔧 Chrome Expert**
- [ ] Review service worker lifecycle
- [ ] Optimize message passing performance
- [ ] Test WASM loading across Chrome versions
- [ ] Review: Memory usage < 10MB

**🎨 UX Team**
- [ ] Design loading state indicators
- [ ] Plan error state visuals
- [ ] Review: User feedback during grammar check

**✍️ Prompt Engineer**
- [ ] Document Harper's grammar rules
- [ ] Plan user-facing error messages
- [ ] Review: Error message clarity

#### Collaboration Points:
```
AI Engineer → Chrome Expert: "WASM loads in 87ms - within target"
Chrome Expert → AI Engineer: "Service worker needs keepalive strategy"
UX Team → AI Engineer: "Need loading indicator for >100ms checks"
AI Engineer → UX Team: "Average check is 43ms, no spinner needed"
```

#### Performance Testing:
- [ ] Test with 100 words: Target < 20ms
- [ ] Test with 1000 words: Target < 50ms
- [ ] Test with 5000 words: Target < 200ms

#### Deliverable:
✅ Working grammar engine with < 50ms performance, no UI yet

---

### Phase 3: Selection Detection & Ghost Menu UI
**Duration**: 5-6 days
**Goal**: Build the floating menu that appears on text selection

#### What We Accomplish:
- ✅ Implement smart selection detection with 400ms debounce
- ✅ Create floating ghost menu with glassmorphic design
- ✅ Position menu intelligently near selection
- ✅ Wire "Fix Grammar" button to Harper
- ✅ Add smooth animations and loading states

#### Team Responsibilities:

**🎨 UX Team (Lead)**
- [ ] Design ghost menu visual system (glassmorphic)
- [ ] Create interaction states (hover, active, disabled)
- [ ] Define positioning logic (above/below selection)
- [ ] Design loading animations
- [ ] Create locked button states for paid features
- [ ] Review: WCAG 2.1 AA compliance

**🔧 Chrome Expert**
- [ ] Implement content script for selection detection
- [ ] Handle DOM positioning edge cases
- [ ] Manage z-index conflicts with host sites
- [ ] Test on Gmail, Docs, Twitter, LinkedIn
- [ ] Review: Cross-site compatibility

**🤖 AI Engineer**
- [ ] Wire menu buttons to grammar API
- [ ] Implement debounce logic (400ms)
- [ ] Add error handling for API calls
- [ ] Review: API response handling

**✍️ Prompt Engineer**
- [ ] Write button labels and tooltips
- [ ] Design locked feature messaging
- [ ] Review: Microcopy clarity

#### Collaboration Points:
```
UX Team → Chrome Expert: "Here's the menu design - Figma link"
Chrome Expert → UX Team: "Gmail has z-index conflicts, need adjustment"
UX Team → Chrome Expert: "Updated z-index to 2147483647"

Chrome Expert → AI Engineer: "Selection event fires every 50ms, need debounce"
AI Engineer → Chrome Expert: "Added 400ms debounce with cancel on deselect"

UX Team → Prompt Engineer: "Need tooltip for locked 'Humanize' button"
Prompt Engineer → UX Team: "Try: '✨ 100 free AI credits available'"
```

#### Design Review Checkpoints:
- [ ] Menu positioning on Gmail compose window
- [ ] Menu visibility on dark backgrounds
- [ ] Animation smoothness (60fps target)
- [ ] Touch target sizes (min 44x44px)
- [ ] Keyboard navigation support

#### Deliverable:
✅ Professional ghost menu with working grammar check, smooth UX

---

### Phase 4: Grammar Error Highlighting & Corrections
**Duration**: 4-5 days
**Goal**: Show inline corrections and accept/reject UI

#### What We Accomplish:
- ✅ Parse Harper error responses
- ✅ Create correction preview overlay
- ✅ Implement diff view (strikethrough → suggestion)
- ✅ Add Accept/Reject buttons with keyboard shortcuts
- ✅ Handle DOM text replacement safely
- ✅ Implement undo functionality

#### Team Responsibilities:

**🔧 Chrome Expert (Lead)**
- [ ] Parse Harper's error format
- [ ] Implement DOM text replacement
- [ ] Handle contentEditable vs input/textarea
- [ ] Add undo/redo support
- [ ] Test across different input types
- [ ] Review: No data loss on edge cases

**🎨 UX Team**
- [ ] Design correction preview UI
- [ ] Create diff visualization (red → green)
- [ ] Design Accept/Reject button states
- [ ] Add celebratory micro-interactions
- [ ] Review: Visual hierarchy clear

**🤖 AI Engineer**
- [ ] Map Harper errors to UI positions
- [ ] Optimize error parsing performance
- [ ] Handle multiple simultaneous errors
- [ ] Review: Accuracy of corrections

**✍️ Prompt Engineer**
- [ ] Write error explanations
- [ ] Create contextual help text
- [ ] Design grammar tip messages
- [ ] Review: Educational value

#### Collaboration Points:
```
Chrome Expert → UX Team: "Harper returns byte offsets, not char positions"
UX Team → Chrome Expert: "Can you convert to visual char positions?"
Chrome Expert → UX Team: "Done - accounting for Unicode"

AI Engineer → Prompt Engineer: "Harper flags 'they' as ambiguous singular"
Prompt Engineer → AI Engineer: "Skip gender-neutral 'they' corrections"
AI Engineer → Prompt Engineer: "Added filter for they/them/theirs"

UX Team → Chrome Expert: "Undo should restore cursor position"
Chrome Expert → UX Team: "Implemented with Selection API"
```

#### Quality Assurance:
- [ ] Test with misspellings: "recieve" → "receive"
- [ ] Test with grammar: "They was happy" → "They were happy"
- [ ] Test with punctuation: "Hello,how are you" → "Hello, how are you"
- [ ] Test undo/redo chain (10+ operations)
- [ ] Test with rich text (bold, italic, links)

#### Deliverable:
✅ Complete FREE TIER experience with polished correction UI

---

### Phase 5: Backend Setup (Paid Tier Foundation)
**Duration**: 6-7 days
**Goal**: Create cloud infrastructure for AI features

#### What We Accomplish:
- ✅ Set up Supabase with users and usage_logs tables
- ✅ Deploy Vercel Edge Functions for API proxy
- ✅ Integrate Stripe for payments
- ✅ Create secure API key generation
- ✅ Implement credit deduction logic
- ✅ Add usage analytics

#### Team Responsibilities:

**🤖 AI Engineer (Lead)**
- [ ] Design database schema (users, usage_logs)
- [ ] Set up Supabase project and tables
- [ ] Create API proxy endpoints
- [ ] Implement credit deduction logic
- [ ] Add rate limiting (prevent abuse)
- [ ] Review: API security audit

**🔧 Chrome Expert**
- [ ] Design extension ↔ backend communication
- [ ] Implement secure API key storage
- [ ] Add retry logic for network failures
- [ ] Test offline behavior
- [ ] Review: No credentials in code

**✍️ Prompt Engineer**
- [ ] Prepare AI system prompts (Humanize, Rewrite, Improve)
- [ ] Test prompt variations for quality
- [ ] Optimize token usage (cost efficiency)
- [ ] Review: AI output consistency

**🎨 UX Team**
- [ ] Design API key input UI
- [ ] Create credit balance display
- [ ] Design payment flow screens
- [ ] Review: Error states clear

#### Collaboration Points:
```
AI Engineer → Chrome Expert: "API keys stored in chrome.storage.sync?"
Chrome Expert → AI Engineer: "Yes, encrypted with Web Crypto API"

Prompt Engineer → AI Engineer: "Humanize prompt is 312 tokens - too long"
AI Engineer → Prompt Engineer: "Can you cut to <100 tokens?"
Prompt Engineer → AI Engineer: "Reduced to 87 tokens, quality maintained"

UX Team → AI Engineer: "Show credit count in real-time after each use"
AI Engineer → UX Team: "Added WebSocket for live balance updates"
```

#### Security Review:
- [ ] API keys never logged
- [ ] Rate limiting per user (100 req/hour)
- [ ] SQL injection prevention
- [ ] CORS configuration correct
- [ ] Stripe webhook signature verification

#### Deliverable:
✅ Backend ready for AI feature integration with secure payment flow

---

### Phase 6: Cloud AI Integration
**Duration**: 5-6 days
**Goal**: Wire up "Humanize" and "Rewrite" buttons to cloud API

#### What We Accomplish:
- ✅ Add API key input in extension settings
- ✅ Display credit balance in real-time
- ✅ Wire "Humanize", "Rewrite", "Improve Writing" buttons
- ✅ Handle API errors gracefully
- ✅ Show credit usage after each action
- ✅ Optimize AI prompts for quality

#### Team Responsibilities:

**✍️ Prompt Engineer (Lead)**
- [ ] Finalize Humanize prompt (remove AI jargon)
- [ ] Finalize Rewrite prompt (clarity focus)
- [ ] Finalize Improve Writing prompt
- [ ] Test prompts with 50+ samples
- [ ] A/B test prompt variations
- [ ] Review: 90%+ quality approval rate

**🤖 AI Engineer**
- [ ] Implement API calls to OpenAI/Anthropic
- [ ] Add streaming response support
- [ ] Handle timeout and retry logic
- [ ] Implement credit deduction tracking
- [ ] Review: < 2s response time

**🎨 UX Team**
- [ ] Design AI processing loading states
- [ ] Create credit balance widget
- [ ] Design error messages (out of credits, API down)
- [ ] Add success animations
- [ ] Review: User understands credit cost

**🔧 Chrome Expert**
- [ ] Optimize message passing for large texts
- [ ] Handle background script lifecycle
- [ ] Test network interruption scenarios
- [ ] Review: No data loss on failures

#### Collaboration Points:
```
Prompt Engineer → AI Engineer: "Humanize prompt v3 ready for testing"
AI Engineer → Prompt Engineer: "Testing with 100 samples... 92% quality"
Prompt Engineer → AI Engineer: "Tweaked examples, now 96%"

UX Team → Prompt Engineer: "Users confused by 'Improve Writing' vs 'Rewrite'"
Prompt Engineer → UX Team: "Rewrite = shorter, Improve = better flow"
UX Team → Prompt Engineer: "Updated tooltips with your descriptions"

AI Engineer → Chrome Expert: "API can timeout on slow connections"
Chrome Expert → AI Engineer: "Added 10s timeout with retry option"
```

#### Quality Testing:
- [ ] Humanize AI-generated text (remove "delve", "leverage", "tapestry")
- [ ] Rewrite verbose content (50% length reduction target)
- [ ] Improve casual text (better flow, no tone shift)
- [ ] Test with technical content (preserve accuracy)
- [ ] Test with creative writing (preserve voice)

#### Deliverable:
✅ Complete PAID TIER functionality with high-quality AI outputs

---

### Phase 7: Onboarding & Trial Flow
**Duration**: 4-5 days
**Goal**: Seamless upgrade path from free to paid

#### What We Accomplish:
- ✅ Create first-time install welcome screen
- ✅ Show "100 free credits" badge on locked buttons
- ✅ Add one-click trial activation
- ✅ Create upgrade prompt when credits run low
- ✅ Add celebratory animations on first AI use

#### Team Responsibilities:

**🎨 UX Team (Lead)**
- [ ] Design welcome modal (first install)
- [ ] Create trial activation flow
- [ ] Design upgrade prompts (at 25, 10, 0 credits)
- [ ] Add celebratory animations
- [ ] Design value proposition messaging
- [ ] Review: 5%+ trial activation rate

**✍️ Prompt Engineer**
- [ ] Write welcome message copy
- [ ] Create trial activation CTA
- [ ] Write upgrade prompt copy
- [ ] Design feature comparison table
- [ ] Review: Conversion-optimized messaging

**🔧 Chrome Expert**
- [ ] Detect first install vs update
- [ ] Implement credit tracking
- [ ] Add upgrade prompt triggers
- [ ] Store user preferences
- [ ] Review: No spam prompts

**🤖 AI Engineer**
- [ ] Implement trial activation API
- [ ] Track first AI usage event
- [ ] Log conversion funnel metrics
- [ ] Review: Analytics accurate

#### Collaboration Points:
```
UX Team → Prompt Engineer: "Welcome screen feels too salesy"
Prompt Engineer → UX Team: "Removed 'amazing', 'incredible', focused on facts"

Prompt Engineer → Chrome Expert: "Show upgrade prompt at 10 credits left"
Chrome Expert → Prompt Engineer: "Also showing at 25 for early awareness?"
Prompt Engineer → Chrome Expert: "Good idea - soft reminder at 25, urgent at 10"

AI Engineer → UX Team: "Trial activation rate is 12% - above target!"
UX Team → AI Engineer: "Celebration animation on first AI use helped"
```

#### Conversion Funnel:
```
Install (100%)
  ↓
See locked AI button (80%)
  ↓
Click "Try Free" (30%)
  ↓
Activate trial (12% = GOAL: 10%+)
  ↓
Use AI feature (8%)
  ↓
Upgrade to paid (0.6% = GOAL: 5% of trial users)
```

#### Deliverable:
✅ Frictionless trial-to-paid conversion with celebration UX

---

### Phase 8: Design System Implementation
**Duration**: 6-8 days
**Goal**: Implement GhostWrite design system across all components

#### What We Accomplish:
- ✅ Set up CSS custom properties from design tokens
- ✅ Implement glassmorphic UI with backdrop-blur
- ✅ Apply color system with light/dark mode support
- ✅ Implement typography scale and font loading
- ✅ Add animation system with smooth transitions
- ✅ Ensure WCAG 2.1 AA accessibility

#### Team Responsibilities:

**🎨 UX Team (Lead)**
- [ ] Audit all components against design system
- [ ] Implement CSS architecture (BEM naming)
- [ ] Create design token CSS variables
- [ ] Design dark mode color palette
- [ ] Test on 10+ websites (Gmail, Docs, Twitter, etc.)
- [ ] Review: Visual consistency 100%

**🔧 Chrome Expert**
- [ ] Optimize CSS injection performance
- [ ] Handle host site CSS conflicts
- [ ] Implement auto dark mode detection
- [ ] Test cross-browser rendering
- [ ] Review: No layout shift or flicker

**🤖 AI Engineer**
- [ ] Review loading states match design system
- [ ] Verify API response states styled correctly
- [ ] Review: Consistent timing functions

**✍️ Prompt Engineer**
- [ ] Review all UI text for tone consistency
- [ ] Verify error messages match voice
- [ ] Review: Brand voice consistent

#### Collaboration Points:
```
UX Team → Chrome Expert: "Design system CSS ready - 847 lines"
Chrome Expert → UX Team: "Minifies to 12KB, injecting in <10ms"

UX Team → Prompt Engineer: "Updated all button labels to sentence case"
Prompt Engineer → UX Team: "Changed 'Fix grammar' → 'Fix Grammar' for emphasis"

Chrome Expert → UX Team: "Gmail has conflicting .button class"
UX Team → Chrome Expert: "Namespaced all classes with ghostwrite-"
```

#### Design System Checklist:
- [ ] Color palette (8 colors + semantic tokens)
- [ ] Typography (3 font sizes, 2 weights)
- [ ] Spacing scale (4px base, 8 increments)
- [ ] Border radius (4px, 8px, 12px)
- [ ] Shadows (3 levels)
- [ ] Animations (fade, slide, scale)
- [ ] Dark mode variants for all colors
- [ ] Focus states (keyboard navigation)

#### Deliverable:
✅ Fully implemented design system with professional UI and dark mode

---

### Phase 9: Settings & Status UI
**Duration**: 3-4 days
**Goal**: Simple configuration interface

#### What We Accomplish:
- ✅ Create popup.html with status dashboard
- ✅ Show grammar engine status (Active/Error)
- ✅ Display credit balance and usage stats
- ✅ Add enable/disable toggle
- ✅ Show upgrade CTA for trial users
- ✅ Add keyboard shortcut configuration

#### Team Responsibilities:

**🎨 UX Team (Lead)**
- [ ] Design popup layout (320x480px)
- [ ] Create status indicators (✅/❌/⚠️)
- [ ] Design settings form
- [ ] Add data visualization (usage chart)
- [ ] Review: Scannable in < 3 seconds

**🔧 Chrome Expert**
- [ ] Implement popup HTML/JS
- [ ] Wire to chrome.storage for settings
- [ ] Add keyboard shortcut API
- [ ] Implement enable/disable toggle
- [ ] Review: Settings persist correctly

**🤖 AI Engineer**
- [ ] Display grammar engine latency
- [ ] Show credit balance and usage
- [ ] Add API health status
- [ ] Review: Real-time updates

**✍️ Prompt Engineer**
- [ ] Write settings descriptions
- [ ] Create tooltip explanations
- [ ] Design upgrade messaging
- [ ] Review: Clarity for non-technical users

#### Collaboration Points:
```
UX Team → Chrome Expert: "Popup design ready, 320x480px mockup"
Chrome Expert → UX Team: "Chrome enforces 600x800 max, can resize"
UX Team → Chrome Expert: "Adjusted to 400x600 for better spacing"

AI Engineer → UX Team: "Should we show 'Credits used today' metric?"
UX Team → AI Engineer: "Yes - adds engagement, shows value"

Prompt Engineer → UX Team: "Tooltip for 'Debounce delay' setting?"
UX Team → Prompt Engineer: "Try: 'Wait time before showing menu (prevents false triggers)'"
```

#### Settings Options:
- [ ] Enable/disable grammar checking
- [ ] Selection debounce delay (200ms - 1000ms)
- [ ] Auto-apply grammar fixes (on/off)
- [ ] Keyboard shortcut customization
- [ ] Dark mode preference (auto/light/dark)

#### Deliverable:
✅ Clean control panel with intuitive settings

---

### Phase 10: Payment Integration
**Duration**: 5-6 days
**Goal**: Stripe checkout for credit purchases

#### What We Accomplish:
- ✅ Create Stripe account and products
- ✅ Implement checkout flow
- ✅ Create customer portal for cancellation
- ✅ Add webhook for payment events
- ✅ Handle subscription status in extension
- ✅ Test payment edge cases

#### Team Responsibilities:

**🤖 AI Engineer (Lead)**
- [ ] Set up Stripe account
- [ ] Create subscription products ($5, $10 tiers)
- [ ] Implement webhook handlers
- [ ] Add payment event logging
- [ ] Test refund scenarios
- [ ] Review: PCI compliance

**🔧 Chrome Expert**
- [ ] Implement checkout redirect flow
- [ ] Handle post-payment redirect
- [ ] Poll for subscription status updates
- [ ] Store payment status in chrome.storage
- [ ] Review: No payment data in extension

**🎨 UX Team**
- [ ] Design upgrade flow
- [ ] Create pricing comparison table
- [ ] Design payment success state
- [ ] Add payment failure recovery
- [ ] Review: Conversion-optimized layout

**✍️ Prompt Engineer**
- [ ] Write pricing page copy
- [ ] Create FAQ for billing
- [ ] Design cancellation flow messaging
- [ ] Review: Transparent pricing

#### Collaboration Points:
```
AI Engineer → Chrome Expert: "Stripe webhook fires, but extension doesn't update"
Chrome Expert → AI Engineer: "Extension polls every 30s, add manual refresh button?"
AI Engineer → Chrome Expert: "Added - good for immediate feedback"

UX Team → Prompt Engineer: "Need FAQ for 'Do credits expire?'"
Prompt Engineer → UX Team: "Monthly credits reset, unused don't roll over"
UX Team → Prompt Engineer: "Added to pricing page"

Prompt Engineer → AI Engineer: "Should we offer annual discount?"
AI Engineer → Prompt Engineer: "Not for MVP - adds complexity"
```

#### Payment Testing:
- [ ] Successful payment (Stripe test cards)
- [ ] Declined card
- [ ] Subscription upgrade ($5 → $10)
- [ ] Subscription downgrade ($10 → $5)
- [ ] Cancellation with credits remaining
- [ ] Webhook retry on failure

#### Deliverable:
✅ Working payment system with seamless upgrade flow

---

### Phase 11: Testing & Optimization
**Duration**: 7-10 days
**Goal**: Ensure reliability and performance across all scenarios

#### What We Accomplish:
- ✅ Test on 10+ major websites
- ✅ Test with varied text lengths
- ✅ Measure and optimize performance
- ✅ Test all error cases
- ✅ Cross-browser testing
- ✅ Stress testing
- ✅ Accessibility audit

#### Team Responsibilities:

**🔧 Chrome Expert (Lead)**
- [ ] Test on Gmail, Docs, Twitter, LinkedIn, Notion
- [ ] Test different input types (textarea, contentEditable, input)
- [ ] Stress test with rapid selections
- [ ] Test offline behavior
- [ ] Profile memory usage
- [ ] Review: < 30MB memory after 1 hour

**🤖 AI Engineer**
- [ ] Benchmark grammar check performance
- [ ] Benchmark API latency
- [ ] Test with 10K+ word documents
- [ ] Test concurrent API requests
- [ ] Review: All performance targets met

**🎨 UX Team**
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Test on different screen sizes
- [ ] Review: Zero accessibility violations

**✍️ Prompt Engineer**
- [ ] Test AI quality with diverse samples
- [ ] Verify error messages are helpful
- [ ] Test edge cases (emoji, code, etc.)
- [ ] Review: 95%+ user satisfaction

#### Collaboration Points:
```
Chrome Expert → AI Engineer: "Google Docs has 180ms grammar check latency"
AI Engineer → Chrome Expert: "Docs uses contentEditable with lots of spans, optimizing..."
AI Engineer → Chrome Expert: "Fixed - now 52ms average"

UX Team → Chrome Expert: "Keyboard navigation broken on Twitter"
Chrome Expert → UX Team: "Twitter intercepts Tab, added custom handler"

Prompt Engineer → AI Engineer: "Humanize fails on code blocks"
AI Engineer → Prompt Engineer: "Added code detection, skips humanization"
```

#### Test Matrix:

| Website | Grammar | AI Features | UI Positioning | Performance | Notes |
|---------|---------|-------------|----------------|-------------|-------|
| Gmail | ✅ | ✅ | ✅ | 43ms | Compose window tested |
| Google Docs | ✅ | ✅ | ⚠️ | 52ms | Conflicts with native spellcheck |
| Twitter | ✅ | ✅ | ✅ | 38ms | Tweet compose tested |
| LinkedIn | ✅ | ✅ | ✅ | 41ms | Post/comment tested |
| Notion | ✅ | ✅ | ✅ | 47ms | Rich text editor tested |
| GitHub | ✅ | ✅ | ✅ | 39ms | Issue/PR comment tested |
| Reddit | ✅ | ✅ | ✅ | 44ms | New post tested |
| Discord | ✅ | ✅ | ⚠️ | 61ms | Chat input tested |
| Slack | ✅ | ✅ | ✅ | 48ms | Message compose tested |
| Medium | ✅ | ✅ | ✅ | 45ms | Article editor tested |

#### Performance Targets:
- ✅ Grammar check: < 50ms for 1000 words
- ✅ Menu appearance: < 100ms after selection
- ✅ API response: < 2s for humanization
- ✅ Extension size: < 5MB
- ✅ Memory usage: < 30MB after 1 hour

#### Deliverable:
✅ Stable, fast extension tested across 10+ sites

---

### Phase 12: Documentation & Launch
**Duration**: 5-7 days
**Goal**: Prepare for public release on Chrome Web Store

#### What We Accomplish:
- ✅ Write comprehensive README.md
- ✅ Create installation and usage guide
- ✅ Document keyboard shortcuts
- ✅ Write privacy policy
- ✅ Create demo video/GIF
- ✅ Write Chrome Web Store description
- ✅ Design promotional assets
- ✅ Submit for review

#### Team Responsibilities:

**✍️ Prompt Engineer (Lead)**
- [ ] Write Chrome Web Store description
- [ ] Create FAQ document
- [ ] Write privacy policy
- [ ] Write terms of service
- [ ] Create tutorial content
- [ ] Review: Marketing copy converts

**🎨 UX Team**
- [ ] Design Chrome Web Store screenshots (1280x800)
- [ ] Create promotional graphics
- [ ] Record demo video (30-60 seconds)
- [ ] Design landing page (optional)
- [ ] Review: Visual assets professional

**🔧 Chrome Expert**
- [ ] Write technical README
- [ ] Document build process
- [ ] Create installation guide
- [ ] Write troubleshooting guide
- [ ] Review: Documentation complete

**🤖 AI Engineer**
- [ ] Document API architecture
- [ ] Write backend setup guide
- [ ] Create database schema docs
- [ ] Review: Technical docs accurate

#### Collaboration Points:
```
Prompt Engineer → UX Team: "Chrome Web Store description draft ready"
UX Team → Prompt Engineer: "Great! Can you trim to 132 chars for headline?"
Prompt Engineer → UX Team: "Done: 'Instant grammar + AI humanization. Private. Fast.'"

UX Team → Chrome Expert: "Demo video shows grammar check in 5 seconds"
Chrome Expert → UX Team: "Perfect - shows instant value"

Chrome Expert → Prompt Engineer: "Added FAQ for 'How do AI features work?'"
Prompt Engineer → Chrome Expert: "Explained cloud API architecture (Gemini primary, OpenAI fallback)"

AI Engineer → Prompt Engineer: "Privacy policy needs API data handling section"
Prompt Engineer → AI Engineer: "Added: 'Text sent to Gemini/OpenAI APIs, encrypted, not stored'"
```

#### Chrome Web Store Assets:

**Title** (45 chars max):
```
GhostWrite - Grammar & AI Humanizer
```

**Tagline** (132 chars max):
```
Instant grammar checking + AI humanization. No bloat. 100% private grammar, optional cloud AI.
```

**Description**:
```
✅ Unlimited grammar checking (FREE forever)
✨ 100 free AI credits to try Humanize & Rewrite
⚡ Instant results (< 50ms)
🔒 Privacy-first (local grammar, optional cloud AI)
👻 Ghost mode UI (appears only when needed)

Perfect for:
- Fixing typos and grammar errors instantly
- Humanizing AI-generated text
- Improving writing clarity and flow
- Students, writers, professionals, anyone who writes online

How it works:
1. Select any text on any website
2. Ghost menu appears (400ms delay to avoid false triggers)
3. Click "Fix Grammar" for instant corrections (FREE)
4. Click "Humanize" to remove AI jargon with cloud AI (100 free trial credits)

Free tier: Unlimited grammar checking, 100% local, zero cloud
Paid tier: 1000+ AI credits/month for advanced features ($5-10/mo)

Privacy guarantee:
- Free grammar: 100% local processing, zero data collection
- Paid AI: You opt-in, text sent to OpenAI/Anthropic for processing
- No storage of your content, ever
```

**Screenshots** (5 required, 1280x800):
1. Ghost menu appearing on selection (Gmail)
2. Grammar correction UI (before/after)
3. AI Humanize feature (removing AI jargon)
4. Settings popup (credit balance, status)
5. Comparison table (vs Grammarly)

**Demo Video** (30-60 seconds):
```
0:00 - Select text on Gmail
0:03 - Ghost menu appears
0:05 - Click "Fix Grammar"
0:07 - Correction appears with Accept/Reject
0:10 - Click Accept, text updated
0:12 - Select AI-generated text
0:15 - Click "Humanize" (show trial credits)
0:18 - Show humanized output (removed "delve", "leverage")
0:21 - Show settings popup (credit balance)
0:24 - Text: "Fast. Private. Powerful."
0:27 - Logo + "Get GhostWrite"
```

#### Privacy Policy Key Points:
```
WHAT WE COLLECT:
- Free tier: Nothing. 100% local processing.
- Paid tier: API usage logs (no content stored)

WHAT WE DON'T COLLECT:
- Your text content (deleted after AI processing)
- Browsing history
- Personal information (only email for account)

THIRD-PARTY SERVICES:
- OpenAI/Anthropic: Processes text for AI features (user opts-in)
- Stripe: Payment processing (PCI compliant)
- Supabase: Credit balance storage

YOUR RIGHTS:
- Delete account anytime
- Export usage data
- Request data deletion
```

#### Launch Checklist:
- [ ] README.md complete
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Chrome Web Store assets ready
- [ ] Demo video uploaded
- [ ] Landing page live (optional)
- [ ] Support email set up
- [ ] Analytics configured
- [ ] Monitoring dashboards set up
- [ ] Submitted to Chrome Web Store

#### Deliverable:
✅ Production-ready extension submitted to Chrome Web Store

---

## Cross-Phase Collaboration Rituals

### Daily Standups (15 minutes)
**Every morning, all team members:**
1. What I shipped yesterday
2. What I'm shipping today
3. What's blocking me

**Example**:
```
Chrome Expert: "Shipped Phase 3 selection detection. Today: positioning logic. Blocked: z-index conflicts on Gmail."
UX Team: "I'll adjust the design to use higher z-index. Working on menu animations today."
```

### Design Reviews (Twice per week)
**Participants**: UX Team, Prompt Engineer, Chrome Expert
- Review all new UI components
- Verify accessibility
- Test messaging clarity
- Vote: Ship / Iterate / Reject

### Code Reviews (Before each merge)
**Participants**: Chrome Expert + AI Engineer
- Performance check
- Security audit
- Best practices verification
- Required approvals: 2

### User Testing (End of each phase)
**Participants**: All team
- Test with 5-10 target users
- Record usability issues
- Prioritize fixes
- Required: 4.0+ satisfaction score to proceed

### Retrospectives (End of each phase)
**Participants**: All team
1. What went well?
2. What could improve?
3. Action items for next phase

---

## Success Metrics by Team

### 🔧 Chrome Expert
- Extension loads in < 500ms
- Memory usage < 30MB
- Works on 10+ major websites
- Zero CSP violations
- 4.5+ stars on Chrome Web Store

### 🤖 AI Engineer
- Grammar check < 50ms
- API response < 2s
- 99.9% API uptime
- Credit deduction 100% accurate
- AI quality > 90% approval

### ✍️ Prompt Engineer
- Humanize removes 95%+ AI jargon
- Rewrite reduces length 30-50%
- Error messages tested with users (4.0+ clarity)
- Trial activation messaging converts 10%+

### 🎨 UX Team
- WCAG 2.1 AA compliance 100%
- User satisfaction > 4.5/5
- Trial activation rate > 10%
- Trial-to-paid conversion > 5%
- Menu appears in < 100ms

---

## Communication Channels

### Slack Channels:
- `#ghostwrite-general` - Team announcements
- `#ghostwrite-chrome` - Chrome/extension discussions
- `#ghostwrite-ai` - AI/ML discussions
- `#ghostwrite-ux` - Design discussions
- `#ghostwrite-bugs` - Bug reports
- `#ghostwrite-wins` - Celebrate launches!

### Weekly Meetings:
- **Monday 10am**: Phase kickoff
- **Wednesday 2pm**: Design review
- **Friday 4pm**: Phase demo + retro

### Documentation:
- **Notion**: Design specs, meeting notes
- **Figma**: All design files
- **GitHub**: Code, issues, PRs
- **Linear**: Task tracking

---

## Risk Escalation Protocol

### Performance Issues
```
AI Engineer finds grammar check is 120ms (target: <50ms)
  ↓
Escalate to Chrome Expert for profiling
  ↓
Chrome Expert + AI Engineer pair debug
  ↓
If unsolved in 2 days, escalate to tech lead
```

### Design Conflicts
```
Chrome Expert: "This UI breaks on Gmail"
UX Team: "But it looks perfect on our test site"
  ↓
Schedule design review with both teams
  ↓
Test live on Gmail together
  ↓
UX Team adjusts design based on Chrome Expert feedback
```

### Quality Issues
```
Prompt Engineer: "AI quality only 75% (target: 90%)"
  ↓
A/B test 3 prompt variations
  ↓
AI Engineer helps optimize token usage
  ↓
If quality doesn't improve, escalate to consider different AI model
```

---

*Last Updated: 2025-11-23*
*Team: Chrome Expert, AI Engineer, Prompt Engineer, UX Team*
