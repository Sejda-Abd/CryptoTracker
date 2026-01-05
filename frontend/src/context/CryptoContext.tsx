import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { coinGeckoAPI } from '../utils/apiClient'

export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  high_24h: number
  low_24h: number
}

export interface PriceAlert {
  id: string
  coinId: string
  coinSymbol: string
  coinName: string
  targetPrice: number
  condition: 'above' | 'below'
  isActive: boolean
}

export interface PortfolioItem {
  id: string
  coinId: string
  coinSymbol: string
  coinName: string
  amount: number
  purchasePrice: number
}

interface CryptoContextType {
  prices: CryptoPrice[]
  loading: boolean
  error: string | null
  alerts: PriceAlert[]
  portfolio: PortfolioItem[]
  favorites: string[]
  addAlert: (alert: Omit<PriceAlert, 'id' | 'isActive'>) => void
  removeAlert: (id: string) => void
  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => void
  removePortfolioItem: (id: string) => void
  updatePortfolioItem: (id: string, amount: number, purchasePrice: number) => void
  toggleFavorite: (coinId: string) => void
  isFavorite: (coinId: string) => boolean
  refreshPrices: () => void
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined)

export const useCrypto = () => {
  const context = useContext(CryptoContext)
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider')
  }
  return context
}

export const CryptoProvider = ({ children }: { children: ReactNode }) => {
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('cryptoAlerts')
    const savedPortfolio = localStorage.getItem('cryptoPortfolio')
    const savedFavorites = localStorage.getItem('cryptoFavorites')
    
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts))
    }
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio))
    }
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem('cryptoAlerts', JSON.stringify(alerts))
  }, [alerts])

  // Save portfolio to localStorage
  useEffect(() => {
    localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio))
  }, [portfolio])

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('cryptoFavorites', JSON.stringify(favorites))
  }, [favorites])

  // Fetch crypto prices with retry logic
  const fetchPrices = async (retryCount = 0): Promise<void> => {
    try {
      setError(null)
      
      const data = await coinGeckoAPI.getMarkets({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 50, // Reduced to avoid rate limits
        page: 1,
        sparkline: false,
      })
      
      setPrices(data)
      setLoading(false)
      
      // Clear any previous rate limit errors
      if (retryCount > 0) {
        setError(null)
      }
    } catch (err: any) {
      const status = err?.response?.status
      const isRateLimit = status === 429
      const isNetworkError = err?.code === 'ERR_NETWORK' || err?.message?.includes('CORS')
      
      if (isRateLimit || isNetworkError) {
        // Rate limit or CORS error - show helpful message
        if (isRateLimit) {
          setError('Rate limit exceeded. Please wait a minute before refreshing. The free CoinGecko API allows 10-50 calls per minute.')
        } else {
          setError('Network error. The app is trying to use a CORS proxy. If issues persist, wait a moment and try again.')
        }
        
        // Retry with exponential backoff (max 2 retries)
        if (retryCount < 2) {
          const delay = Math.min(2000 * Math.pow(2, retryCount), 10000) // Max 10 seconds
          setTimeout(() => {
            fetchPrices(retryCount + 1)
          }, delay)
          return
        }
      } else {
        setError('Failed to fetch cryptocurrency prices. Please try again later.')
      }
      
      setLoading(false)
      console.error('Error fetching prices:', err)
    }
  }

  // Initial fetch and periodic updates (increased interval to avoid rate limits)
  useEffect(() => {
    fetchPrices()
    // Update every 2 minutes instead of 30 seconds to avoid rate limits
    const interval = setInterval(() => fetchPrices(), 120000)
    return () => clearInterval(interval)
  }, [])

  // Check alerts
  useEffect(() => {
      alerts.forEach((alert: PriceAlert) => {
        if (!alert.isActive) return
        
        const coin = prices.find((p: CryptoPrice) => p.id === alert.coinId)
      if (!coin) return

      const shouldTrigger =
        alert.condition === 'above'
          ? coin.current_price >= alert.targetPrice
          : coin.current_price <= alert.targetPrice

      if (shouldTrigger) {
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Price Alert: ${alert.coinName}`, {
            body: `${alert.coinSymbol.toUpperCase()} is now ${alert.condition} $${alert.targetPrice.toFixed(2)}`,
            icon: coin.image,
          })
        }
        // Deactivate alert
        setAlerts((prev: PriceAlert[]) =>
          prev.map((a: PriceAlert) => (a.id === alert.id ? { ...a, isActive: false } : a))
        )
      }
    })
  }, [prices, alerts])

  const addAlert = (alert: Omit<PriceAlert, 'id' | 'isActive'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: Date.now().toString(),
      isActive: true,
    }
    setAlerts((prev: PriceAlert[]) => [...prev, newAlert])
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const removeAlert = (id: string) => {
    setAlerts((prev: PriceAlert[]) => prev.filter((a: PriceAlert) => a.id !== id))
  }

  const addPortfolioItem = (item: Omit<PortfolioItem, 'id'>) => {
    const newItem: PortfolioItem = {
      ...item,
      id: Date.now().toString(),
    }
    setPortfolio((prev: PortfolioItem[]) => [...prev, newItem])
  }

  const removePortfolioItem = (id: string) => {
    setPortfolio((prev: PortfolioItem[]) => prev.filter((p: PortfolioItem) => p.id !== id))
  }

  const updatePortfolioItem = (id: string, amount: number, purchasePrice: number) => {
    setPortfolio((prev: PortfolioItem[]) =>
      prev.map((p: PortfolioItem) =>
        p.id === id ? { ...p, amount, purchasePrice } : p
      )
    )
  }

  const toggleFavorite = (coinId: string) => {
    setFavorites((prev: string[]) => {
      if (prev.includes(coinId)) {
        return prev.filter((id: string) => id !== coinId)
      } else {
        return [...prev, coinId]
      }
    })
  }

  const isFavorite = (coinId: string) => {
    return favorites.includes(coinId)
  }

  const refreshPrices = () => {
    setLoading(true)
    fetchPrices()
  }

  return (
    <CryptoContext.Provider
      value={{
        prices,
        loading,
        error,
        alerts,
        portfolio,
        favorites,
        addAlert,
        removeAlert,
        addPortfolioItem,
        removePortfolioItem,
        updatePortfolioItem,
        toggleFavorite,
        isFavorite,
        refreshPrices,
      }}
    >
      {children}
    </CryptoContext.Provider>
  )
}

