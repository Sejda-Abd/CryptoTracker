import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react'
import { CryptoPrice } from '../context/CryptoContext'

interface TopGainersLosersProps {
  prices: CryptoPrice[]
  onSelectCoin: (coinId: string) => void
}

export default function TopGainersLosers({ prices, onSelectCoin }: TopGainersLosersProps) {
  const topGainers = [...prices]
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5)

  const topLosers = [...prices]
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 5)

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6)
    if (price < 1) return price.toFixed(4)
    return price.toFixed(2)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Top Gainers */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 bg-green-900/20">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Top Gainers (24h)</h2>
          </div>
        </div>
        <div className="divide-y divide-slate-700">
          {topGainers.map((coin, index) => (
            <div
              key={coin.id}
              onClick={() => onSelectCoin(coin.id)}
              className="px-6 py-4 hover:bg-slate-700/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-900/30 text-green-400 text-xs font-bold">
                    {index + 1}
                  </div>
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{coin.name}</div>
                    <div className="text-xs text-slate-400 uppercase">{coin.symbol}</div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-medium text-white">${formatPrice(coin.current_price)}</div>
                  <div className="text-sm font-medium text-green-400 flex items-center justify-end">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +{coin.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Losers */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 bg-red-900/20">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-red-400" />
            <h2 className="text-lg font-semibold text-white">Top Losers (24h)</h2>
          </div>
        </div>
        <div className="divide-y divide-slate-700">
          {topLosers.map((coin, index) => (
            <div
              key={coin.id}
              onClick={() => onSelectCoin(coin.id)}
              className="px-6 py-4 hover:bg-slate-700/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-900/30 text-red-400 text-xs font-bold">
                    {index + 1}
                  </div>
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{coin.name}</div>
                    <div className="text-xs text-slate-400 uppercase">{coin.symbol}</div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-medium text-white">${formatPrice(coin.current_price)}</div>
                  <div className="text-sm font-medium text-red-400 flex items-center justify-end">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

