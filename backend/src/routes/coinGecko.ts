import { Router, Request, Response } from 'express'
import axios from 'axios'
import NodeCache from 'node-cache'
import dotenv from 'dotenv'

dotenv.config()

const router = Router()

// Cache configuration
const cacheTTL = {
  markets: parseInt(process.env.CACHE_TTL_MARKETS || '120'), // 2 minutes
  chart: parseInt(process.env.CACHE_TTL_CHART || '300'), // 5 minutes
  coin: parseInt(process.env.CACHE_TTL_COIN || '600'), // 10 minutes
}

// Create cache instances
const marketsCache = new NodeCache({ stdTTL: cacheTTL.markets })
const chartCache = new NodeCache({ stdTTL: cacheTTL.chart })
const coinCache = new NodeCache({ stdTTL: cacheTTL.coin })

// CoinGecko API base URL
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY

// Helper to build CoinGecko API URL with optional API key
const buildApiUrl = (endpoint: string, params?: Record<string, any>): string => {
  const url = new URL(`${COINGECKO_API_BASE}${endpoint}`)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }
  
  // Add API key if available (for higher rate limits)
  if (COINGECKO_API_KEY) {
    url.searchParams.append('x_cg_demo_api_key', COINGECKO_API_KEY)
  }
  
  return url.toString()
}

// Helper to make API request with error handling
const makeApiRequest = async (url: string) => {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
      },
    })
    return response.data
  } catch (error: any) {
    if (error.response) {
      // API returned an error response
      throw {
        status: error.response.status,
        message: error.response.data?.error || error.message,
        data: error.response.data,
      }
    } else if (error.request) {
      // Request was made but no response received
      throw {
        status: 503,
        message: 'CoinGecko API is unavailable',
      }
    } else {
      // Error setting up request
      throw {
        status: 500,
        message: error.message || 'Unknown error',
      }
    }
  }
}

/**
 * GET /api/coingecko/markets
 * Get cryptocurrency market data with caching
 */
router.get('/markets', async (req: Request, res: Response) => {
  try {
    const params = {
      vs_currency: req.query.vs_currency || 'usd',
      order: req.query.order || 'market_cap_desc',
      per_page: req.query.per_page || '50',
      page: req.query.page || '1',
      sparkline: req.query.sparkline || 'false',
    }

    // Create cache key from params
    const cacheKey = `markets:${JSON.stringify(params)}`
    
    // Check cache
    const cached = marketsCache.get(cacheKey)
    if (cached) {
      console.log('📦 Serving markets from cache')
      return res.json(cached)
    }

    // Fetch from API
    console.log('🌐 Fetching markets from CoinGecko API')
    const url = buildApiUrl('/coins/markets', params)
    const data = await makeApiRequest(url)

    // Store in cache
    marketsCache.set(cacheKey, data)
    console.log('💾 Cached markets data')

    res.json(data)
  } catch (error: any) {
    console.error('Error fetching markets:', error)
    res.status(error.status || 500).json({
      error: error.message || 'Failed to fetch market data',
    })
  }
})

/**
 * GET /api/coingecko/coins/:coinId
 * Get detailed coin information with caching
 */
router.get('/coins/:coinId', async (req: Request, res: Response) => {
  try {
    const { coinId } = req.params
    const cacheKey = `coin:${coinId}`

    // Check cache
    const cached = coinCache.get(cacheKey)
    if (cached) {
      console.log(`📦 Serving coin ${coinId} from cache`)
      return res.json(cached)
    }

    // Fetch from API
    console.log(`🌐 Fetching coin ${coinId} from CoinGecko API`)
    const url = buildApiUrl(`/coins/${coinId}`)
    const data = await makeApiRequest(url)

    // Store in cache
    coinCache.set(cacheKey, data)
    console.log(`💾 Cached coin ${coinId} data`)

    res.json(data)
  } catch (error: any) {
    console.error(`Error fetching coin ${req.params.coinId}:`, error)
    res.status(error.status || 500).json({
      error: error.message || 'Failed to fetch coin data',
    })
  }
})

/**
 * GET /api/coingecko/coins/:coinId/market_chart
 * Get historical market chart data with caching
 */
router.get('/coins/:coinId/market_chart', async (req: Request, res: Response) => {
  try {
    const { coinId } = req.params
    const params = {
      vs_currency: req.query.vs_currency || 'usd',
      days: req.query.days || '7',
    }

    // Create cache key
    const cacheKey = `chart:${coinId}:${params.days}:${params.vs_currency}`

    // Check cache
    const cached = chartCache.get(cacheKey)
    if (cached) {
      console.log(`📦 Serving chart for ${coinId} (${params.days}d) from cache`)
      return res.json(cached)
    }

    // Fetch from API
    console.log(`🌐 Fetching chart for ${coinId} (${params.days}d) from CoinGecko API`)
    const url = buildApiUrl(`/coins/${coinId}/market_chart`, params)
    const data = await makeApiRequest(url)

    // Store in cache
    chartCache.set(cacheKey, data)
    console.log(`💾 Cached chart data for ${coinId}`)

    res.json(data)
  } catch (error: any) {
    console.error(`Error fetching chart for ${req.params.coinId}:`, error)
    res.status(error.status || 500).json({
      error: error.message || 'Failed to fetch chart data',
    })
  })
})

/**
 * GET /api/coingecko/cache/stats
 * Get cache statistics (for monitoring)
 */
router.get('/cache/stats', (req: Request, res: Response) => {
  res.json({
    markets: {
      keys: marketsCache.keys().length,
      stats: marketsCache.getStats(),
    },
    chart: {
      keys: chartCache.keys().length,
      stats: chartCache.getStats(),
    },
    coin: {
      keys: coinCache.keys().length,
      stats: coinCache.getStats(),
    },
  })
})

/**
 * DELETE /api/coingecko/cache/clear
 * Clear all caches (admin endpoint)
 */
router.delete('/cache/clear', (req: Request, res: Response) => {
  marketsCache.flushAll()
  chartCache.flushAll()
  coinCache.flushAll()
  res.json({ message: 'All caches cleared' })
})

export { router as coinGeckoProxy }

