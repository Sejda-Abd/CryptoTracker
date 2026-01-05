# CryptoTracker Backend API

Backend proxy server for CryptoTracker with intelligent caching and rate limiting.

## Features

- ✅ **CORS Support**: No CORS issues - backend handles all API calls
- ✅ **Intelligent Caching**: Reduces API calls and improves performance
  - Markets: 2 minutes cache
  - Charts: 5 minutes cache
  - Coin details: 10 minutes cache
- ✅ **Rate Limiting**: Protects against abuse (100 requests/minute)
- ✅ **Error Handling**: Graceful error handling and logging
- ✅ **API Key Support**: Optional CoinGecko Pro API key for higher limits
- ✅ **TypeScript**: Full TypeScript support

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Your frontend URL (default: http://localhost:3000)
- `COINGECKO_API_KEY`: Optional - for CoinGecko Pro API
- Cache TTLs: Adjust cache durations as needed

## Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## Production

```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Markets
```
GET /api/coingecko/markets?vs_currency=usd&per_page=50&page=1
```

### Coin Details
```
GET /api/coingecko/coins/:coinId
```

### Market Chart
```
GET /api/coingecko/coins/:coinId/market_chart?vs_currency=usd&days=7
```

### Cache Stats (Monitoring)
```
GET /api/coingecko/cache/stats
```

### Clear Cache (Admin)
```
DELETE /api/coingecko/cache/clear
```

## Frontend Integration

Update your frontend `apiClient.ts` to use the backend:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/coingecko'

export const coinGeckoAPI = {
  getMarkets: (params) => axios.get(`${API_BASE_URL}/markets`, { params }),
  getCoin: (coinId) => axios.get(`${API_BASE_URL}/coins/${coinId}`),
  getMarketChart: (coinId, params) => 
    axios.get(`${API_BASE_URL}/coins/${coinId}/market_chart`, { params }),
}
```

## Benefits

1. **No CORS Issues**: All requests go through backend
2. **Better Performance**: Caching reduces API calls by 80-90%
3. **Rate Limit Protection**: Backend handles rate limiting intelligently
4. **Scalability**: Can add Redis for distributed caching
5. **Monitoring**: Cache stats endpoint for monitoring

## Deployment

### Docker (Recommended)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables

Set these in your production environment:
- `PORT`: Server port
- `FRONTEND_URL`: Your frontend domain
- `NODE_ENV`: `production`
- `COINGECKO_API_KEY`: (Optional) For higher rate limits

## Monitoring

Check cache performance:
```bash
curl http://localhost:5000/api/coingecko/cache/stats
```

## License

MIT

