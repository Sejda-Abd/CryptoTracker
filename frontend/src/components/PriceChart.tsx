import { useState, useEffect, useRef, useCallback } from 'react'
import { coinGeckoAPI } from '../utils/apiClient'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { X, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface PriceChartProps {
  coinId: string
  onClose: () => void
}

interface ChartDataPoint {
  time: string
  price: number
  timestamp: number
}

export default function PriceChart({ coinId, onClose }: PriceChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'1' | '7' | '30' | '90' | '365'>('7')
  const [coinInfo, setCoinInfo] = useState<{ name: string; symbol: string; image: string } | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const lastRequestTime = useRef<number>(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch coin info only once when coinId changes
  useEffect(() => {
    const fetchCoinInfo = async () => {
      try {
        const coinData = await coinGeckoAPI.getCoin(coinId)
        setCoinInfo({
          name: coinData.name,
          symbol: coinData.symbol,
          image: coinData.image.small,
        })
      } catch (err) {
        // If coin info fails, we can still show the chart with just the coinId
        console.error('Error fetching coin info:', err)
      }
    }

    fetchCoinInfo()
  }, [coinId])

  // Fetch chart data with retry logic and rate limiting
  const fetchChartData = useCallback(async (retryCount = 0): Promise<void> => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Rate limiting: prevent requests if less than 3 seconds since last request
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime.current
    if (timeSinceLastRequest < 3000 && retryCount === 0) {
      // Wait before making the request to avoid rate limits
      const waitTime = 3000 - timeSinceLastRequest
      console.log(`Rate limit protection: waiting ${waitTime}ms...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    lastRequestTime.current = Date.now()

    setLoading(true)
    setError(null)
    setIsRateLimited(false)

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const days = timeRange === '1' ? 1 : timeRange === '7' ? 7 : timeRange === '30' ? 30 : timeRange === '90' ? 90 : 365
      
      // Check if request was aborted before making the call
      if (abortController.signal.aborted) return

      const data = await coinGeckoAPI.getMarketChart(coinId, {
        vs_currency: 'usd',
        days: days,
      })

      if (abortController.signal.aborted) return

      const prices = data.prices.map(([timestamp, price]: [number, number]) => ({
        time: format(new Date(timestamp), days <= 1 ? 'HH:mm' : 'MMM dd'),
        price: Number(price.toFixed(2)),
        timestamp,
      }))

      setChartData(prices)
      setIsRateLimited(false)
    } catch (err: any) {
      if (abortController.signal.aborted) return

      const status = err?.response?.status
      const isRateLimit = status === 429
      const isNetworkError = err?.code === 'ERR_NETWORK' || err?.message?.includes('CORS')

      if (isRateLimit || isNetworkError) {
        setIsRateLimited(true)
        if (isRateLimit) {
          setError('Rate limit exceeded. Please wait a minute before trying again.')
        } else {
          setError('Network error. This may be due to CORS restrictions.')
        }

        // Retry with exponential backoff (max 2 retries for charts)
        if (retryCount < 2) {
          const delay = Math.min(2000 * Math.pow(2, retryCount), 10000) // Max 10 seconds
          setTimeout(() => {
            fetchChartData(retryCount + 1)
          }, delay)
          return
        }
      } else {
        setError('Failed to load chart data. Please try again later.')
      }
      
      console.error('Error fetching chart data:', err)
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false)
      }
    }
  }, [coinId, timeRange])

  // Debounced effect for time range changes with longer debounce to prevent rapid requests
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChartData()
    }, 500) // 500ms debounce to prevent rapid clicking

    return () => {
      clearTimeout(timer)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchChartData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const formatPrice = (value: number) => `$${value.toLocaleString()}`

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          {coinInfo && (
            <>
              <img src={coinInfo.image} alt={coinInfo.name} className="h-8 w-8 rounded-full" />
              <div>
                <h3 className="text-xl font-semibold text-white">{coinInfo.name}</h3>
                <p className="text-sm text-slate-400 uppercase">{coinInfo.symbol}</p>
              </div>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          {(['1', '7', '30', '90', '365'] as const).map((range) => (
            <button
              key={range}
              onClick={() => {
                if (!loading && !isRateLimited) {
                  setTimeRange(range)
                }
              }}
              disabled={loading || isRateLimited}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {range === '1' ? '24H' : range === '365' ? '1Y' : `${range}D`}
            </button>
          ))}
        </div>
        {error && (
          <button
            onClick={() => fetchChartData()}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
            title="Retry loading chart"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Retry</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-400 text-sm">{error}</p>
              {isRateLimited && (
                <p className="text-yellow-300 text-xs mt-1">
                  The free CoinGecko API has rate limits. Please wait a minute before trying again.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
          <p className="text-slate-400 text-sm">Loading chart data...</p>
        </div>
      ) : error && chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <AlertCircle className="h-12 w-12 text-slate-500" />
          <p className="text-slate-400">Unable to load chart data</p>
          <button
            onClick={() => fetchChartData()}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              tickFormatter={formatPrice}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: any) => formatPrice(value as number)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
              name="Price (USD)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

