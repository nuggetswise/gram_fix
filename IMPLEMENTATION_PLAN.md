# GhostWrite Implementation Plan

## Project Overview
A privacy-first Chrome extension that provides instant grammar checking (free tier) and cloud-powered AI humanization (paid tier), competing with Grammarly while offering better privacy and simpler pricing.

---

## Simplified 2-Tier Architecture

### FREE TIER: Grammar Only
```
✅ Harper WASM grammar checking (unlimited)
✅ Instant red squiggles
✅ < 50ms performance
✅ 100% local, zero cloud
✅ No account required
✅ ~5MB extension size
❌ No AI humanization
```

### PAID TIER: Cloud AI Features
```
✅ Everything in Free tier
✅ 100 FREE trial credits
✅ "Humanize" button (cloud AI)
✅ "Rewrite" button (cloud AI)
✅ "Improve Writing" (cloud AI)
💰 1000 credits for $5-10/month
```

**Key Decision**: No local AI (Gemini Nano) to avoid 2GB+ downloads. Cloud API keeps extension lightweight and fast to install.

---

## Why This Architecture Wins

### 1. Zero Friction Onboarding
- Install → instant grammar checking
- No model downloads, no waiting
- Works on slow connections
- Users see value in 5 seconds

### 2. Clear Value Ladder
```
Install (FREE)
  ↓
"Fix my typos" → Happy with grammar checking
  ↓
See "Humanize" button → Try 100 free credits
  ↓
"This is useful" → Upgrade to 1000 credits/month
```

### 3. Competitive Advantages

| Feature | GhostWrite Free | Grammarly Free | Wandpen |
|---------|----------------|----------------|---------|
| Grammar Checking | ✅ Full-featured | ✅ Basic only | ❌ None |
| Extension Size | 5MB | ~20MB | ~2GB |
| AI Humanization | 🎁 100 trial credits | ❌ Paid only ($12/mo) | ✅ Unlimited local |
| Account Required | ❌ Not for grammar | ✅ Always | ✅ Always |
| Privacy (Free) | ✅ 100% local | ❌ Cloud-based | ⚠️ Local AI only |

**Market Position**: Lightest, fastest grammar checker with optional cloud AI upgrade.

---

## Technology Stack

### Layer 1: Grammar (FREE - Always Local)
- **Engine**: Harper WASM (via harper.js NPM package)
- **Speed**: < 50ms for 1000 words
- **Privacy**: 100% local, zero network calls
- **Memory**: < 10MB

### Layer 2: AI Enhancement (PAID - Cloud API)
- **Engine**: Cloud AI API (OpenAI/Anthropic/Google)
- **Speed**: ~1-2s (network + inference)
- **Privacy**: User opts-in, aware of cloud processing
- **Features**: Humanize, Rewrite, Improve Writing

### Layer 3: Backend (PAID - Credit Management)
- **Auth**: Simple API key system (no passwords)
- **Storage**: Supabase or Firebase
- **Payment**: Stripe
- **API Proxy**: Vercel Edge Functions

---

## Harper Repository Integration

### What We Can Repurpose:
1. **harper.js** - Official JavaScript/WASM binding via NPM
2. **Pre-built WASM binaries** - Bundled in npm package
3. **Browser-ready** - Proven at writewithharper.com
4. **Lightweight** - Uses 1/50th of LanguageTool's memory
5. **Privacy-first** - Runs 100% offline

### Integration:
```bash
npm install harper.js
```

Includes TypeScript definitions, WASM binary, and web integration examples.

---

## Implementation Phases

### Phase 1: Project Setup ✓
**Goal**: Initialize Chrome extension structure

**Files to Create**:
- [ ] `manifest.json` - Extension configuration
- [ ] `package.json` - NPM dependencies (harper.js only)
- [ ] `.gitignore` - Exclude node_modules, dist
- [ ] `README.md` - Setup instructions

**Key Configuration**:
- Manifest V3
- Content Security Policy for WASM
- Permissions: activeTab, storage
- No network permissions for free tier

**Deliverable**: Extension skeleton ready for development

---

### Phase 2: Harper Grammar Integration
**Goal**: Wire up grammar checking (FREE TIER MVP)

**Tasks**:
- [ ] Install `harper.js` via NPM
- [ ] Create build script to bundle WASM
- [ ] Load Harper in background service worker
- [ ] Create grammar check API wrapper
- [ ] Test WASM loading in extension context

**Technical Implementation**:
```javascript
// background.js
import { Harper } from 'harper.js';

let checker = null;

async function initHarper() {
  checker = await Harper.init();
  console.log('✅ Harper loaded');
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "CHECK_GRAMMAR") {
    const errors = checker.lint(message.text);
    sendResponse({ success: true, errors });
  }
  return true;
});
```

**Performance Target**: < 50ms for 1000 words

**Deliverable**: Working grammar engine, no UI yet

---

### Phase 3: Selection Detection & Ghost Menu UI
**Goal**: Build the floating menu that appears on text selection

**Tasks**:
- [ ] Implement selection detection in content script
- [ ] Add 400ms debounce (avoid false triggers on copy/paste)
- [ ] Create floating button menu HTML/CSS
- [ ] Position menu near text selection
- [ ] Wire up "Fix Grammar" button to Harper
- [ ] Add loading states and animations

**UX Flow** (FREE TIER):
```
1. User selects text
2. Wait 400ms (filters out quick copy actions)
3. Show floating menu with [Fix Grammar] button
4. Click → Send to background → Harper checks → Show corrections
```

**Menu HTML**:
```html
<div class="ghostwrite-menu">
  <button data-action="fix-grammar">✓ Fix Grammar</button>
  <button data-action="humanize" class="locked">✨ Humanize (Trial)</button>
  <button data-action="rewrite" class="locked">↻ Rewrite (Trial)</button>
</div>
```

**Visual Design**:
- Glassmorphic background (backdrop-blur)
- Smooth fade-in animation (200ms)
- Position: Above selection (fallback: below if clipped)
- Locked buttons show tooltip: "100 free credits available"

**Deliverable**: Professional ghost menu with working grammar check

---

### Phase 4: Grammar Error Highlighting & Corrections
**Goal**: Show inline corrections and accept/reject UI

**Tasks**:
- [ ] Parse Harper error response
- [ ] Create correction preview overlay
- [ ] Implement diff view (strikethrough → suggestion)
- [ ] Add Accept/Reject buttons
- [ ] Handle DOM text replacement
- [ ] Add undo functionality

**UX Flow**:
```
1. User clicks "Fix Grammar"
2. Loading spinner (50-100ms)
3. Show preview: "recieve" → "receive"
4. User clicks Accept → Text replaced
5. User clicks Reject → Original kept
```

**Preview UI**:
```html
<div class="ghostwrite-preview">
  <div class="correction">
    <span class="error">recieve</span>
    <span class="arrow">→</span>
    <span class="fix">receive</span>
  </div>
  <div class="actions">
    <button class="accept">✓ Accept</button>
    <button class="reject">✗ Reject</button>
  </div>
  <div class="meta">Grammar • Harper</div>
</div>
```

**Deliverable**: Complete FREE TIER experience

---

### Phase 5: Backend Setup (Paid Tier Foundation)
**Goal**: Create cloud infrastructure for AI features

**Tasks**:
- [ ] Set up Supabase project (or Firebase)
- [ ] Create users table (id, email, credits_remaining, tier)
- [ ] Create usage_logs table (user_id, action, credits_used, timestamp)
- [ ] Deploy Vercel Edge Function for API proxy
- [ ] Integrate Stripe for payments
- [ ] Create API key generation system

**Database Schema**:
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  api_key TEXT UNIQUE,
  credits_remaining INT DEFAULT 100,
  tier TEXT DEFAULT 'trial', -- trial | paid
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage logs
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT, -- humanize | rewrite | improve
  text_length INT,
  credits_used INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**API Proxy** (Vercel Edge Function):
```javascript
// api/humanize.js
export default async function handler(req) {
  const { apiKey, text, action } = await req.json();

  // Verify API key & credits
  const user = await supabase
    .from('users')
    .select('*')
    .eq('api_key', apiKey)
    .single();

  if (user.credits_remaining < 1) {
    return new Response(JSON.stringify({ error: 'No credits' }), { status: 402 });
  }

  // Call OpenAI/Anthropic/Google
  const result = await callAI(text, action);

  // Deduct credit
  await supabase
    .from('users')
    .update({ credits_remaining: user.credits_remaining - 1 })
    .eq('id', user.id);

  return new Response(JSON.stringify({ result }));
}
```

**Deliverable**: Backend ready for AI feature integration

---

### Phase 6: Cloud AI Integration
**Goal**: Wire up "Humanize" and "Rewrite" buttons to cloud API

**Tasks**:
- [ ] Add API key input in extension settings
- [ ] Implement credit balance display
- [ ] Wire "Humanize" button to backend API
- [ ] Wire "Rewrite" button to backend API
- [ ] Add "Improve Writing" button
- [ ] Handle API errors gracefully
- [ ] Show credit usage in real-time

**System Prompts**:

**Humanize**:
```
You are a professional editor. Rewrite this text to sound more human and natural.
Remove AI jargon like 'delve', 'leverage', 'tapestry', 'underscore'.
Keep the exact same meaning. Output only the rewritten text.
```

**Rewrite**:
```
Rewrite this text to be clearer and more concise while keeping the same meaning.
Output only the rewritten text.
```

**Improve Writing**:
```
Improve this text for clarity, flow, and readability.
Keep the same tone and meaning. Output only the improved text.
```

**Extension Settings UI**:
```
┌────────────────────────────────────────┐
│ GhostWrite Settings                    │
├────────────────────────────────────────┤
│ Grammar Checking (FREE)                │
│ ✅ Enabled                             │
│                                        │
│ AI Features                            │
│ [ API Key: _________________ ]  Enter  │
│                                        │
│ Credits: 73 / 100 (Trial)             │
│ [Upgrade to 1000 credits/month] →     │
└────────────────────────────────────────┘
```

**Deliverable**: Complete PAID TIER functionality

---

### Phase 7: Onboarding & Trial Flow
**Goal**: Seamless upgrade path from free to paid

**Tasks**:
- [ ] Create first-time install welcome screen
- [ ] Show "100 free credits" badge on locked buttons
- [ ] Add one-click trial activation
- [ ] Create upgrade prompt when credits run low
- [ ] Add celebratory animation on first AI use

**First Install Flow**:
```
1. Install extension
2. Select text → Menu appears
3. Click "Fix Grammar" → Works instantly (FREE)
4. See locked "✨ Humanize" button with badge "100 FREE"
5. Click → Prompt: "Get 100 free credits to try AI features"
6. One-click → Generate API key → Credits activated
7. Try Humanize → Success!
8. At 10 credits left → Upgrade prompt
```

**Welcome Modal** (First install only):
```html
<div class="welcome">
  <h1>Welcome to GhostWrite! 👋</h1>
  <p>Your grammar checker is ready.</p>

  <div class="feature">
    ✅ Unlimited grammar checking (FREE forever)
  </div>

  <div class="feature">
    🎁 100 FREE AI credits to try Humanize & Rewrite
  </div>

  <button>Get Started</button>
</div>
```

**Deliverable**: Frictionless trial-to-paid conversion

---

### Phase 8: Liquid Design System
**Goal**: Create high-end visual design matching Linear/Vercel aesthetic

**Tasks**:
- [ ] Implement glassmorphic UI (backdrop-blur)
- [ ] Create neutral color palette
- [ ] Add smooth animations (200ms transitions)
- [ ] Design hover states with subtle glow
- [ ] Ensure dark mode compatibility
- [ ] Test menu on various websites (Gmail, Docs, Twitter)

**Design Principles**:
- Minimal footprint (no clutter)
- Blurred backgrounds (context-aware)
- Subtle shadows (depth without distraction)
- Fast transitions (snappy, not sluggish)
- High contrast for readability

**CSS Variables**:
```css
:root {
  --ghost-bg: rgba(255, 255, 255, 0.9);
  --ghost-border: rgba(0, 0, 0, 0.1);
  --ghost-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  --ghost-blur: blur(10px);
  --ghost-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --ghost-accent: #6366f1; /* Indigo */
  --ghost-success: #10b981; /* Green */
  --ghost-error: #ef4444; /* Red */
}
```

**Deliverable**: Premium, professional UI that works everywhere

---

### Phase 9: Settings & Status UI
**Goal**: Simple configuration interface

**Tasks**:
- [ ] Create `popup.html` with status dashboard
- [ ] Show Harper status (✅ Active / ❌ Error)
- [ ] Display credit balance and usage stats
- [ ] Add enable/disable toggle
- [ ] Show upgrade CTA for trial users
- [ ] Add keyboard shortcut config
- [ ] Link to payment portal

**Popup Layout**:
```
┌──────────────────────────────────┐
│ GhostWrite                       │
├──────────────────────────────────┤
│ Grammar Checking                 │
│ ✅ Active • 0ms latency          │
│                                  │
│ AI Features                      │
│ 🎁 Trial: 73 credits left        │
│                                  │
│ [Upgrade for $5/mo] →            │
│                                  │
│ ⚙️ Settings                      │
│ ⌨️ Keyboard Shortcuts            │
│ 💳 Billing Portal                │
└──────────────────────────────────┘
```

**Deliverable**: Clean control panel

---

### Phase 10: Payment Integration
**Goal**: Stripe checkout for credit purchases

**Tasks**:
- [ ] Create Stripe account
- [ ] Set up subscription products ($5/mo, $10/mo)
- [ ] Implement checkout flow
- [ ] Create customer portal for cancellation
- [ ] Add webhook for payment events
- [ ] Handle subscription status in extension

**Pricing Options**:
```
TRIAL (FREE)
├─ 100 credits one-time
└─ No card required

STARTER ($5/mo)
├─ 1,000 credits/month
└─ Unused credits don't roll over

PRO ($10/mo)
├─ 3,000 credits/month
└─ Better value (3x credits for 2x price)
```

**Alternative**: Pay-as-you-go
```
$5 = 1,000 credits (never expire)
```

**Checkout Flow**:
```
1. Click "Upgrade" in popup
2. Open Stripe Checkout (new tab)
3. Select plan → Enter card → Subscribe
4. Webhook updates credits in database
5. Extension polls API → Shows new balance
```

**Deliverable**: Working payment system

---

### Phase 11: Testing & Optimization
**Goal**: Ensure reliability and performance

**Tasks**:
- [ ] Test on various websites (Google Docs, Gmail, Twitter, LinkedIn)
- [ ] Test with different text lengths (short, medium, long)
- [ ] Measure performance (grammar speed, API latency)
- [ ] Test error cases (WASM load failure, API timeout)
- [ ] Test credit deduction accuracy
- [ ] Cross-browser testing (Chrome, Edge, Brave)
- [ ] Stress test with rapid selections

**Performance Targets**:
- Grammar check: < 50ms for 1000 words
- Menu appearance: < 100ms after selection
- API response: < 2s for humanization
- Extension size: < 5MB
- Memory usage: < 30MB after 1 hour

**Test Matrix**:
| Website | Grammar | Humanize | UI Position | Notes |
|---------|---------|----------|-------------|-------|
| Gmail | ✅ | ✅ | ✅ | Test in compose window |
| Google Docs | ✅ | ✅ | ⚠️ | May conflict with native spellcheck |
| Twitter | ✅ | ✅ | ✅ | Test in tweet compose |
| LinkedIn | ✅ | ✅ | ✅ | Test in post/comment |
| Notion | ✅ | ✅ | ✅ | Test in rich text editor |

**Deliverable**: Stable, fast extension

---

### Phase 12: Documentation & Launch
**Goal**: Prepare for public release

**Tasks**:
- [ ] Write comprehensive README.md
- [ ] Create installation guide
- [ ] Document keyboard shortcuts
- [ ] Write privacy policy (important for cloud API)
- [ ] Create demo video/GIF
- [ ] Write Chrome Web Store description
- [ ] Design promotional assets (screenshots, logo)
- [ ] Create landing page (optional)

**Chrome Web Store Listing**:
```
Title: GhostWrite - Grammar & AI Humanizer

Tagline: Instant grammar checking + AI humanization. No bloat.

Description:
✅ Unlimited grammar checking (FREE forever)
✨ 100 free AI credits to try Humanize & Rewrite
⚡ Instant results (< 50ms)
🔒 Privacy-first (local grammar, optional cloud AI)
👻 Ghost mode UI (appears only when needed)

Perfect for:
- Fixing typos and grammar errors
- Humanizing AI-generated text
- Improving writing clarity
- Students, writers, professionals

Free tier: Unlimited grammar checking with Harper engine
Paid tier: 1000+ AI credits/month for advanced features
```

**Privacy Policy Key Points**:
```
FREE TIER:
- 100% local processing
- Zero data collection
- No network calls

PAID TIER:
- Cloud API for AI features (user opts-in)
- Text sent to OpenAI/Anthropic for processing
- No storage of user text
- Credit usage logged (no content)
```

**Deliverable**: Production-ready extension

---

## Competitive Positioning

### vs Grammarly

| GhostWrite Advantage | Grammarly Weakness |
|---------------------|-------------------|
| ✅ Free grammar (unlimited) | ⚠️ Free tier has limits |
| ✅ 5MB extension size | ❌ ~20MB extension |
| ✅ < 50ms response time | ❌ ~200ms API latency |
| ✅ Optional cloud (privacy) | ❌ Always cloud-based |
| ✅ AI humanization feature | ❌ No de-AI tools |
| ✅ $5-10/mo for AI | ❌ $12/mo minimum |

**Target Grammarly users who**:
- Want privacy (no cloud for grammar)
- Don't need advanced style checks
- Want AI humanization for ChatGPT text
- Want lighter, faster extension

---

### vs Wandpen

| GhostWrite Advantage | Wandpen Weakness |
|---------------------|-------------------|
| ✅ Grammar checking included | ❌ No grammar checking |
| ✅ 5MB extension | ❌ 2GB+ model download |
| ✅ Instant install | ❌ Long setup time |
| ✅ Works on slow connections | ❌ Requires powerful device |

**Target Wandpen users who**:
- Need grammar checking (not just AI)
- Have limited storage/bandwidth
- Want instant onboarding

---

### vs LanguageTool

| GhostWrite Advantage | LanguageTool Weakness |
|---------------------|-------------------|
| ✅ Faster (< 50ms) | ❌ Slower (~100-200ms) |
| ✅ AI humanization | ❌ Grammar only |
| ✅ Modern UI | ❌ Dated interface |
| ✅ Lighter memory usage | ❌ Heavy memory footprint |

---

## Market Positioning Statement

**GhostWrite is the fastest grammar checker that combines instant local checking with optional cloud AI humanization, targeting privacy-conscious users who edit AI-generated content.**

**Tagline Options**:
1. "Grammar + De-AI. Instant. Private."
2. "Fix grammar instantly. Humanize with AI."
3. "The grammar checker for the AI age."

---

## Monetization Model

### Revenue Projections

**Assumptions**:
- 10,000 installs in Year 1
- 5% trial-to-paid conversion
- Average $7.50/mo per paid user (mix of $5 and $10 tiers)

**Revenue**:
```
Year 1:
- 10,000 installs
- 500 paid users (5% conversion)
- $3,750/month = $45,000/year

Year 2:
- 50,000 installs
- 2,500 paid users
- $18,750/month = $225,000/year
```

**Costs**:
- Cloud API: ~$0.002 per humanization (GPT-4o-mini)
- 1000 credits = $2 in API costs
- Gross margin: ~73% ($5 tier), ~87% ($10 tier)
- Stripe fees: 2.9% + $0.30
- Hosting: ~$20/month (Vercel + Supabase free tiers)

**Unit Economics** ($5/mo tier):
```
Revenue: $5.00
- API costs: $2.00
- Stripe fees: $0.45
= Net: $2.55 (51% margin)
```

**Unit Economics** ($10/mo tier):
```
Revenue: $10.00
- API costs: $6.00 (3000 credits)
- Stripe fees: $0.59
= Net: $3.41 (34% margin)
```

**Optimization**: Encourage $10 tier (better margin + value)

---

## Success Metrics

### Technical KPIs:
- ⚡ Grammar check: < 50ms
- 🚀 Menu appearance: < 100ms
- 🤖 AI humanization: < 2s
- 📦 Extension size: < 5MB
- 💾 Memory usage: < 30MB

### Business KPIs:
- 📥 Install rate
- 🎁 Trial activation rate
- 💰 Trial-to-paid conversion (target: 5%)
- 💳 Churn rate (target: < 10%/month)
- 📊 Credits used per user (engagement)

### UX KPIs:
- ⏱️ Time to first grammar check: < 10 seconds
- 🎯 Time to trial activation: < 2 minutes
- ✨ AI feature usage rate: > 30% of trial users
- 👍 User satisfaction: > 4.5 stars on Chrome Web Store

---

## Next Steps

1. **Finalize UX flow** - Review with design-focused agent
2. **Start Phase 1** - Create manifest.json and package.json
3. **Prototype Harper integration** - Verify WASM in extension
4. **Build minimal UI** - Ghost menu with grammar check
5. **Launch FREE tier MVP** - Get user feedback
6. **Build backend** - API + credit system
7. **Launch PAID tier** - Monetize

---

## Risk Mitigation

### Technical Risks:
- **WASM loading issues**: Test extensively, add fallback error UI
- **Cloud API downtime**: Cache last known status, queue requests
- **DOM manipulation conflicts**: Test on major sites, handle errors gracefully

### Business Risks:
- **Low conversion rate**: Optimize trial flow, improve AI quality
- **High churn**: Monitor usage patterns, improve features
- **API cost spikes**: Implement rate limiting, monitor usage

### Competitive Risks:
- **Grammarly adds humanization**: Differentiate on privacy + speed
- **Wandpen adds grammar**: Emphasize instant install + no downloads
- **Price war**: Focus on UX quality, not just price

---

## Long-term Roadmap (Post-MVP)

**Phase 13: Advanced Features**
- Multi-sentence context awareness
- Custom dictionary (user-added words)
- Style suggestions (passive voice, readability)
- Tone adjustment (formal ↔ casual)

**Phase 14: Platform Expansion**
- Firefox extension
- Safari extension
- Edge standalone (non-Chrome)

**Phase 15: Enterprise**
- Team accounts (bulk credits)
- Brand voice customization
- Usage analytics dashboard
- SSO integration

---

*Last Updated: 2025-11-22*
*Version: 2.0 - Simplified 2-Tier Model*
