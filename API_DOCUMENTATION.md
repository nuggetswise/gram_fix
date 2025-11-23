# GhostWrite Backend API Documentation

## Overview

The GhostWrite backend provides AI-powered text processing capabilities with built-in prompt engineering, credit management, and automatic failover between AI providers.

**Architecture:**
- **Primary AI Provider**: Google Gemini API (cost-effective, fast)
- **Fallback AI Provider**: OpenAI GPT-3.5-turbo (automatic failover)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel Edge Functions
- **Authentication**: API Key (Bearer token)

---

## Base URL

**Development:** `http://localhost:3000`
**Production:** `https://your-app.vercel.app`

---

## Authentication

All API endpoints require authentication via Bearer token in the Authorization header:

```http
Authorization: Bearer your_api_key_here
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid API key"
}
```

---

## Endpoints

### 1. POST /api/status

Check API connectivity and retrieve user credit balance.

**Request:**
```http
POST /api/status
Authorization: Bearer your_api_key_here
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "tier": "trial",
    "credits_remaining": 73
  },
  "service_status": {
    "api": "operational",
    "timestamp": "2025-11-23T10:30:00.000Z"
  }
}
```

**Use Cases:**
- Verify API key is valid
- Check credit balance before operations
- Display user info in extension popup

---

### 2. POST /api/humanize

Humanize AI-generated text to sound more natural and remove AI jargon.

**Request:**
```http
POST /api/humanize
Authorization: Bearer your_api_key_here
Content-Type: application/json

{
  "text": "We need to leverage our core competencies to delve into this paradigm.",
  "action": "humanize"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "result": "We should use our strengths to explore this approach.",
  "credits_remaining": 72,
  "provider": "gemini"
}
```

**Error Response (402 Payment Required):**
```json
{
  "error": "Insufficient credits",
  "credits_remaining": 0
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "error": "AI service temporarily unavailable",
  "details": "Both primary and fallback services failed"
}
```

**Prompt Engineering:**

The `/api/humanize` endpoint uses this system prompt:

```
You are a professional editor specializing in making writing more natural and engaging.

STRICT RULES:
- Remove AI-typical jargon and phrases: avoid 'delve', 'leverage', 'tapestry', 'underscore', 'synergy', 'paradigm', 'robust', 'holistic'
- Replace corporate speak with conversational language
- Prefer active voice over passive voice
- Use contractions when natural (don't, won't, can't)
- Keep the exact same meaning - don't change intent or core message
- Maintain the original tone (professional/casual/academic)
- Output ONLY the rewritten text, no explanations or meta-commentary
```

**Credits:** 1 credit per request

---

### 3. POST /api/rewrite

Rewrite text for clarity and conciseness while maintaining the same meaning.

**Request:**
```http
POST /api/rewrite
Authorization: Bearer your_api_key_here
Content-Type: application/json

{
  "text": "Due to the fact that we are currently in the process of implementing changes, it is important to note that...",
  "action": "rewrite"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "result": "Because we're implementing changes, note that...",
  "credits_remaining": 71,
  "provider": "gemini"
}
```

**Prompt Engineering:**

The `/api/rewrite` endpoint uses this system prompt:

```
You are an expert editor focused on clarity and conciseness.

STRICT RULES:
- Make the writing clearer and more direct
- Use shorter sentences when possible (aim for 15-20 words average)
- Remove redundancy and filler words
- Use simple, precise language
- Eliminate unnecessary adjectives and adverbs
- Keep the same tone and meaning
- Don't oversimplify technical or domain-specific terms
- Output ONLY the rewritten text, no explanations
```

**Credits:** 1 credit per request

---

## Prompt Engineering System

### System Prompt Architecture

All AI operations use centralized system prompts defined in `/lib/prompts.js`:

```javascript
import { getSystemPrompt } from './lib/prompts.js';

// Get prompt for specific action
const systemPrompt = getSystemPrompt('humanize');
```

### Available Actions

| Action | Description | System Prompt Version |
|--------|-------------|----------------------|
| `humanize` | Remove AI jargon, make text natural | v1.0 |
| `rewrite` | Improve clarity and conciseness | v1.0 |
| `improve` | Enhance flow and readability | v1.0 (future) |

### Prompt Versioning

Each system prompt includes:
- **Version number** for tracking changes
- **Description** of purpose
- **Strict rules** for consistent output
- **Examples** for few-shot learning

### LLM Provider Integration

#### Gemini API (Primary)

```javascript
import { callGeminiAPI } from './lib/gemini-client.js';

const result = await callGeminiAPI(text, 'humanize');
```

**How prompts are injected:**
```javascript
{
  contents: [{
    parts: [
      { text: systemPrompt + "\n\n" + userText }
    ]
  }]
}
```

#### OpenAI API (Fallback)

```javascript
import { callOpenAI } from './lib/openai-client.js';

const result = await callOpenAI(text, 'humanize');
```

**How prompts are injected:**
```javascript
{
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userText }
  ]
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input (missing text, etc.) |
| 401 | Unauthorized | Invalid or missing API key |
| 402 | Payment Required | Insufficient credits |
| 405 | Method Not Allowed | Non-POST request |
| 500 | Internal Server Error | Unexpected error |
| 503 | Service Unavailable | Both Gemini and OpenAI failed |

### Error Response Format

```json
{
  "error": "Error message",
  "message": "Additional details (optional)",
  "details": "Technical information (optional)"
}
```

---

## Automatic Failover

The backend implements automatic failover from Gemini to OpenAI:

```
1. Try Gemini API (primary)
   ↓
2. If Gemini fails → Try OpenAI (fallback)
   ↓
3. If both fail → Return 503 error
```

**Response includes provider used:**
```json
{
  "provider": "gemini"  // or "openai"
}
```

---

## Rate Limiting

**Current Implementation:** None (planned for future)

**Recommended Limits:**
- 60 requests per minute per user
- 1000 requests per hour per user

---

## Credit System

### Credit Costs

| Action | Credits | Notes |
|--------|---------|-------|
| Humanize | 1 | Per request |
| Rewrite | 1 | Per request |
| Improve | 1 | Per request (future) |

### Credit Tiers

| Tier | Credits | Cost | Notes |
|------|---------|------|-------|
| Trial | 100 | Free | One-time on signup |
| Starter | 1,000/mo | $5/mo | Subscription |
| Pro | 3,000/mo | $10/mo | Better value |

### Credit Deduction Flow

```
1. Check user has credits (hasEnoughCredits)
2. Process AI request
3. Deduct credits (deductCredits)
4. Log usage (logUsage)
5. Return updated balance
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  credits_remaining INT DEFAULT 100,
  tier TEXT DEFAULT 'trial',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Usage Logs Table

```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  text_length INT NOT NULL,
  credits_used INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your API keys
```

Required variables:
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Set Up Database

Run SQL schema in Supabase:

```sql
-- See database schema above
```

### 4. Run Development Server

```bash
npm run dev
```

API will be available at `http://localhost:3000`

### 5. Deploy to Vercel

```bash
vercel deploy --prod
```

---

## Testing

### Test Status Endpoint

```bash
curl -X POST http://localhost:3000/api/status \
  -H "Authorization: Bearer your_api_key_here" \
  -H "Content-Type: application/json"
```

### Test Humanize Endpoint

```bash
curl -X POST http://localhost:3000/api/humanize \
  -H "Authorization: Bearer your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "We need to leverage our synergies to delve into this robust paradigm.",
    "action": "humanize"
  }'
```

### Test Rewrite Endpoint

```bash
curl -X POST http://localhost:3000/api/rewrite \
  -H "Authorization: Bearer your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Due to the fact that we are implementing changes, it is important to note that improvements will be made.",
    "action": "rewrite"
  }'
```

---

## Cost Analysis

### Per-Request Costs

**Gemini API (Primary):**
- Input: $0.00025 per 1K characters
- Output: $0.0005 per 1K characters
- **Average cost per request: ~$0.001**

**OpenAI API (Fallback):**
- GPT-3.5-turbo: $0.0005 input + $0.0015 output per 1K tokens
- **Average cost per request: ~$0.002**

### Unit Economics

**$5/mo Tier (1000 credits):**
```
Revenue: $5.00
API costs: ~$1.00 (mostly Gemini)
Stripe fees: $0.45
Net profit: $3.55 (71% margin)
```

**$10/mo Tier (3000 credits):**
```
Revenue: $10.00
API costs: ~$3.00 (mostly Gemini)
Stripe fees: $0.59
Net profit: $6.41 (64% margin)
```

---

## Security Best Practices

### API Key Management

- ✅ Use Bearer token authentication
- ✅ Store API keys securely in database (hashed if possible)
- ✅ Never expose API keys in client-side code
- ✅ Rotate keys regularly

### Environment Variables

- ✅ Never commit `.env` to git
- ✅ Use Vercel's environment variable management
- ✅ Separate dev/staging/prod keys
- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` server-side only

### Input Validation

- ✅ Validate text input exists and is string
- ✅ Limit maximum text length (prevent abuse)
- ✅ Sanitize user input before processing
- ✅ Rate limit by API key

---

## Monitoring & Logging

### What to Monitor

- **Success Rate**: % of requests that succeed
- **Failover Rate**: How often OpenAI fallback is used
- **Average Latency**: Response time per endpoint
- **Credit Usage**: Trends in user consumption
- **Error Rates**: Track 4xx and 5xx responses

### Logging Best Practices

```javascript
console.log(`[Humanize] Calling Gemini API for user ${user.id}`);
console.warn('[Humanize] Gemini failed, falling back to OpenAI');
console.error('[Humanize] Both providers failed:', error);
```

---

## Future Enhancements

### Planned Features

- [ ] Rate limiting per user
- [ ] A/B testing for system prompts
- [ ] Prompt customization (tone, style parameters)
- [ ] Context-aware rewriting
- [ ] Batch processing endpoints
- [ ] Webhook notifications for low credits
- [ ] Analytics dashboard

### Prompt Engineering Improvements

- [ ] Few-shot examples in prompts
- [ ] Dynamic tone adjustment
- [ ] User feedback loop for prompt optimization
- [ ] Multi-language support
- [ ] Domain-specific prompts (technical, creative, academic)

---

*Last Updated: 2025-11-23*
*Version: 1.0*
