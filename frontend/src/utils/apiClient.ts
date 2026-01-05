import axios from 'axios'

// CORS Proxy configuration
// For development, we can use a CORS proxy to bypass CORS restrictions
// Note: These are public proxies and may have rate limits. For production, use a backend proxy.

// Check if CORS proxy should be used (defaults to false)
const USE_PROXY = typeof import.meta !== 'undefined' && 
  (import.meta as { env?: { VITE_USE_CORS_PROXY?: string } }).env?.VITE_USE_CORS_PROXY === 'true'

// Try multiple proxy services in order
const PROXY_SERVICES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
]

let currentProxyIndex = 0

/**
 * Creates a proxied URL using the current proxy service
 */
const getProxiedUrl = (url: string, proxyIndex?: number): string => {
  const index = proxyIndex ?? currentProxyIndex
  const proxyUrl = PROXY_SERVICES[index % PROXY_SERVICES.length]
  
  // Different proxy services have different URL formats
  if (proxyUrl.includes('allorigins.win')) {
    return `${proxyUrl}${encodeURIComponent(url)}`
  } else if (proxyUrl.includes('corsproxy.io')) {
    return `${proxyUrl}${encodeURIComponent(url)}`
  } else {
    return `${proxyUrl}${encodeURIComponent(url)}`
  }
}

/**
 * Rotate to next proxy service
 */
const rotateProxy = () => {
  currentProxyIndex = (currentProxyIndex + 1) % PROXY_SERVICES.length
  console.log(`Switching to proxy service ${currentProxyIndex + 1}/${PROXY_SERVICES.length}`)
}

/**
 * Makes an API request with automatic retry and rate limit handling
 */
export const apiRequest = async (
  url: string,
  options: {
    params?: Record<string, any>
    timeout?: number
    retries?: number
    useProxy?: boolean
  } = {}
): Promise<any> => {
  const {
    params = {},
    timeout = 15000, // Increased timeout for proxy
    retries = 2,
    useProxy = USE_PROXY,
  } = options

  // Build the full URL with params
  let requestUrl = url
  if (Object.keys(params).length > 0) {
    const urlParams = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = String(value)
        return acc
      }, {} as Record<string, string>)
    ).toString()
    requestUrl = `${url}?${urlParams}`
  }

  // Apply proxy if needed
  if (useProxy) {
    const originalUrl = requestUrl
    requestUrl = getProxiedUrl(requestUrl)
    console.log('Using proxy:', {
      original: originalUrl.substring(0, 80) + '...',
      proxied: requestUrl.substring(0, 100) + '...',
      proxyService: currentProxyIndex + 1
    })
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // For proxy, we must use the full URL, no axios params
      const response = await axios.get(requestUrl, {
        params: useProxy ? {} : params, // Don't use axios params with proxy
        timeout,
        headers: useProxy ? {
          'Accept': 'application/json',
        } : undefined,
      })
      return response.data
    } catch (error: any) {
      const isLastAttempt = attempt === retries
      const status = error?.response?.status
      const isRateLimit = status === 429
      const isNetworkError = error?.code === 'ERR_NETWORK' || error?.message?.includes('CORS')

      // If using proxy and it fails, try next proxy service
      if (useProxy && (isRateLimit || isNetworkError || status >= 500) && !isLastAttempt) {
        console.log('Proxy failed, trying next proxy service...')
        rotateProxy()
        const nextProxyUrl = getProxiedUrl(requestUrl.includes('?') ? url + '?' + requestUrl.split('?')[1] : url, currentProxyIndex)
        try {
          const response = await axios.get(nextProxyUrl, {
            timeout,
            headers: {
              'Accept': 'application/json',
            },
          })
          return response.data
        } catch (nextProxyError) {
          console.error('Next proxy also failed, continuing...')
        }
      }

      // If it's a rate limit/network error and we haven't tried the proxy yet, try proxy
      if ((isRateLimit || isNetworkError) && !useProxy && !isLastAttempt) {
        console.log('CORS/rate limit detected, trying with proxy...')
        
        // Build the full URL with params first
        let fullUrl = url
        if (Object.keys(params).length > 0) {
          const urlParams = new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
              acc[key] = String(value)
              return acc
            }, {} as Record<string, string>)
          ).toString()
          fullUrl = `${url}?${urlParams}`
        }
        
        // Try each proxy service in order
        for (let proxyAttempt = 0; proxyAttempt < PROXY_SERVICES.length; proxyAttempt++) {
          try {
            const proxyUrl = getProxiedUrl(fullUrl, proxyAttempt)
            console.log(`Attempting proxy ${proxyAttempt + 1}/${PROXY_SERVICES.length}:`, proxyUrl.substring(0, 150))
            
            const response = await axios.get(proxyUrl, {
              timeout: timeout + 5000, // Extra timeout for proxy
              headers: {
                'Accept': 'application/json',
              },
            })
            
            console.log('Proxy request successful!')
            currentProxyIndex = proxyAttempt // Remember which proxy worked
            return response.data
          } catch (proxyError: any) {
            const proxyStatus = proxyError?.response?.status
            console.error(`Proxy ${proxyAttempt + 1} failed:`, proxyError?.message || proxyError, `Status: ${proxyStatus}`)
            
            // If this is the last proxy, break and continue with normal retry
            if (proxyAttempt === PROXY_SERVICES.length - 1) {
              console.log('All proxies failed, continuing with normal retry...')
              break
            }
          }
        }
      }

      // If it's the last attempt, throw the error
      if (isLastAttempt) {
        throw error
      }

      // Wait before retrying (exponential backoff, longer for rate limits)
      const baseDelay = isRateLimit ? 5000 : 1000
      const delay = Math.min(baseDelay * Math.pow(2, attempt), isRateLimit ? 30000 : 5000)
      console.log(`Waiting ${delay}ms before retry ${attempt + 1}/${retries}...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error('Max retries exceeded')
}

// Backend API URL from environment variable
// Set VITE_API_URL in Vercel Dashboard → Settings → Environment Variables
const getBackendApiUrl = (): string => {
  if (typeof import.meta !== 'undefined') {
    const env = (import.meta as { env?: { VITE_API_URL?: string } }).env
    if (env?.VITE_API_URL) {
      return env.VITE_API_URL
    }
  }
  // Fallback for development
  return 'http://localhost:5000/api/coingecko'
}

const BACKEND_API_URL = getBackendApiUrl()

// Check if backend is available
const checkBackendAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_API_URL.replace('/coingecko', '/health')}`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    })
    return response.ok
  } catch {
    return false
  }
}

// Cache backend availability check
let backendAvailable: boolean | null = null
let backendCheckTime = 0
const BACKEND_CHECK_TTL = 60000 // Check every minute

const isBackendAvailable = async (): Promise<boolean> => {
  const now = Date.now()
  if (backendAvailable === null || now - backendCheckTime > BACKEND_CHECK_TTL) {
    backendAvailable = await checkBackendAvailable()
    backendCheckTime = now
    if (backendAvailable) {
      console.log('✅ Backend API is available, using it for requests')
    } else {
      console.log('⚠️ Backend API not available, falling back to direct API calls')
    }
  }
  return backendAvailable || false
}

/**
 * CoinGecko API client with backend proxy fallback
 */
export const coinGeckoAPI = {
  getMarkets: async (params: Record<string, any>) => {
    if (await isBackendAvailable()) {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/markets`, { params, timeout: 15000 })
        return response.data
      } catch (error: any) {
        console.warn('Backend request failed, falling back to direct API:', error.message)
        backendAvailable = false // Mark backend as unavailable
      }
    }
    // Fallback to direct API with proxy
    const url = 'https://api.coingecko.com/api/v3/coins/markets'
    return apiRequest(url, { params })
  },

  getCoin: async (coinId: string) => {
    if (await isBackendAvailable()) {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/coins/${coinId}`, { timeout: 15000 })
        return response.data
      } catch (error: any) {
        console.warn('Backend request failed, falling back to direct API:', error.message)
        backendAvailable = false
      }
    }
    // Fallback to direct API with proxy
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}`
    return apiRequest(url)
  },

  getMarketChart: async (coinId: string, params: Record<string, any>) => {
    if (await isBackendAvailable()) {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/coins/${coinId}/market_chart`, { 
          params, 
          timeout: 20000 // Longer timeout for charts
        })
        return response.data
      } catch (error: any) {
        console.warn('Backend request failed, falling back to direct API:', error.message)
        backendAvailable = false
      }
    }
    // Fallback to direct API with proxy
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`
    return apiRequest(url, { 
      params,
      useProxy: false,
      retries: 3,
    })
  },
}

