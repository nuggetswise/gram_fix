# GhostWrite Two-Stage Pipeline UX Design

**Version 1.0** | **Created**: 2025-11-23
**Status**: Design Specification
**Author**: UX Design Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [User Flow Design](#user-flow-design)
4. [UI State Specifications](#ui-state-specifications)
5. [Loading States & Transitions](#loading-states--transitions)
6. [Grammar Error Display System](#grammar-error-display-system)
7. [Value Communication Strategy](#value-communication-strategy)
8. [Error Handling UX](#error-handling-ux)
9. [Technical Implementation Guide](#technical-implementation-guide)
10. [Recommendations & Improvements](#recommendations--improvements)

---

## Executive Summary

### The Two-Stage Pipeline

**Current Flow:**
```
User Action → AI Processing (Gemini/OpenAI) → Automatic Grammar Check → Final Result
```

**What Happens:**
1. **Stage 1**: AI processes text (humanize/rewrite) - ~500ms-2s
2. **Stage 2**: Harper automatically checks AI output for grammar - ~50ms
3. **Result**: Polished AI text with grammar errors flagged (if any)

### The UX Challenge

Users currently experience this as a black box:
- They don't know two stages are happening
- No visual feedback differentiates stages
- The value proposition (AI + grammar in one click) is invisible
- Grammar errors on AI output lack clear UI treatment

### The UX Opportunity

**Transform the pipeline into a delightful, transparent experience that:**
- Communicates progress through both stages clearly
- Shows intermediate AI results while grammar checking runs
- Displays grammar errors on AI text in an intuitive way
- Reinforces the value: "AI enhancement + grammar perfection in one click"
- Handles errors gracefully at each stage

---

## Current Architecture Analysis

### Backend Implementation (`/api/humanize.js`, `/api/rewrite.js`)

**API Response Structure:**
```json
{
  "success": true,
  "result": "AI-processed text here",
  "credits_remaining": 99,
  "provider": "gemini",
  "should_check_grammar": true,
  "pipeline_stage": "ai_complete"
}
```

**Key Insights:**
- ✅ Backend signals grammar check should happen (`should_check_grammar: true`)
- ✅ Pipeline stage tracking exists (`pipeline_stage: 'ai_complete'`)
- ⚠️ Frontend must orchestrate stage 2 (grammar check)
- ⚠️ No intermediate result streaming (can't show AI text before grammar check)

### Frontend Implementation (`/capability-manager.js`)

**Current Flow (lines 313-374):**
```javascript
// STAGE 1: AI Humanization
const response = await fetch(`${apiEndpoint}/api/humanize`, {...});
const data = await response.json();

// STAGE 2: Automatic Grammar Check
let grammarErrors = [];
if (data.should_check_grammar && this.state.harper.loaded) {
  grammarErrors = await this.checkGrammar(data.result);
}

// Return complete result
return {
  text: data.result,
  grammarErrors: grammarErrors,
  provider: data.provider,
  creditsRemaining: data.credits_remaining,
  pipelineComplete: true
};
```

**Key Insights:**
- ✅ Two-stage execution is sequential and automatic
- ✅ Grammar errors are collected and returned with result
- ⚠️ No progress callbacks during execution
- ⚠️ No UI state updates between stages
- ⚠️ All-or-nothing result (no intermediate visibility)

### Current Gaps

| Gap | Impact | Solution |
|-----|--------|----------|
| **No progress visibility** | User sees one long loading state | Add stage indicators and progress updates |
| **No stage differentiation** | Can't tell what's happening when | Show "AI processing..." then "Checking grammar..." |
| **Grammar errors hidden** | No UI for displaying errors on AI text | Design error highlighting + correction flow |
| **Value unclear** | Users don't know they get both AI + grammar | Communicate benefit explicitly in UI |
| **Error handling unclear** | What if stage 1 succeeds but stage 2 fails? | Define fallback UX for each stage |

---

## User Flow Design

### Primary Flow: Humanize/Rewrite with Two-Stage Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. USER SELECTION                                                   │
│ User selects text on page                                           │
│ "The utilization of AI technology facilitates better outcomes"      │
└────────────────────┬────────────────────────────────────────────────┘
                     │ 400ms delay (filter copy/paste)
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. GHOST MENU APPEARS                                               │
│ ┌─────────────────────────────────────────────────┐                │
│ │ [ ✓ Fix Grammar ]  [ ✨ Humanize ]  [ ↻ Rewrite ] │                │
│ └─────────────────────────────────────────────────┘                │
└────────────────────┬────────────────────────────────────────────────┘
                     │ User clicks "Humanize"
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. STAGE 1: AI PROCESSING                                           │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │  🤖 AI Enhancement (1/2)                                     │   │
│ │  ● ○ ○  Humanizing your text with Gemini...                 │   │
│ │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%                     │   │
│ │                                                               │   │
│ │  Estimated: 2s • Credits: 1 • Provider: Gemini               │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ Visual: Subtle animation, progress indicator                       │
│ Duration: ~500ms-2s depending on API                               │
└────────────────────┬────────────────────────────────────────────────┘
                     │ AI processing complete
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. STAGE TRANSITION (Optional: Show intermediate result)           │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │  ✅ AI Enhanced                                              │   │
│ │  "Using AI technology helps create better results"           │   │
│ │                                                               │   │
│ │  ⏳ Checking grammar... (2/2)                                │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ Visual: Quick flash of AI result + grammar checking indicator      │
│ Duration: ~50ms (almost instant) - may skip showing this           │
└────────────────────┬────────────────────────────────────────────────┘
                     │ Grammar check complete
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5a. RESULT: CLEAN (No Grammar Errors)                              │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │  ✨ Humanized & Grammar Checked                              │   │
│ │                                                               │   │
│ │  "Using AI technology helps create better results"           │   │
│ │                                                               │   │
│ │  ✓ No grammar issues found                                   │   │
│ │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  │   │
│ │  [ Accept & Replace ]  [ Reject ]  [ Copy ]                  │   │
│ │                                                               │   │
│ │  Credits remaining: 99 • Powered by Gemini                   │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ Visual: Green checkmark, success state                             │
│ Action: User accepts → text replaced in page                       │
└─────────────────────────────────────────────────────────────────────┘

                     OR

┌─────────────────────────────────────────────────────────────────────┐
│ 5b. RESULT: WITH GRAMMAR ERRORS                                     │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │  ✨ Humanized (2 grammar issues found)                       │   │
│ │                                                               │   │
│ │  "Using AI technology helps [create] better [result]"        │   │
│ │                               ^^^^^^          ^^^^^^          │   │
│ │                               creates         results         │   │
│ │                                                               │   │
│ │  ⚠️ AI output has 2 grammar issues. Fix them?               │   │
│ │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  │   │
│ │  [ Fix All & Replace ]  [ Use As-Is ]  [ Review Each ]       │   │
│ │                                                               │   │
│ │  Credits remaining: 99 • Powered by Gemini                   │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ Visual: Yellow warning, underlined errors                          │
│ Action: User chooses fix strategy                                  │
└────────────────────┬────────────────────────────────────────────────┘
                     │ User clicks "Review Each"
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. GRAMMAR CORRECTION REVIEW                                        │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │  Issue 1 of 2                                                │   │
│ │                                                               │   │
│ │  "...helps create better result"                             │   │
│ │           ^^^^^^          ^^^^^^                              │   │
│ │           creates         results                             │   │
│ │                                                               │   │
│ │  Suggestion: "creates" → "create" (subject-verb agreement)   │   │
│ │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  │   │
│ │  [ Accept Fix ]  [ Ignore ]  [ Next → ]                      │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ Visual: Step-through interface for each grammar error              │
│ Action: User accepts/rejects each fix individually                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Alternative Flow 1: Grammar Check Only (Single Stage)

```
User selects text → Clicks "Fix Grammar" → Harper checks (50ms) → Show corrections
```

**Key Difference**: Single stage, no AI processing, instant results.

### Alternative Flow 2: Stage 2 Failure (Graceful Degradation)

```
Stage 1 ✅ → Stage 2 ❌ (Harper fails) → Show AI result WITHOUT grammar info

┌─────────────────────────────────────────────────────────────────┐
│  ✨ Humanized (Grammar check unavailable)                       │
│                                                                 │
│  "Using AI technology helps create better results"             │
│                                                                 │
│  ℹ️ Grammar checking failed. Review manually.                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━              │
│  [ Accept & Replace ]  [ Reject ]                              │
└─────────────────────────────────────────────────────────────────┘
```

**UX Principle**: Stage 1 success is valuable even if Stage 2 fails. Show the result.

---

## UI State Specifications

### State 1: Idle (Menu Visible)

**Trigger**: User selects text, 400ms debounce complete
**Duration**: Until user interaction

**Visual Design:**
```html
<div class="ghostwrite-menu" data-theme="auto">
  <button class="ghost-button" data-action="fix-grammar">
    <span class="ghost-icon">✓</span>
    <span class="ghost-label">Fix Grammar</span>
  </button>

  <button class="ghost-button" data-action="humanize">
    <span class="ghost-icon">✨</span>
    <span class="ghost-label">Humanize</span>
  </button>

  <button class="ghost-button" data-action="rewrite">
    <span class="ghost-icon">↻</span>
    <span class="ghost-label">Rewrite</span>
  </button>
</div>
```

**CSS Styling** (per design system):
- Background: `var(--ghost-bg)` with `backdrop-filter: blur(12px)`
- Border: `1px solid var(--ghost-border)`
- Shadow: `--ghost-shadow`
- Animation: Fade in 150ms

**Behavior:**
- Position 8px above selection (fallback: below if clipped)
- Dismiss on ESC, click outside, or action selected
- Keyboard navigation: Tab between buttons, Enter to select

---

### State 2: Stage 1 Loading (AI Processing)

**Trigger**: User clicks "Humanize" or "Rewrite"
**Duration**: ~500ms-2s (API dependent)

**Visual Design:**
```html
<div class="ghostwrite-progress" data-stage="ai-processing">
  <!-- Header -->
  <div class="ghost-progress-header">
    <div class="ghost-progress-icon">🤖</div>
    <div class="ghost-progress-title">AI Enhancement</div>
    <div class="ghost-progress-badge">1/2</div>
  </div>

  <!-- Progress Indicator -->
  <div class="ghost-progress-bar">
    <div class="ghost-progress-bar-fill" style="width: 45%"></div>
  </div>

  <!-- Status Message -->
  <div class="ghost-progress-message">
    Humanizing your text with Gemini...
  </div>

  <!-- Metadata -->
  <div class="ghost-progress-meta">
    <span class="ghost-meta-item">
      <span class="ghost-meta-label">Estimated:</span>
      <span class="ghost-meta-value">2s</span>
    </span>
    <span class="ghost-meta-item">
      <span class="ghost-meta-label">Credits:</span>
      <span class="ghost-meta-value">1</span>
    </span>
    <span class="ghost-meta-item">
      <span class="ghost-meta-label">Provider:</span>
      <span class="ghost-meta-value">Gemini</span>
    </span>
  </div>

  <!-- Cancel Button (optional) -->
  <button class="ghost-button-ghost ghost-progress-cancel">Cancel</button>
</div>
```

**Visual Specs:**
```css
.ghostwrite-progress {
  background: var(--ghost-bg);
  border: 1px solid var(--ghost-border);
  border-radius: var(--ghost-border-radius);
  padding: var(--space-4);
  min-width: 320px;
  backdrop-filter: blur(12px);
  box-shadow: var(--ghost-shadow-lg);
}

.ghost-progress-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.ghost-progress-icon {
  font-size: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

.ghost-progress-badge {
  margin-left: auto;
  background: var(--ghost-accent-bg);
  color: var(--ghost-accent-text);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
}

.ghost-progress-bar {
  height: 4px;
  background: var(--ghost-bg-secondary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--space-3);
}

.ghost-progress-bar-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--ghost-accent-solid),
    #8B5CF6
  );
  animation: progress-shimmer 2s ease-in-out infinite;
  transition: width 300ms var(--ease-in-out);
}

@keyframes progress-shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.ghost-progress-message {
  color: var(--ghost-text-secondary);
  font-size: var(--font-size-body);
  margin-bottom: var(--space-3);
}

.ghost-progress-meta {
  display: flex;
  gap: var(--space-4);
  font-size: var(--font-size-caption);
  color: var(--ghost-text-tertiary);
  padding-top: var(--space-3);
  border-top: 1px solid var(--ghost-border);
}
```

**Behavior:**
- Replace menu with progress UI (smooth transition)
- Progress bar: Indeterminate initially, then estimate-based if API provides timing
- Pulse animation on icon
- Cancel button aborts request and restores menu
- Prevent page interaction (overlay with backdrop)

**Progress Updates:**
- 0-30%: "Sending to AI..."
- 30-70%: "Processing with Gemini..." (or "OpenAI" if fallback)
- 70-100%: "Receiving results..."

---

### State 3: Stage Transition (AI → Grammar)

**Trigger**: AI processing complete, grammar check starting
**Duration**: ~50ms (usually skipped in UI, too fast)

**Design Decision**: **Skip this state visually** unless grammar check takes >200ms.

**Rationale:**
- Grammar checking is near-instant (50ms)
- Showing a flash of "checking grammar" creates visual noise
- Users perceive the entire pipeline as one action

**If shown (slow grammar check):**
```html
<div class="ghostwrite-progress" data-stage="grammar-checking">
  <div class="ghost-progress-header">
    <div class="ghost-progress-icon">✓</div>
    <div class="ghost-progress-title">Grammar Check</div>
    <div class="ghost-progress-badge">2/2</div>
  </div>

  <div class="ghost-progress-message">
    Checking AI output for grammar issues...
  </div>

  <!-- Simple spinner, no progress bar -->
  <div class="ghost-spinner-sm"></div>
</div>
```

**Alternative Approach**: Show AI result immediately with inline "Checking grammar..." indicator:

```html
<div class="ghostwrite-result" data-checking="true">
  <div class="ghost-result-header">
    <span class="ghost-result-title">✨ Humanized</span>
    <span class="ghost-result-status">
      <span class="ghost-spinner-xs"></span> Checking grammar...
    </span>
  </div>

  <div class="ghost-result-text">
    "Using AI technology helps create better results"
  </div>
</div>
```

Then update in-place when grammar check completes (50ms later).

---

### State 4a: Final Result - Clean (No Grammar Errors)

**Trigger**: Both stages complete, no grammar errors found
**Duration**: Until user interaction

**Visual Design:**
```html
<div class="ghostwrite-result" data-status="success">
  <!-- Header with Success Indicator -->
  <div class="ghost-result-header">
    <div class="ghost-result-icon ghost-result-icon--success">✨</div>
    <div class="ghost-result-title">Humanized & Grammar Checked</div>
    <button class="ghost-result-close" aria-label="Close">×</button>
  </div>

  <!-- AI-Processed Text -->
  <div class="ghost-result-text">
    Using AI technology helps create better results
  </div>

  <!-- Success Badge -->
  <div class="ghost-result-badge ghost-result-badge--success">
    <span class="ghost-badge-icon">✓</span>
    <span class="ghost-badge-text">No grammar issues found</span>
  </div>

  <!-- Divider -->
  <div class="ghost-result-divider"></div>

  <!-- Actions -->
  <div class="ghost-result-actions">
    <button class="ghost-button ghost-button-primary" data-action="accept">
      <span class="ghost-button-icon">✓</span>
      <span class="ghost-button-label">Accept & Replace</span>
    </button>
    <button class="ghost-button ghost-button-secondary" data-action="reject">
      Reject
    </button>
    <button class="ghost-button ghost-button-ghost" data-action="copy">
      <span class="ghost-button-icon">📋</span>
      Copy
    </button>
  </div>

  <!-- Metadata Footer -->
  <div class="ghost-result-footer">
    <span class="ghost-footer-item">
      <span class="ghost-footer-icon">💳</span>
      99 credits remaining
    </span>
    <span class="ghost-footer-separator">•</span>
    <span class="ghost-footer-item">
      Powered by Gemini
    </span>
  </div>
</div>
```

**Visual Specs:**
```css
.ghostwrite-result {
  background: var(--ghost-bg);
  border: 1px solid var(--ghost-border);
  border-radius: var(--ghost-border-radius);
  padding: var(--space-4);
  min-width: 400px;
  max-width: 600px;
  backdrop-filter: blur(12px);
  box-shadow: var(--ghost-shadow-lg);
  animation: scaleIn 200ms var(--ease-out);
}

.ghost-result-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.ghost-result-icon {
  font-size: 20px;
}

.ghost-result-icon--success {
  animation: successPop 400ms var(--ease-spring);
}

@keyframes successPop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.ghost-result-title {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-medium);
  color: var(--ghost-text-primary);
  flex: 1;
}

.ghost-result-text {
  background: var(--ghost-bg-secondary);
  border: 1px solid var(--ghost-border);
  border-radius: var(--ghost-border-radius-sm);
  padding: var(--space-3);
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
  color: var(--ghost-text-primary);
  margin-bottom: var(--space-4);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.ghost-result-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--ghost-border-radius-sm);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-4);
}

.ghost-result-badge--success {
  background: var(--ghost-success-bg);
  border: 1px solid var(--ghost-success-border);
  color: var(--ghost-success-text);
}

.ghost-result-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.ghost-result-footer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--ghost-border);
  font-size: var(--font-size-caption);
  color: var(--ghost-text-tertiary);
}
```

**Behavior:**
- Celebrate success with spring animation on icon
- Primary action: "Accept & Replace" (Enter key)
- Secondary actions: "Reject" (ESC key), "Copy" (Cmd/Ctrl+C)
- Accept → Replace selected text in page, show toast confirmation
- Reject → Close result, restore original menu
- Copy → Copy to clipboard, show toast "Copied!"

---

### State 4b: Final Result - With Grammar Errors

**Trigger**: Both stages complete, grammar errors found
**Duration**: Until user interaction

**Visual Design:**
```html
<div class="ghostwrite-result" data-status="warning">
  <!-- Header with Warning Indicator -->
  <div class="ghost-result-header">
    <div class="ghost-result-icon ghost-result-icon--warning">✨</div>
    <div class="ghost-result-title">Humanized</div>
    <div class="ghost-result-count">2 issues found</div>
    <button class="ghost-result-close" aria-label="Close">×</button>
  </div>

  <!-- AI-Processed Text with Inline Error Highlighting -->
  <div class="ghost-result-text ghost-result-text--with-errors">
    Using AI technology helps
    <span class="ghost-error" data-error-id="1" tabindex="0">
      create
      <span class="ghost-error-tooltip">
        <span class="ghost-error-message">Subject-verb agreement</span>
        <span class="ghost-error-suggestion">creates</span>
      </span>
    </span>
    better
    <span class="ghost-error" data-error-id="2" tabindex="0">
      result
      <span class="ghost-error-tooltip">
        <span class="ghost-error-message">Singular/plural mismatch</span>
        <span class="ghost-error-suggestion">results</span>
      </span>
    </span>
  </div>

  <!-- Warning Badge with Call-to-Action -->
  <div class="ghost-result-badge ghost-result-badge--warning">
    <span class="ghost-badge-icon">⚠️</span>
    <span class="ghost-badge-text">AI output has 2 grammar issues. Fix them?</span>
  </div>

  <!-- Divider -->
  <div class="ghost-result-divider"></div>

  <!-- Action Options -->
  <div class="ghost-result-actions">
    <button class="ghost-button ghost-button-primary" data-action="fix-all">
      <span class="ghost-button-icon">✓</span>
      <span class="ghost-button-label">Fix All & Replace</span>
    </button>
    <button class="ghost-button ghost-button-secondary" data-action="use-as-is">
      Use As-Is
    </button>
    <button class="ghost-button ghost-button-ghost" data-action="review-each">
      <span class="ghost-button-icon">👁️</span>
      Review Each
    </button>
  </div>

  <!-- Metadata Footer -->
  <div class="ghost-result-footer">
    <span class="ghost-footer-item">
      <span class="ghost-footer-icon">💳</span>
      99 credits remaining
    </span>
    <span class="ghost-footer-separator">•</span>
    <span class="ghost-footer-item">
      Powered by Gemini
    </span>
  </div>
</div>
```

**Visual Specs for Error Highlighting:**
```css
.ghost-error {
  position: relative;
  display: inline-block;
  border-bottom: 2px wavy var(--ghost-error-text);
  cursor: pointer;
  transition: background 200ms var(--ease-in-out);
}

.ghost-error:hover,
.ghost-error:focus {
  background: var(--ghost-error-bg);
  outline: none;
}

.ghost-error-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--ghost-bg);
  border: 1px solid var(--ghost-error-border);
  border-radius: var(--ghost-border-radius-sm);
  padding: var(--space-2) var(--space-3);
  box-shadow: var(--ghost-shadow);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms var(--ease-out);
  z-index: 1000;
}

.ghost-error:hover .ghost-error-tooltip,
.ghost-error:focus .ghost-error-tooltip {
  opacity: 1;
}

.ghost-error-tooltip::after {
  /* Arrow pointing down */
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--ghost-error-border);
}

.ghost-error-message {
  display: block;
  font-size: var(--font-size-caption);
  color: var(--ghost-text-secondary);
  margin-bottom: var(--space-1);
}

.ghost-error-suggestion {
  display: block;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--ghost-success-text);
}

.ghost-result-count {
  margin-left: auto;
  background: var(--ghost-warning-bg);
  color: var(--ghost-warning-text);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
}
```

**Interaction Behaviors:**

1. **Hover/Focus on Error**:
   - Show tooltip with error description and suggestion
   - Highlight error with background color
   - Keyboard accessible (Tab to navigate between errors)

2. **Click "Fix All & Replace"**:
   - Apply all grammar corrections automatically
   - Replace text in page with fully corrected version
   - Show success toast: "Text replaced (2 corrections applied)"
   - Close result panel

3. **Click "Use As-Is"**:
   - Replace text in page with AI output (ignore grammar errors)
   - Show confirmation toast: "Text replaced (grammar issues not fixed)"
   - Close result panel

4. **Click "Review Each"**:
   - Open step-through correction interface (see State 5)
   - Let user accept/reject each correction individually

**Accessibility:**
- Errors are keyboard navigable (Tab key)
- ARIA labels: `aria-label="Grammar error: {message}"`
- Screen reader announcement: "2 grammar issues found in AI output"

---

### State 5: Grammar Correction Review (Step-Through)

**Trigger**: User clicks "Review Each" from State 4b
**Duration**: Until all errors reviewed or user cancels

**Visual Design:**
```html
<div class="ghostwrite-correction-review">
  <!-- Progress Indicator -->
  <div class="ghost-review-progress">
    <div class="ghost-review-step">Issue 1 of 2</div>
    <div class="ghost-review-dots">
      <span class="ghost-dot ghost-dot--active"></span>
      <span class="ghost-dot"></span>
    </div>
  </div>

  <!-- Current Error Context -->
  <div class="ghost-review-context">
    <div class="ghost-review-text">
      "...helps
      <span class="ghost-review-error">create</span>
      better
      <span class="ghost-review-unchanged">result</span>"
    </div>
  </div>

  <!-- Error Details -->
  <div class="ghost-review-details">
    <div class="ghost-review-label">Issue:</div>
    <div class="ghost-review-message">Subject-verb agreement</div>

    <div class="ghost-review-correction">
      <span class="ghost-review-before">create</span>
      <span class="ghost-review-arrow">→</span>
      <span class="ghost-review-after">creates</span>
    </div>
  </div>

  <!-- Divider -->
  <div class="ghost-result-divider"></div>

  <!-- Actions -->
  <div class="ghost-review-actions">
    <button class="ghost-button ghost-button-primary" data-action="accept">
      <span class="ghost-button-icon">✓</span>
      Accept Fix
    </button>
    <button class="ghost-button ghost-button-secondary" data-action="ignore">
      Ignore
    </button>
    <button class="ghost-button ghost-button-ghost" data-action="next">
      Next →
    </button>
  </div>

  <!-- Footer with Cancel -->
  <div class="ghost-review-footer">
    <button class="ghost-button-ghost" data-action="cancel">
      Cancel Review
    </button>
  </div>
</div>
```

**Visual Specs:**
```css
.ghostwrite-correction-review {
  background: var(--ghost-bg);
  border: 1px solid var(--ghost-border);
  border-radius: var(--ghost-border-radius);
  padding: var(--space-4);
  min-width: 400px;
  backdrop-filter: blur(12px);
  box-shadow: var(--ghost-shadow-lg);
}

.ghost-review-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--ghost-border);
}

.ghost-review-step {
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-medium);
  color: var(--ghost-text-primary);
}

.ghost-review-dots {
  display: flex;
  gap: var(--space-1);
}

.ghost-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ghost-bg-secondary);
  transition: background 200ms var(--ease-in-out);
}

.ghost-dot--active {
  background: var(--ghost-accent-solid);
}

.ghost-review-context {
  background: var(--ghost-bg-secondary);
  border: 1px solid var(--ghost-border);
  border-radius: var(--ghost-border-radius-sm);
  padding: var(--space-3);
  margin-bottom: var(--space-4);
}

.ghost-review-text {
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
  color: var(--ghost-text-primary);
}

.ghost-review-error {
  background: var(--ghost-error-bg);
  border-bottom: 2px solid var(--ghost-error-text);
  padding: 2px 4px;
  border-radius: 2px;
  font-weight: var(--font-weight-medium);
}

.ghost-review-unchanged {
  color: var(--ghost-text-tertiary);
}

.ghost-review-details {
  margin-bottom: var(--space-4);
}

.ghost-review-label {
  font-size: var(--font-size-caption);
  color: var(--ghost-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-1);
}

.ghost-review-message {
  font-size: var(--font-size-body);
  color: var(--ghost-text-secondary);
  margin-bottom: var(--space-3);
}

.ghost-review-correction {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--ghost-bg-secondary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--ghost-border-radius-sm);
}

.ghost-review-before {
  color: var(--ghost-error-text);
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

.ghost-review-arrow {
  color: var(--ghost-text-tertiary);
  font-size: 16px;
}

.ghost-review-after {
  color: var(--ghost-success-text);
  font-weight: var(--font-weight-medium);
  background: var(--ghost-success-bg);
  padding: 2px 6px;
  border-radius: 4px;
}
```

**Keyboard Shortcuts:**
- **Enter**: Accept current fix, move to next
- **N**: Ignore current, move to next
- **ESC**: Cancel review, return to State 4b
- **← →**: Navigate between errors

**State Management:**
```javascript
const reviewState = {
  currentIndex: 0,
  totalErrors: 2,
  decisions: [], // Track accept/ignore for each error
  originalText: "...",
  errors: [
    { span: [20, 26], message: "...", suggestion: "creates" },
    { span: [34, 40], message: "...", suggestion: "results" }
  ]
};
```

**After Last Error:**
- Show summary: "Review complete. 1 fix accepted, 1 ignored."
- Apply accepted fixes to text
- Return to result view with corrected text

---

### State 6: Success Confirmation (Toast)

**Trigger**: User accepts result and text is replaced
**Duration**: 3 seconds (auto-dismiss)

**Visual Design:**
```html
<div class="ghostwrite-toast ghostwrite-toast--success">
  <div class="ghost-toast-icon">✓</div>
  <div class="ghost-toast-message">
    <div class="ghost-toast-title">Text replaced</div>
    <div class="ghost-toast-subtitle">2 corrections applied</div>
  </div>
  <button class="ghost-toast-close" aria-label="Dismiss">×</button>
</div>
```

**Positioning:**
- Fixed bottom-right of viewport
- Stacks if multiple toasts
- Slide up animation

**Visual Specs:**
```css
.ghostwrite-toast {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  background: var(--ghost-bg);
  border: 1px solid var(--ghost-border);
  border-radius: var(--ghost-border-radius);
  padding: var(--space-3);
  box-shadow: var(--ghost-shadow-lg);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 280px;
  animation: slideUp 200ms var(--ease-out);
  z-index: 10000;
}

.ghostwrite-toast--success {
  border-left: 3px solid var(--ghost-success-text);
}

.ghost-toast-icon {
  width: 32px;
  height: 32px;
  background: var(--ghost-success-bg);
  color: var(--ghost-success-text);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.ghost-toast-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--ghost-text-primary);
}

.ghost-toast-subtitle {
  font-size: var(--font-size-caption);
  color: var(--ghost-text-secondary);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Auto-Dismiss:**
- 3 seconds by default
- Pause timer on hover
- Click to dismiss immediately
- Fade out animation on dismiss

---

## Loading States & Transitions

### Loading Principles

1. **Immediate Feedback**: UI responds within 100ms of user action
2. **Progressive Enhancement**: Show progress, not just spinners
3. **Skeleton Content**: Prefer skeleton loaders to blank states
4. **Optimistic Updates**: Assume success, handle errors gracefully
5. **Smooth Transitions**: All state changes animated (150-300ms)

### Transition Matrix

| From State | To State | Animation | Duration | Trigger |
|------------|----------|-----------|----------|---------|
| Idle Menu | Stage 1 Loading | Morph + Scale | 200ms | User clicks action |
| Stage 1 Loading | Stage 2 Loading | Update in place | 150ms | API response received |
| Stage 1 Loading | Error State | Shake + Color change | 300ms | API error |
| Stage 2 Loading | Result (Clean) | Fade + Scale | 200ms | Grammar check complete |
| Stage 2 Loading | Result (Errors) | Fade + Scale | 200ms | Grammar check complete |
| Result | Toast | Slide up | 200ms | User accepts |
| Result | Idle Menu | Fade out | 150ms | User rejects |

### Loading State UX Requirements

**Stage 1 (AI Processing):**
- Show provider name (Gemini/OpenAI)
- Show credit cost (1 credit)
- Show estimated time (if available)
- Progress bar (indeterminate or estimate-based)
- Cancel button (abort request)
- Prevent duplicate submissions

**Stage 2 (Grammar Check):**
- Usually too fast to show (50ms)
- If shown: Simple spinner, no progress bar
- "Checking grammar..." message
- No cancel option (too fast)

**Transition Between Stages:**
- **Option A (Recommended)**: Skip visual transition, users perceive as one action
- **Option B**: Flash "✓ AI complete" badge for 100ms before grammar check
- **Option C**: Show AI result with inline "Checking grammar..." badge

**Recommendation**: Use Option A for performance, Option C if grammar check >200ms.

---

## Grammar Error Display System

### Design Philosophy

**Goal**: Make grammar errors on AI-processed text:
1. **Visible** - Immediately obvious there are issues
2. **Understandable** - Clear what the issue is and how to fix it
3. **Actionable** - Easy to accept/reject fixes
4. **Non-blocking** - Users can use AI text as-is if they want
5. **Educational** - Users learn why the error occurred

### Error Highlighting Methods

**Method 1: Inline Underline (Recommended)**
```html
Using AI technology helps <span class="ghost-error">create</span> better results
```
- Red wavy underline (similar to Microsoft Word)
- Tooltip on hover shows suggestion
- Keyboard accessible (Tab to navigate)
- Works for 1-10 errors
- **Pros**: Familiar, unobtrusive, precise
- **Cons**: Can be hard to see with many errors

**Method 2: Badge Count**
```html
<div class="ghost-error-badge">⚠️ 2 grammar issues</div>
```
- Summary badge at top of result
- Click to expand detailed view
- Works for any number of errors
- **Pros**: Clean, scalable, not overwhelming
- **Cons**: Less precise, requires extra click

**Method 3: Side-by-Side Comparison**
```
AI Output (with errors):      |  Corrected Version:
"...helps create better      |  "...helps creates better
result"                       |  results"
```
- Split-pane view
- Highlights differences
- Works for significant changes
- **Pros**: Clear comparison, educational
- **Cons**: Takes more space, overkill for small errors

**Recommendation**: Use **Method 1** (inline underline) for ≤5 errors, **Method 2** (badge count) for >5 errors.

### Error Tooltip Design

**Anatomy:**
```
┌─────────────────────────────┐
│ Subject-verb agreement      │ ← Error category
│ ───────────────────────────┤
│ create → creates            │ ← Before → After
│                             │
│ "helps creates" is correct  │ ← Explanation (optional)
└─────────────────────────────┘
```

**Content Guidelines:**
- **Category**: Short label (e.g., "Subject-verb agreement", "Spelling")
- **Correction**: Show before → after
- **Explanation**: Optional 1-sentence why (for education)
- **Keep it brief**: Max 2 lines of text

**Example Tooltips:**
```
┌───────────────────────┐
│ Spelling              │
│ recieve → receive     │
└───────────────────────┘

┌───────────────────────────────────┐
│ Singular/plural mismatch          │
│ result → results                  │
│ "better" applies to plural        │
└───────────────────────────────────┘

┌───────────────────────┐
│ Missing article       │
│ → the result          │
│ Add "the" before noun │
└───────────────────────┘
```

### Action Strategies

**Strategy 1: Fix All (Recommended Default)**
- Button: "Fix All & Replace"
- Applies all corrections automatically
- Fastest path to corrected text
- Best for users who trust the grammar checker
- **When to use**: 1-5 errors, high confidence corrections

**Strategy 2: Review Each**
- Button: "Review Each"
- Step-through interface (see State 5)
- User accepts/rejects each fix individually
- Educational, gives user control
- **When to use**: >3 errors, or user wants control

**Strategy 3: Use As-Is**
- Button: "Use As-Is"
- Ignores all grammar errors
- Uses AI output unchanged
- Respects user's decision to override
- **When to use**: User disagrees with corrections, or intentional "errors" (e.g., creative writing)

**Default Recommendation**:
- 1-3 errors: Show all strategies, default to "Fix All"
- 4-10 errors: Emphasize "Review Each", allow "Fix All"
- >10 errors: Hide "Fix All", require "Review Each" or "Use As-Is"

### Edge Cases

**Case 1: AI introduces errors**
- Scenario: Original text was correct, AI version has errors
- UX: Show warning badge "AI introduced 2 new grammar issues"
- Action: Offer "Revert to Original" button

**Case 2: Too many errors (>20)**
- Scenario: AI output is very broken grammatically
- UX: Show warning "AI output has significant grammar issues (20+)"
- Action: Suggest "Try Rewrite instead" or "Use original text"
- Recommendation: Don't show inline underlines (too cluttered), use summary view

**Case 3: No grammar context**
- Scenario: Harper fails to load, can't check grammar
- UX: Show "Grammar checking unavailable" badge
- Action: User can still use AI output, just without grammar verification

**Case 4: False positives**
- Scenario: Harper flags correct text as error (e.g., proper nouns, technical terms)
- UX: Allow user to ignore and learn from rejections
- Future: Implement "Add to dictionary" feature

---

## Value Communication Strategy

### Problem Statement

Users might not understand they're getting **two services in one click**:
1. AI enhancement (humanize/rewrite)
2. Automatic grammar checking

**Without clear communication**, users may:
- Not realize grammar checking is happening
- Undervalue the service ("Why am I paying for this?")
- Miss the competitive advantage vs. other tools

### Value Proposition

**Core Message:**
> "AI enhancement + grammar perfection in one click"

**Benefits:**
- Saves time (no need for separate grammar check)
- Better results (AI output is automatically polished)
- Professional quality (confidence in final text)
- Competitive advantage (no other tool does this)

### Communication Touchpoints

**Touchpoint 1: First-Time User Experience**

When user clicks "Humanize" for the first time, show educational tooltip:

```
┌─────────────────────────────────────────────────┐
│ ✨ Two-Stage Pipeline                           │
│                                                 │
│ 1. AI Enhancement (Gemini/OpenAI)              │
│    Makes text natural and engaging             │
│                                                 │
│ 2. Automatic Grammar Check (Harper)            │
│    Ensures perfection                          │
│                                                 │
│ Both happen automatically in one click!        │
│                                                 │
│ [ Got it! ]  [ Don't show again ]              │
└─────────────────────────────────────────────────┘
```

**Touchpoint 2: Loading State**

During processing, reinforce the value:

```
🤖 AI Enhancement (1/2)
Humanizing your text with Gemini...
━━━━━━━━━━━━━━━ 65%

Next: Automatic grammar check ✓
```

**Touchpoint 3: Result Display**

In result header, emphasize combined service:

```
✨ Humanized & Grammar Checked
✓ No grammar issues found

AI enhanced + grammar perfected in 1.8 seconds
```

**Touchpoint 4: Settings/Popup UI**

Show pipeline as a feature:

```
┌────────────────────────────────────┐
│ GhostWrite Features                │
├────────────────────────────────────┤
│ ✅ Two-Stage Pipeline              │
│    AI enhancement + auto grammar   │
│                                    │
│    Every AI action includes:       │
│    1. Smart rewriting (Gemini)     │
│    2. Grammar perfection (Harper)  │
│                                    │
│    Result: Professional text,      │
│    every time.                     │
└────────────────────────────────────┘
```

**Touchpoint 5: Marketing Copy**

Chrome Web Store description:

> **Unique Two-Stage Pipeline**
>
> Unlike other tools, GhostWrite doesn't just humanize your text—it perfects it.
>
> 1. AI Enhancement: Gemini/OpenAI makes your text natural and engaging
> 2. Auto Grammar Check: Harper catches any grammar issues instantly
>
> Result: Professional, polished text in one click. No second-guessing.

### Visual Metaphors

**Pipeline Icon:**
```
┌─────┐    ┌─────┐    ┌─────┐
│ AI  │ →  │ ✓   │ →  │ ✨  │
│ 🤖  │    │ ABC │    │Done │
└─────┘    └─────┘    └─────┘
```

**Progress Dots:**
```
Stage 1: ● ○ ○  (AI processing)
Stage 2: ● ● ○  (Grammar check)
Complete: ● ● ●  (Ready)
```

**Badge System:**
```
✨ AI Enhanced        (Stage 1 complete)
✓ Grammar Checked     (Stage 2 complete)
🎯 Perfected          (Both complete)
```

### Metrics to Track

To validate value communication effectiveness:

1. **Awareness**: % users who know two stages happen (survey)
2. **Perception**: % users who find it valuable (NPS question)
3. **Retention**: Higher retention for users who understand pipeline
4. **Conversion**: Trial-to-paid conversion for "perfected text" messaging

---

## Error Handling UX

### Error Taxonomy

**Stage 1 Errors (AI Processing)**

| Error Type | HTTP Code | Cause | User Impact |
|------------|-----------|-------|-------------|
| No credits | 402 | User out of credits | Cannot use AI features |
| Invalid API key | 401 | Bad authentication | Cannot use AI features |
| Rate limit | 429 | Too many requests | Temporary block |
| Service outage | 503 | Gemini + OpenAI both down | Cannot use AI features |
| Network error | - | User offline | Cannot reach API |
| Timeout | 408 | Slow API response | Request failed |
| Invalid input | 400 | Text too long/short | Cannot process |

**Stage 2 Errors (Grammar Check)**

| Error Type | Cause | User Impact |
|------------|-------|-------------|
| Harper not loaded | WASM failed to load | No grammar checking |
| Grammar check crash | Harper internal error | No grammar results |
| Timeout | Text too long (>50k words) | No grammar results |

### Error State UX Patterns

**Pattern 1: Blocking Error (Cannot Proceed)**

Used for: No credits, Invalid API key, Service outage

```html
<div class="ghostwrite-error" data-severity="blocking">
  <!-- Icon -->
  <div class="ghost-error-icon">⚠️</div>

  <!-- Message -->
  <div class="ghost-error-content">
    <div class="ghost-error-title">No credits remaining</div>
    <div class="ghost-error-message">
      You've used all your credits. Buy more to continue using AI features.
    </div>
  </div>

  <!-- Actions -->
  <div class="ghost-error-actions">
    <button class="ghost-button ghost-button-primary" data-action="buy-credits">
      <span class="ghost-button-icon">💳</span>
      Buy Credits
    </button>
    <button class="ghost-button ghost-button-secondary" data-action="close">
      Close
    </button>
  </div>

  <!-- Footer -->
  <div class="ghost-error-footer">
    <a href="#" class="ghost-link">Learn about pricing</a>
  </div>
</div>
```

**Visual Specs:**
```css
.ghostwrite-error {
  background: var(--ghost-bg);
  border: 1px solid var(--ghost-error-border);
  border-left: 3px solid var(--ghost-error-text);
  border-radius: var(--ghost-border-radius);
  padding: var(--space-4);
  min-width: 360px;
  animation: shake 300ms ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.ghost-error-icon {
  font-size: 32px;
  margin-bottom: var(--space-3);
}

.ghost-error-title {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-medium);
  color: var(--ghost-text-primary);
  margin-bottom: var(--space-2);
}

.ghost-error-message {
  font-size: var(--font-size-body);
  color: var(--ghost-text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--space-4);
}
```

**Pattern 2: Non-Blocking Warning (Can Proceed with Degradation)**

Used for: Grammar check failure, Slow API

```html
<div class="ghostwrite-result" data-status="warning">
  <!-- Result with Warning Badge -->
  <div class="ghost-result-header">
    <div class="ghost-result-icon">✨</div>
    <div class="ghost-result-title">Humanized</div>
    <div class="ghost-warning-badge">
      <span class="ghost-badge-icon">ℹ️</span>
      Grammar check unavailable
    </div>
  </div>

  <!-- AI Result -->
  <div class="ghost-result-text">
    Using AI technology helps create better results
  </div>

  <!-- Warning Message -->
  <div class="ghost-warning-message">
    <span class="ghost-warning-icon">⚠️</span>
    <span class="ghost-warning-text">
      Grammar checking failed. Please review manually.
    </span>
  </div>

  <!-- Actions -->
  <div class="ghost-result-actions">
    <button class="ghost-button ghost-button-primary">
      Accept & Replace
    </button>
    <button class="ghost-button ghost-button-secondary">
      Reject
    </button>
  </div>
</div>
```

**Pattern 3: Retry with Fallback**

Used for: API timeout, Network error

```html
<div class="ghostwrite-error" data-severity="retry">
  <div class="ghost-error-icon">🔄</div>

  <div class="ghost-error-content">
    <div class="ghost-error-title">Request timed out</div>
    <div class="ghost-error-message">
      The AI service took too long to respond. Try again?
    </div>
  </div>

  <div class="ghost-error-actions">
    <button class="ghost-button ghost-button-primary" data-action="retry">
      <span class="ghost-button-icon">🔄</span>
      Retry
    </button>
    <button class="ghost-button ghost-button-secondary" data-action="fallback">
      Use Grammar Check Only
    </button>
    <button class="ghost-button ghost-button-ghost" data-action="cancel">
      Cancel
    </button>
  </div>
</div>
```

### Error Messages by Scenario

**Scenario: Stage 1 Success, Stage 2 Failure**

```
✨ Humanized (Grammar check unavailable)

AI enhancement complete, but grammar checking failed.
The text below has been improved but not grammar-checked.

[AI-processed text here]

ℹ️ Please review manually for grammar errors

[ Accept & Replace ]  [ Reject ]
```

**Rationale**: Stage 1 provides value even without Stage 2. Don't throw away AI work.

**Scenario: Stage 1 Failure (Gemini), Fallback to OpenAI**

```
🤖 AI Enhancement (1/2)
Primary service unavailable, using backup...
━━━━━━━━━━━━━━━ 75%

Provider: OpenAI (backup)
```

**User sees**: Transparent fallback, no error unless both fail.

**Scenario: Both Stages Fail**

```
⚠️ AI service temporarily unavailable

We couldn't process your request right now.
Both primary (Gemini) and backup (OpenAI) services are unavailable.

Your credits were not deducted.

[ Try Grammar Check Only ]  [ Try Again Later ]  [ Close ]
```

**Fallback action**: Offer basic grammar check (Harper only, free).

**Scenario: Network Offline**

```
🌐 You're offline

AI features require an internet connection.
Grammar checking still works (it runs locally).

[ Use Grammar Check ]  [ Close ]
```

**Scenario: Input Too Long**

```
⚠️ Text too long

Maximum length: 10,000 characters
Your selection: 15,847 characters

Split your text into smaller chunks and try again.

[ Close ]
```

**Scenario: Invalid API Key**

```
🔑 Invalid API key

Your API key is invalid or has been revoked.
Please check your settings.

[ Open Settings ]  [ Learn More ]  [ Close ]
```

### Error Recovery Flows

**Flow 1: Credit Depletion**

```
User clicks "Humanize"
  → No credits error
  → Show "Buy Credits" CTA
  → User clicks → Opens Stripe checkout
  → Purchase complete → Credits updated
  → Return to extension → Retry action automatically
```

**Flow 2: Temporary Service Outage**

```
User clicks "Humanize"
  → Service 503 error
  → Show "Try again in a few minutes" message
  → User clicks "Retry" → Exponential backoff (5s, 15s, 45s)
  → Service recovers → Request succeeds
```

**Flow 3: Harper Load Failure**

```
Extension loads → Harper fails to load
  → Disable grammar features in UI
  → Show warning badge in popup
  → User clicks "Fix Grammar" → Show reload prompt
  → User reloads extension → Harper loads successfully
```

### Error Logging & Analytics

**Log to Console:**
```javascript
console.error('[GhostWrite] Stage 1 failed:', {
  action: 'humanize',
  error: error.message,
  provider: 'gemini',
  fallbackAttempted: true,
  timestamp: Date.now()
});
```

**Track in Analytics:**
- Error rate by stage (Stage 1 vs Stage 2)
- Error type distribution (credits, service outage, timeout)
- Recovery success rate (retries that succeed)
- Fallback usage (Gemini → OpenAI frequency)

---

## Technical Implementation Guide

### Frontend Architecture

**File Structure:**
```
/extension/
  ├── background.js           # Service worker, capability manager
  ├── content-script.js       # Text selection, menu injection
  ├── ui/
  │   ├── menu.js             # Ghost menu component
  │   ├── progress.js         # Loading states component
  │   ├── result.js           # Result display component
  │   ├── correction.js       # Grammar correction UI
  │   └── toast.js            # Toast notifications
  ├── styles/
  │   ├── design-tokens.css   # CSS variables from design system
  │   ├── menu.css
  │   ├── progress.css
  │   ├── result.css
  │   └── toast.css
  └── utils/
      ├── text-replacement.js # DOM manipulation helpers
      └── state-manager.js    # UI state management
```

### Component API Design

**Menu Component:**
```javascript
class GhostMenu {
  constructor(options = {}) {
    this.position = options.position;
    this.capabilities = options.capabilities; // Which buttons to show
    this.onAction = options.onAction; // Callback when button clicked
  }

  show(nearElement) {
    // Position menu near element
    // Fade in animation
  }

  hide() {
    // Fade out animation
    // Remove from DOM
  }

  updateCapabilities(capabilities) {
    // Enable/disable AI features based on credits
  }
}
```

**Progress Component:**
```javascript
class ProgressIndicator {
  constructor(options = {}) {
    this.stages = options.stages; // ['ai', 'grammar']
    this.onCancel = options.onCancel;
  }

  setStage(stage, progress) {
    // Update UI for current stage
    // stage: 'ai' | 'grammar'
    // progress: 0-100 or 'indeterminate'
  }

  setMessage(message) {
    // Update status message
  }

  setMetadata(data) {
    // Update credits, provider, etc.
  }
}
```

**Result Component:**
```javascript
class ResultDisplay {
  constructor(options = {}) {
    this.text = options.text;
    this.grammarErrors = options.grammarErrors;
    this.provider = options.provider;
    this.credits = options.credits;
    this.onAccept = options.onAccept;
    this.onReject = options.onReject;
  }

  render() {
    // Render result based on grammarErrors.length
    // 0 errors: Clean result (State 4a)
    // 1+ errors: Result with errors (State 4b)
  }

  highlightErrors(errors) {
    // Add inline underlines to text
    // Attach tooltips
  }

  showCorrectionReview() {
    // Open step-through interface (State 5)
  }
}
```

### State Management

**Global State:**
```javascript
const AppState = {
  currentView: 'idle', // 'idle' | 'processing' | 'result' | 'error'
  pipeline: {
    stage: null, // null | 'ai' | 'grammar'
    progress: 0,
    aiResult: null,
    grammarErrors: null,
    error: null
  },
  capabilities: {
    harperLoaded: true,
    apiConnected: true,
    credits: 99
  },
  selectedText: '',
  originalRange: null // DOM range for text replacement
};
```

**State Transitions:**
```javascript
function transitionState(newView, data = {}) {
  const transitions = {
    'idle → processing': () => {
      hideMenu();
      showProgress({ stage: 'ai', progress: 0 });
    },
    'processing → result': () => {
      hideProgress();
      showResult(data);
    },
    'processing → error': () => {
      hideProgress();
      showError(data.error);
    },
    'result → idle': () => {
      hideResult();
      showMenu();
    }
  };

  const key = `${AppState.currentView} → ${newView}`;
  if (transitions[key]) {
    transitions[key]();
    AppState.currentView = newView;
  }
}
```

### Integration with capability-manager.js

**Add Progress Callbacks:**

Current implementation (lines 313-374) is synchronous. Need to add progress hooks:

```javascript
// Enhanced humanizeText with progress callbacks
async humanizeText(text, options = {}) {
  const { onProgress } = options;

  // Report stage 1 start
  onProgress?.({ stage: 'ai', progress: 0, message: 'Starting AI processing...' });

  try {
    // STAGE 1: AI Humanization
    onProgress?.({ stage: 'ai', progress: 30, message: 'Sending to Gemini...' });

    const response = await fetch(`${this.apiEndpoint}/api/humanize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ text, action: 'humanize' })
    });

    onProgress?.({ stage: 'ai', progress: 70, message: 'Receiving AI results...' });

    const data = await response.json();

    onProgress?.({ stage: 'ai', progress: 100, message: 'AI processing complete' });

    // STAGE 2: Automatic Grammar Check
    let grammarErrors = [];
    if (data.should_check_grammar && this.state.harper.loaded) {
      onProgress?.({ stage: 'grammar', progress: 0, message: 'Checking grammar...' });

      grammarErrors = await this.checkGrammar(data.result);

      onProgress?.({ stage: 'grammar', progress: 100, message: 'Grammar check complete' });
    }

    // Return complete result
    return {
      text: data.result,
      grammarErrors: grammarErrors,
      provider: data.provider,
      creditsRemaining: data.credits_remaining,
      pipelineComplete: true
    };

  } catch (error) {
    onProgress?.({ stage: 'error', error: error.message });
    throw error;
  }
}
```

**Usage in content-script.js:**

```javascript
// When user clicks "Humanize"
const progressUI = new ProgressIndicator({
  stages: ['ai', 'grammar'],
  onCancel: () => abortRequest()
});

progressUI.show();

try {
  const result = await capabilityManager.humanizeText(selectedText, {
    onProgress: (status) => {
      if (status.stage === 'ai') {
        progressUI.setStage('ai', status.progress);
        progressUI.setMessage(status.message);
      } else if (status.stage === 'grammar') {
        progressUI.setStage('grammar', status.progress);
        progressUI.setMessage(status.message);
      }
    }
  });

  progressUI.hide();

  const resultUI = new ResultDisplay({
    text: result.text,
    grammarErrors: result.grammarErrors,
    provider: result.provider,
    credits: result.creditsRemaining,
    onAccept: () => replaceTextInPage(result.text),
    onReject: () => closeResult()
  });

  resultUI.show();

} catch (error) {
  progressUI.hide();
  showError(error);
}
```

### Text Replacement Logic

**Challenge**: Replacing text in page without breaking DOM structure.

**Solution**: Use Range API

```javascript
function replaceTextInPage(newText, originalRange) {
  // Store original range when user selects text
  if (!originalRange || !originalRange.startContainer) {
    console.error('Invalid range');
    return false;
  }

  try {
    // Delete original content
    originalRange.deleteContents();

    // Insert new text
    const textNode = document.createTextNode(newText);
    originalRange.insertNode(textNode);

    // Clear selection
    window.getSelection().removeAllRanges();

    // Show success toast
    showToast({
      type: 'success',
      title: 'Text replaced',
      subtitle: 'Changes applied to page'
    });

    return true;

  } catch (error) {
    console.error('Text replacement failed:', error);
    showToast({
      type: 'error',
      title: 'Replacement failed',
      subtitle: 'Could not update text. Try copying instead.'
    });
    return false;
  }
}
```

**Edge Cases:**
- Selected text spans multiple elements
- Text in contenteditable div
- Text in input/textarea
- Text in readonly field

**Solution**: Detect context and adapt:

```javascript
function getReplacementStrategy(range) {
  const container = range.commonAncestorContainer;

  // Check if inside input/textarea
  const inputElement = container.closest?.('input, textarea');
  if (inputElement) {
    return {
      type: 'input',
      element: inputElement,
      replace: (text) => {
        const start = inputElement.selectionStart;
        const end = inputElement.selectionEnd;
        inputElement.setRangeText(text, start, end, 'end');
      }
    };
  }

  // Check if contenteditable
  const editableElement = container.closest?.('[contenteditable="true"]');
  if (editableElement) {
    return {
      type: 'contenteditable',
      element: editableElement,
      replace: (text) => {
        document.execCommand('insertText', false, text);
      }
    };
  }

  // Regular DOM text node
  return {
    type: 'text',
    replace: (text) => {
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
    }
  };
}
```

---

## Recommendations & Improvements

### High Priority Recommendations

**1. Show Intermediate AI Result (If Grammar Check >200ms)**

**Current**: Users see one long loading state
**Improved**: Show AI result immediately, then update with grammar info

```javascript
// After Stage 1 completes
const aiResult = await apiCall();

// Show immediately (don't wait for grammar check)
showResult({
  text: aiResult.result,
  grammarErrors: null, // Not checked yet
  status: 'checking-grammar'
});

// Run Stage 2 in background
const grammarErrors = await checkGrammar(aiResult.result);

// Update result in-place
updateResult({
  grammarErrors: grammarErrors,
  status: 'complete'
});
```

**Benefit**: Perceived performance improvement, users see AI work immediately.

---

**2. Add "Auto-Fix All" Preference**

**Current**: User must choose action for every result with errors
**Improved**: Remember user preference

```javascript
const settings = {
  autoFixGrammar: true, // Auto-apply all grammar corrections
  reviewThreshold: 5    // If >5 errors, always ask user
};

if (grammarErrors.length > 0) {
  if (settings.autoFixGrammar && grammarErrors.length <= settings.reviewThreshold) {
    // Automatically apply fixes
    const correctedText = applyAllFixes(text, grammarErrors);
    replaceTextInPage(correctedText);
    showToast({
      type: 'success',
      title: 'Text replaced',
      subtitle: `${grammarErrors.length} corrections applied automatically`
    });
  } else {
    // Show review UI
    showResult(text, grammarErrors);
  }
}
```

**UI for Setting:**
```
Extension Popup → Settings

┌─────────────────────────────────────┐
│ Grammar Correction Preference       │
├─────────────────────────────────────┤
│ ☑ Auto-fix all grammar errors      │
│   Automatically apply corrections   │
│   when ≤5 errors found             │
│                                     │
│ Review threshold: [5] errors        │
│                                     │
│ ☐ Always ask before fixing         │
└─────────────────────────────────────┘
```

**Benefit**: Power users save time, default users maintain control.

---

**3. Show Comparison View (Before/After)**

**Current**: Only final result shown
**Improved**: Side-by-side comparison option

```html
<div class="ghostwrite-comparison">
  <div class="ghost-comparison-header">
    <button class="ghost-view-toggle" data-view="side-by-side">
      <span class="ghost-toggle-icon">⚖️</span>
      Compare
    </button>
  </div>

  <div class="ghost-comparison-content" data-view="side-by-side">
    <!-- Original -->
    <div class="ghost-comparison-panel">
      <div class="ghost-comparison-label">Original</div>
      <div class="ghost-comparison-text">
        The utilization of AI technology facilitates better outcomes
      </div>
    </div>

    <!-- Arrow -->
    <div class="ghost-comparison-arrow">→</div>

    <!-- Improved -->
    <div class="ghost-comparison-panel">
      <div class="ghost-comparison-label">Improved</div>
      <div class="ghost-comparison-text">
        Using AI technology helps create better results
      </div>
    </div>
  </div>
</div>
```

**Benefit**: Educational, helps users understand AI improvements, builds trust.

---

**4. Implement Smart Progress Estimation**

**Current**: Indeterminate progress bar
**Improved**: Estimate based on text length and provider

```javascript
function estimateProcessingTime(text, provider) {
  const wordCount = text.split(/\s+/).length;

  // Empirical data (adjust based on real metrics)
  const timePerWord = {
    gemini: 0.01, // 10ms per word
    openai: 0.02  // 20ms per word
  };

  const baseTime = 500; // 500ms overhead (network, etc.)
  const estimated = baseTime + (wordCount * timePerWord[provider] * 1000);

  return Math.min(estimated, 5000); // Cap at 5 seconds
}

// Usage
const estimatedTime = estimateProcessingTime(selectedText, 'gemini');
progressUI.setEstimate(estimatedTime);

// Simulate progress
let progress = 0;
const interval = setInterval(() => {
  progress += (100 / (estimatedTime / 100));
  progressUI.setProgress(Math.min(progress, 90)); // Never reach 100% until actually complete
}, 100);

// When API responds, jump to 100%
await apiCall();
clearInterval(interval);
progressUI.setProgress(100);
```

**Benefit**: Reduces perceived wait time, manages user expectations.

---

**5. Add Undo/Redo Support**

**Current**: No way to undo accepted changes
**Improved**: Undo toast after replacement

```javascript
let undoStack = [];

function replaceTextInPage(newText, originalText, range) {
  // Store undo info
  undoStack.push({
    range: range.cloneRange(),
    oldText: originalText,
    newText: newText,
    timestamp: Date.now()
  });

  // Perform replacement
  doReplacement(newText, range);

  // Show toast with Undo button
  showToast({
    type: 'success',
    title: 'Text replaced',
    actions: [
      {
        label: 'Undo',
        onClick: () => undoLastReplacement()
      }
    ],
    duration: 5000 // 5 seconds to undo
  });
}

function undoLastReplacement() {
  const lastAction = undoStack.pop();
  if (!lastAction) return;

  // Revert to original text
  doReplacement(lastAction.oldText, lastAction.range);

  showToast({
    type: 'info',
    title: 'Undo successful',
    subtitle: 'Original text restored'
  });
}
```

**Benefit**: Safety net, reduces user anxiety about accepting changes.

---

### Medium Priority Recommendations

**6. Grammar Error Severity Levels**

Categorize errors by severity:
- **Critical**: Factual errors, meaning changes (red)
- **Important**: Grammar, clarity issues (yellow)
- **Stylistic**: Suggestions, optional improvements (blue)

Show severity in UI:
```
⛔ Critical (1): Incorrect word
⚠️ Important (2): Grammar issues
💡 Stylistic (3): Suggestions
```

Allow filtering: "Fix Critical Only" vs "Fix All"

---

**7. Learning from User Corrections**

Track which suggestions users accept/reject:

```javascript
const correctionHistory = {
  'create → creates': { accepted: 15, rejected: 2 },
  'result → results': { accepted: 20, rejected: 0 }
};
```

Use to:
- Improve confidence scores
- Identify false positives
- Personalize suggestions over time

---

**8. Keyboard Shortcuts**

Make power users faster:

```
Cmd/Ctrl + Shift + H: Humanize selected text
Cmd/Ctrl + Shift + R: Rewrite selected text
Cmd/Ctrl + Shift + G: Grammar check only

During review:
Enter: Accept current correction
N: Ignore (Next)
ESC: Cancel review
```

Show shortcut hints in UI:
```
[ Accept Fix ] ⏎
[ Ignore ] N
```

---

**9. Batch Processing**

Allow processing multiple selections:

```
Select paragraph 1 → Add to queue
Select paragraph 2 → Add to queue
Click "Process All (2 items)" → Batch process
```

**Benefit**: Save credits (bulk discount?), faster workflow.

---

**10. Export/Share Results**

After processing, offer:
- Copy to clipboard (formatted)
- Download as .txt file
- Share link (temporary URL)

**Use Case**: User wants to save AI-improved version for later.

---

### Low Priority / Future Enhancements

**11. A/B Test Different Prompts**

Backend could return multiple variations:

```json
{
  "variations": [
    { "id": "v1", "text": "Using AI creates better results" },
    { "id": "v2", "text": "AI helps produce better outcomes" },
    { "id": "v3", "text": "AI technology improves your results" }
  ]
}
```

UI shows carousel: "Choose your favorite"

Track which variations users prefer → Improve prompts over time.

---

**12. Real-Time Collaboration**

If user is in Google Docs:
- Detect collaborative editing
- Queue changes instead of immediate replacement
- Notify: "3 team members editing, changes will apply when safe"

---

**13. Voice Input Integration**

For accessibility:
- Allow voice commands: "Humanize this text"
- Text-to-speech for results: "Would you like me to read the improved version?"

---

**14. Mobile Support**

Chrome extension doesn't work on mobile, but:
- Create companion mobile app (iOS/Android)
- Same backend, optimized mobile UI
- Share credit balance across devices

---

## Summary & Next Steps

### What We Designed

✅ **Complete UX flow** for two-stage pipeline (AI → Grammar)
✅ **6 distinct UI states** with detailed visual specs
✅ **Loading states** with progress indicators and stage transitions
✅ **Grammar error display** with inline highlighting and tooltips
✅ **Value communication** strategy to showcase AI + Grammar benefit
✅ **Error handling** patterns for all failure scenarios
✅ **Technical implementation** guide with code examples
✅ **10+ recommendations** for improvement

### Key UX Principles

1. **Transparency**: Show both stages clearly, don't hide the pipeline
2. **Speed**: Optimize perceived performance (show AI result ASAP)
3. **Control**: Give users choice (fix all, review each, use as-is)
4. **Safety**: Non-destructive (stage 1 success valuable even if stage 2 fails)
5. **Education**: Help users understand what's happening and why

### Implementation Priority

**Phase 1: MVP (Launch-Ready)**
- ✅ State 1: Idle Menu
- ✅ State 2: Stage 1 Loading (AI)
- ✅ State 4a: Result - Clean (no errors)
- ✅ State 4b: Result - With Errors (inline highlighting)
- ✅ Basic error handling (blocking errors)
- ✅ Success toast

**Phase 2: Enhanced Experience**
- ✅ State 3: Stage Transition (show intermediate result)
- ✅ State 5: Grammar Review (step-through)
- ✅ Progress callbacks in capability-manager.js
- ✅ Smart progress estimation
- ✅ Comparison view (before/after)

**Phase 3: Power Features**
- ✅ Auto-fix preference
- ✅ Undo/redo support
- ✅ Keyboard shortcuts
- ✅ Error severity levels
- ✅ Batch processing

### Success Metrics

**Measure these to validate UX:**

1. **Pipeline Awareness**: % users who understand two stages happen
2. **Grammar Fix Rate**: % of grammar errors users accept fixing
3. **Error Recovery**: % of errors users successfully recover from
4. **Time to Action**: Seconds from selection to accepted result
5. **Satisfaction**: NPS score for "AI + Grammar in one click"

### Questions for Stakeholders

1. **Should grammar check be optional?** Or always run for AI features?
2. **What's the tolerance for false positives?** How many bad grammar suggestions before users lose trust?
3. **Should we charge extra for grammar checking?** Or include it free with AI features?
4. **How do we handle very long texts?** (>10k words) Should we chunk them?
5. **What's the plan for mobile?** Extension won't work, need separate app?

---

## Appendix: Design Assets Needed

### Icons
- ✓ Grammar check icon
- ✨ Humanize icon
- ↻ Rewrite icon
- 🤖 AI processing icon
- ⚠️ Warning/error icon
- 💳 Credits icon
- 📋 Copy icon

### Animations
- Fade in/out (150ms)
- Scale in (200ms)
- Slide up (200ms)
- Shake (300ms)
- Pulse (2s loop)
- Progress shimmer (2s loop)
- Success pop (400ms)

### Illustrations (Optional)
- Empty state: "No grammar errors" celebration
- Error state: Friendly error mascot
- Onboarding: Two-stage pipeline diagram
- Settings: Feature comparison grid

---

**Document Status**: Ready for Implementation
**Estimated Implementation Time**: 2-3 weeks (Phase 1 MVP)
**Dependencies**: None (all components self-contained)

**Questions?** Contact UX Design Team or file issue in project repository.

---

*End of UX Design Specification*
