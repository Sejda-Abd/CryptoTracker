# CORS and Rate Limit Solution

## Problem Analysis

Based on the error logs, here's what's happening:

1. **Direct API calls fail** with CORS (429 rate limit)
2. **Proxy fallback is triggered** but sometimes still shows direct URL in network tab
3. **Proxy services also have rate limits** and may fail
4. **Eventually works** after multiple retries (HTTP 200)

## Why It Works Sometimes But Not Always

### Root Causes:

1. **CoinGecko Rate Limits**: The free API allows 10-50 calls/minute. When exceeded, returns 429.
2. **CORS Restrictions**: Browser blocks direct API calls due to missing CORS headers.
3. **Proxy Rate Limits**: Public CORS proxies also have rate limits.
4. **Rapid Requests**: Clicking time ranges quickly triggers multiple requests.

### Current Solution:

The app now:
- ✅ Automatically tries CORS proxy when direct calls fail
- ✅ Tries multiple proxy services in sequence
- ✅ Has rate limiting protection (3 second minimum between requests)
- ✅ Uses exponential backoff for retries
- ✅ Debounces time range changes (500ms)

## How It Works Now

1. **First Attempt**: Direct API call
2. **If CORS/429 Error**: Automatically tries proxy services one by one
3. **If All Proxies Fail**: Waits and retries with exponential backoff
4. **Success**: Returns data and remembers which proxy worked

## Recommendations

### For Development:
- Wait 1-2 minutes between chart requests if you see errors
- Don't click time ranges rapidly
- Use the "Retry" button if a chart fails

### For Production:
1. **Use a Backend Proxy** (Best Solution)
   - Create a Node.js/Express backend
   - Proxy all CoinGecko requests through backend
   - Add response caching (1-2 minutes)
   - No CORS issues, better rate limit handling

2. **Use CoinGecko Pro API**
   - Sign up for paid API key
   - Higher rate limits (1000+ calls/minute)
   - Better reliability

3. **Implement Caching**
   - Cache chart data for 1-2 minutes
   - Reduce API calls significantly
   - Better user experience

## Current Proxy Services

The app tries these in order:
1. `api.allorigins.win` - Most reliable
2. `corsproxy.io` - Backup
3. `api.codetabs.com` - Last resort

If one fails, it automatically tries the next.

## Debugging

Check browser console for:
- "CORS/rate limit detected, trying with proxy..."
- "Using proxy: { original: ..., proxied: ..., proxyService: ... }"
- "Proxy request successful!" or error messages

These logs help understand what's happening.

