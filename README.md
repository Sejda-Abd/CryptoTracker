# CryptoTracker - Full Stack Cryptocurrency Analytics

A complete cryptocurrency tracking application with real-time prices, historical charts, portfolio tracking, and price alerts.

## 🚀 Features

- **Real-time Prices**: Live cryptocurrency prices with automatic updates
- **Interactive Charts**: Historical price charts with multiple time ranges
- **Portfolio Tracking**: Track investments with profit/loss calculations
- **Price Alerts**: Set custom alerts with browser notifications
- **Watchlist**: Favorite cryptocurrencies for quick access
- **Top Gainers/Losers**: See trending coins
- **Advanced Sorting**: Sort by price, market cap, volume, etc.
- **Backend Proxy**: Optional backend with intelligent caching

## 📁 Project Structure

```
crypto/
├── frontend/          # React + TypeScript frontend
├── backend/           # Node.js + Express backend (optional)
└── README.md          # This file
```

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- React Router
- Axios

### Backend (Optional)
- Node.js + Express
- TypeScript
- Node-Cache (in-memory caching)
- Express Rate Limit

## 🚀 Quick Start

### Frontend Only (Development)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

**Note**: Without backend, the frontend uses direct CoinGecko API calls with CORS proxy fallback. You may encounter rate limits.

### Full Stack (Recommended)

#### 1. Start Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set FRONTEND_URL=http://localhost:3000
npm run dev
```

Backend runs on `http://localhost:5000`

#### 2. Start Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api/coingecko" > .env
npm run dev
```

Frontend automatically uses backend when available!

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- (Optional) Docker for containerized deployment

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
npm install
```

## ⚙️ Configuration

### Frontend Environment Variables

Create `frontend/.env`:

```env
# Backend API URL (optional)
VITE_API_URL=http://localhost:5000/api/coingecko

# CORS Proxy (only used if backend unavailable)
VITE_USE_CORS_PROXY=false
```

### Backend Environment Variables

Create `backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Optional: CoinGecko Pro API key for higher rate limits
COINGECKO_API_KEY=your_key_here

# Cache TTLs (seconds)
CACHE_TTL_MARKETS=120
CACHE_TTL_CHART=300
CACHE_TTL_COIN=600
```

## 🐳 Docker Deployment

### Backend Only

```bash
cd backend
docker-compose up -d
```

### Full Stack

See `SETUP_BACKEND.md` for detailed Docker setup.

## 📚 Documentation

- [Frontend README](frontend/README.md) - Frontend documentation
- [Backend README](backend/README.md) - Backend API documentation
- [Backend Setup Guide](SETUP_BACKEND.md) - Detailed backend setup
- [CORS Solution](frontend/CORS_SOLUTION.md) - CORS troubleshooting
- [Improvements](frontend/IMPROVEMENTS.md) - Feature list

## 🎯 Key Benefits of Backend

✅ **No CORS Issues**: All API calls go through backend  
✅ **80-90% Fewer API Calls**: Intelligent caching  
✅ **Better Performance**: Cached responses are instant  
✅ **Rate Limit Protection**: Backend handles rate limiting  
✅ **Scalable**: Can add Redis for distributed caching  

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm run dev
```

### Backend Development

```bash
cd backend
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm run build
npm start
```

## 📡 API Endpoints (Backend)

- `GET /api/health` - Health check
- `GET /api/coingecko/markets` - Market data
- `GET /api/coingecko/coins/:coinId` - Coin details
- `GET /api/coingecko/coins/:coinId/market_chart` - Chart data
- `GET /api/coingecko/cache/stats` - Cache statistics

## 🐛 Troubleshooting

### CORS Errors

If using frontend only:
- Wait 1-2 minutes between requests (rate limits)
- The app automatically tries CORS proxies
- Consider using the backend for production

If using backend:
- Check `FRONTEND_URL` in backend `.env`
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check `VITE_API_URL` in frontend `.env`

### Rate Limit Errors

- **With Backend**: Caching reduces API calls significantly
- **Without Backend**: Wait 1-2 minutes, use retry button
- Consider CoinGecko Pro API key for higher limits

### Backend Not Connecting

1. Verify backend is running
2. Check `VITE_API_URL` in frontend `.env`
3. Frontend automatically falls back to direct API if backend unavailable

## 📝 License

MIT

## 🙏 Acknowledgments

- [CoinGecko API](https://www.coingecko.com/en/api) for cryptocurrency data
- Built with React, Express, and modern web technologies

---

**Happy Tracking! 📈**

