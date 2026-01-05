import { useEffect, useState } from 'react'
import { coinGeckoAPI } from '../utils/apiClient'
import { X, Loader2, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react'
import { CryptoPrice } from '../context/CryptoContext'

interface CoinDetailsModalProps {
  coin: CryptoPrice | null
  onClose: () => void
  onSelectChart: (coinId: string) => void
}

interface CoinDetails {
  name: string
  symbol: string
  image: { large: string }
  description: { en: string }
  links: {
    homepage: string[]
    blockchain_site: string[]
  }
  market_data: {
    current_price: { usd: number }
    price_change_percentage_24h: number
    market_cap: { usd: number }
    total_volume: { usd: number }
    high_24h: { usd: number }
    low_24h: { usd: number }
    circulating_supply: number
    total_supply: number
    max_supply: number | null
  }
}

export default function CoinDetailsModal({ coin, onClose, onSelectChart }: CoinDetailsModalProps) {
  const [details, setDetails] = useState<CoinDetails | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (coin) {
      setLoading(true)
      setDetails(null)
      coinGeckoAPI
        .getCoin(coin.id)
        .then((data) => {
          setDetails(data)
          setLoading(false)
        })
        .catch((error: any) => {
          console.error('Error fetching coin details:', error)
          setLoading(false)
          // Don't show error in modal, just log it - user can still see basic info from coin prop
        })
    }
  }, [coin])

  if (!coin) return null

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatSupply = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toLocaleString()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold text-white">{coin.name}</h2>
              <p className="text-slate-400 uppercase">{coin.symbol}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onSelectChart(coin.id)
                onClose()
              }}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
            >
              View Chart
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
          </div>
        ) : details ? (
          <div className="p-6 space-y-6">
            {/* Price Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Current Price</p>
                <p className="text-xl font-bold text-white">
                  ${details.market_data.current_price.usd.toLocaleString()}
                </p>
                <div
                  className={`text-sm mt-1 flex items-center ${
                    details.market_data.price_change_percentage_24h >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {details.market_data.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {details.market_data.price_change_percentage_24h >= 0 ? '+' : ''}
                  {details.market_data.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Market Cap</p>
                <p className="text-xl font-bold text-white">
                  {formatNumber(details.market_data.market_cap.usd)}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">24h High</p>
                <p className="text-xl font-bold text-green-400">
                  ${details.market_data.high_24h.usd.toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">24h Low</p>
                <p className="text-xl font-bold text-red-400">
                  ${details.market_data.low_24h.usd.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Supply Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Circulating Supply</p>
                <p className="text-lg font-semibold text-white">
                  {formatSupply(details.market_data.circulating_supply)}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Total Supply</p>
                <p className="text-lg font-semibold text-white">
                  {formatSupply(details.market_data.total_supply)}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Max Supply</p>
                <p className="text-lg font-semibold text-white">
                  {details.market_data.max_supply
                    ? formatSupply(details.market_data.max_supply)
                    : '∞'}
                </p>
              </div>
            </div>

            {/* Description */}
            {details.description.en && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                <p className="text-slate-300 leading-relaxed">
                  {details.description.en.split('. ').slice(0, 3).join('. ')}.
                </p>
              </div>
            )}

            {/* Links */}
            {(details.links.homepage[0] || details.links.blockchain_site[0]) && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Links</h3>
                <div className="flex flex-wrap gap-2">
                  {details.links.homepage[0] && (
                    <a
                      href={details.links.homepage[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <span>Website</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {details.links.blockchain_site[0] && (
                    <a
                      href={details.links.blockchain_site[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <span>Blockchain</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400">
            Failed to load coin details
          </div>
        )}
      </div>
    </div>
  )
}

