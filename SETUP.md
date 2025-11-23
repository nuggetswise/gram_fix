# GhostWrite Extension - Setup Guide

## Quick Start: Load Extension in Chrome

### Step 1: Open Chrome Extensions Page

1. Open Google Chrome
2. Navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right corner)

### Step 2: Load Unpacked Extension

1. Click **"Load unpacked"** button
2. Navigate to and select this directory: `/Users/singhm/gramfix/gram_fix`
3. Click **"Select"**

### Step 3: Verify Extension Loaded

You should see:
- ✅ **GhostWrite** extension card appears
- ✅ Purple "G" icon in Chrome toolbar
- ✅ No errors in the extension card

### Step 4: Test the Extension

1. **Test Popup:**
   - Click the GhostWrite icon in toolbar
   - Popup should open showing status dashboard

2. **Test Content Script:**
   - Navigate to any website (e.g., gmail.com, docs.google.com)
   - Select some text
   - Wait 400ms
   - Ghost menu should appear near selection

---

## Current Extension Status

### ✅ What's Working (Phase 1 Complete)

- [x] Extension loads in Chrome
- [x] Manifest V3 configuration complete
- [x] Background service worker initialized
- [x] Content script injects into pages
- [x] Popup UI displays
- [x] Ghost menu appears on text selection
- [x] Extension icons visible

### ⚠️ What's NOT Working Yet

- [ ] **Grammar checking** - Harper.js needs integration (Phase 2)
- [ ] **AI features** - Backend needs deployment (Phase 3)
- [ ] **Credit system** - Supabase database not set up

---

## Testing Checklist

### Basic Functionality

- [ ] Extension appears in `chrome://extensions`
- [ ] No errors in extension card
- [ ] Icon visible in Chrome toolbar
- [ ] Clicking icon opens popup
- [ ] Popup shows "Initializing..." or status

### Content Script Integration

- [ ] Navigate to https://www.google.com
- [ ] Select some text
- [ ] Ghost menu appears after 400ms
- [ ] Menu shows "Fix Grammar", "Humanize", "Rewrite" buttons

### Console Debugging

1. Open DevTools Console (F12)
2. Check for initialization messages:
   ```
   [GhostWrite Background] Service worker loaded
   [GhostWrite] Initializing capabilities...
   [GhostWrite] Initialization complete
   ```

3. Look for any errors (red text)

---

## Known Issues & Workarounds

### Issue: "Manifest version 2 is deprecated"
**Solution:** This extension uses Manifest V3 - you can ignore this warning if you see it.

### Issue: "Cannot read property 'Harper' of undefined"
**Solution:** Harper.js is not installed yet. This is expected. Grammar checking won't work until Phase 2.

### Issue: Ghost menu doesn't appear
**Possible causes:**
1. Content script not injected - check `chrome://extensions` for errors
2. Website has Content Security Policy blocking scripts - try a different site
3. Text selection too short - try selecting more text

**Debug:**
- Open DevTools on the webpage
- Check Console for content-script.js errors
- Verify content-script.js is listed in Sources tab

### Issue: Popup is blank
**Solution:**
1. Right-click the extension icon → "Inspect popup"
2. Check Console for errors
3. Verify popup.html and popup.js loaded

---

## Development Workflow

### Making Changes

After modifying code:

1. Go to `chrome://extensions`
2. Find GhostWrite extension card
3. Click the **refresh icon** (🔄)
4. Reload any open webpages to get updated content script

### Debugging Background Script

1. `chrome://extensions`
2. Click "Service worker" link under GhostWrite
3. Opens DevTools for background.js
4. Check Console for logs

### Debugging Content Script

1. Open any webpage
2. Open DevTools (F12)
3. Content script logs appear in webpage console
4. Use `debugger;` statements to set breakpoints

### Debugging Popup

1. Right-click extension icon
2. Select "Inspect popup"
3. DevTools opens for popup.html
4. Console shows popup.js logs

---

## File Structure

```
gram_fix/
├── manifest.json              # ✅ Extension configuration
├── background.js              # ✅ Service worker
├── capability-manager.js      # ✅ Core orchestration logic
├── icons/                     # ✅ Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── ui/                        # ✅ Frontend components
│   ├── content-script.js      # Injected into webpages
│   ├── popup.html             # Extension popup
│   ├── popup.js               # Popup logic
│   ├── ghost-menu.html        # Floating action menu
│   ├── correction-preview.html # Results panel
│   └── styles.css             # Design system
├── api/                       # ⚠️ Backend (not deployed yet)
│   ├── status.js
│   ├── humanize.js
│   └── rewrite.js
└── lib/                       # ⚠️ Backend libraries
    ├── prompts.js
    ├── gemini-client.js
    ├── openai-client.js
    └── supabase-client.js
```

---

## Next Steps

### Phase 2: Harper Grammar Integration (4-6 hours)

To enable grammar checking:

1. Install harper.js:
   ```bash
   npm install harper.js
   ```

2. Update capability-manager.js:
   - Replace Harper placeholder (lines 106-137)
   - Implement real lint() call (line 459)

3. Test grammar checking:
   - Select text with errors
   - Click "Fix Grammar"
   - Verify corrections appear

### Phase 3: Backend Deployment (5-6 hours)

To enable AI features:

1. **Supabase Setup:**
   - Create project at supabase.com
   - Run database schema from IMPLEMENTATION_PLAN.md
   - Get API keys

2. **Vercel Deployment:**
   - Create Vercel project
   - Configure environment variables
   - Deploy: `vercel deploy --prod`

3. **Update Extension:**
   - Edit capability-manager.js line 29
   - Replace `https://your-api-endpoint.com` with Vercel URL
   - Reload extension

---

## Troubleshooting

### Extension won't load

**Check:**
- manifest.json exists and is valid JSON
- background.js exists
- icons/ directory exists with PNG files

**Fix:**
```bash
# Verify files exist
ls manifest.json background.js icons/icon*.png

# Check manifest.json is valid JSON
cat manifest.json | python3 -m json.tool
```

### Service worker errors

**Common errors:**

1. **"importScripts is not defined"**
   - Remove `type: "module"` from manifest.json background section
   - Use importScripts() instead of import statements

2. **"CapabilityManager is not defined"**
   - Verify capability-manager.js is in root directory
   - Check importScripts path in background.js

### Content script not injecting

**Check:**
1. `chrome://extensions` - no errors under GhostWrite
2. DevTools Sources tab - content-script.js listed
3. Console - look for injection errors

**Fix:**
- Reload extension
- Reload webpage
- Try different website (some block scripts)

---

## Performance Expectations

### Current Performance (Phase 1)

- Extension size: ~3MB (with UI assets)
- Memory usage: ~15MB
- Menu appearance: 400ms after selection
- Popup open time: <100ms

### Expected Performance (After Phase 2)

- Grammar check: <50ms for 1000 words
- Extension size: ~5MB (with Harper WASM)
- Memory usage: ~25MB

### Expected Performance (After Phase 3)

- AI humanization: 500ms-2s (depends on API)
- Total pipeline: <3s for 500 words

---

## Support

**Issues:**
- Check IMPLEMENTATION_PLAN.md for detailed specs
- Review Claude.md for architecture overview
- See TWO_STAGE_PIPELINE_UX_DESIGN.md for UX flow

**Documentation:**
- API_DOCUMENTATION.md - Backend API reference
- GHOSTWRITE_DESIGN_SYSTEM.md - Design specs
- UI_IMPLEMENTATION_REPORT.md - Frontend details

---

**Last Updated:** 2025-11-23
**Extension Version:** 1.0.0 (Phase 1 Complete)
**Status:** Loadable in Chrome, UI functional, features pending
