# Troubleshooting Guide

## CORS and Rate Limit Issues

### Problem: "Failed to fetch cryptocurrency prices" or CORS errors

The CoinGecko free API has rate limits and CORS restrictions. Here are solutions:

### Solutions

#### 1. **Wait and Retry** (Recommended)
- The free CoinGecko API allows **10-50 calls per minute**
- If you see a rate limit error, wait 1-2 minutes and click the "Refresh" button
- The app automatically retries with exponential backoff

#### 2. **Use the Refresh Button**
- Click the "Refresh" button in the top-right corner of the dashboard
- This manually triggers a new API request

#### 3. **Reduce Update Frequency**
- The app is configured to update every 2 minutes (120 seconds)
- This helps avoid hitting rate limits
- You can modify this in `src/context/CryptoContext.tsx`

#### 4. **Use CoinGecko Pro API** (For Production)
- Sign up for CoinGecko Pro API for higher rate limits
- Update the API endpoint in `CryptoContext.tsx`
- Add your API key to requests

#### 5. **Use a Backend Proxy** (Best Solution)
- Create a backend server to proxy API requests
- This completely avoids CORS issues
- Backend can cache responses to reduce API calls

#### 6. **Development Proxy** (Vite)
- The Vite config includes a proxy option
- In development, you can use: `/api/coins/markets` instead of direct API calls
- This routes through Vite's dev server to avoid CORS

### Current Configuration

- **Update Interval**: 2 minutes (120,000ms)
- **Coins per Request**: 50 (reduced from 100)
- **Retry Logic**: Up to 3 retries with exponential backoff
- **Timeout**: 10 seconds per request

### Error Messages

- **"Rate limit exceeded"**: Too many requests. Wait 1-2 minutes.
- **"Network error"**: CORS or connection issue. Check internet or try refresh.
- **"Failed to fetch"**: General API error. Check CoinGecko status.

### Best Practices

1. **Don't refresh too frequently** - Let the automatic updates work
2. **Use the manual refresh sparingly** - Only when needed
3. **Check CoinGecko status** - Visit status.coingecko.com if issues persist
4. **Consider caching** - For production, implement response caching

### For Production Deployment

1. **Use a backend API** - Create a Node.js/Express backend
2. **Implement caching** - Cache API responses for 1-2 minutes
3. **Use API keys** - Sign up for CoinGecko Pro
4. **Rate limiting** - Implement your own rate limiting
5. **Error handling** - Better error recovery and user feedback

### Alternative APIs

If CoinGecko continues to have issues, consider:
- **CoinCap API** - Free tier available
- **CryptoCompare** - Free and paid tiers
- **Binance API** - For major coins
- **CoinMarketCap API** - Requires API key

---

**Note**: The current implementation is optimized for the free CoinGecko API tier. For production use, consider implementing a backend proxy or upgrading to a paid API plan.

