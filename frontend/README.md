# CryptoTracker - Cryptocurrency Analytics

A modern, real-time cryptocurrency tracking application built with React, TypeScript, and Tailwind CSS.

## Features

- **Live Prices**: Real-time cryptocurrency prices updated every 30 seconds
- **Interactive Charts**: Historical price charts with multiple time ranges (24H, 7D, 30D, 90D, 1Y)
- **Price Alerts**: Set custom price alerts with browser notifications
- **Portfolio Tracking**: Track your cryptocurrency investments with profit/loss calculations
- **Search**: Quick search functionality to find any cryptocurrency
- **Responsive Design**: Beautiful, modern UI that works on all devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for interactive charts
- **React Router** for navigation
- **Axios** for API calls
- **CoinGecko API** for cryptocurrency data

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Dashboard
- View live cryptocurrency prices
- Search for specific coins
- Click on any coin to view its price chart
- Select different time ranges for historical data

### Portfolio
- Add your cryptocurrency holdings
- Track your total portfolio value
- Monitor profit/loss for each holding
- Edit or remove portfolio items

### Alerts
- Create price alerts for any cryptocurrency
- Set target prices with "above" or "below" conditions
- Receive browser notifications when alerts trigger
- Manage and delete alerts

## API & CORS Issues

This application uses the [CoinGecko API](https://www.coingecko.com/en/api) for cryptocurrency data. The free tier allows:
- 10-50 calls/minute
- Real-time and historical price data
- Market data and statistics

### Handling CORS and Rate Limits

The app includes automatic CORS proxy fallback. If you encounter CORS errors:

1. **Automatic Proxy Fallback**: The app will automatically try using a CORS proxy if direct API calls fail
2. **Rate Limiting**: The app includes rate limit protection and automatic retries
3. **Manual Proxy**: To force proxy usage, create a `.env` file with:
   ```
   VITE_USE_CORS_PROXY=true
   ```

**Note**: For production, it's recommended to use a backend proxy server instead of public CORS proxies.

## Browser Notifications

The app will request permission to show browser notifications when you create your first alert. Make sure to allow notifications in your browser settings.

## Data Persistence

All portfolio items and alerts are stored in your browser's localStorage, so your data persists between sessions.

## License

MIT

