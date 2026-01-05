import { useState } from 'react'
import { useCrypto, CryptoPrice } from '../context/CryptoContext'
import PriceList from '../components/PriceList'
import PriceChart from '../components/PriceChart'
import SearchBar from '../components/SearchBar'
import TopGainersLosers from '../components/TopGainersLosers'
import CoinDetailsModal from '../components/CoinDetailsModal'
import { Loader2, AlertCircle, TrendingUp, DollarSign, BarChart3, RefreshCw } from 'lucide-react'

export default function Dashboard() {
  const { prices, loading, error, toggleFavorite, isFavorite, refreshPrices } = useCrypto()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null)
  const [selectedCoinDetails, setSelectedCoinDetails] = useState<CryptoPrice | null>(null)

  const filteredPrices = prices.filter(
    (coin: { name: string; symbol: string }) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && prices.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    )
  }

  if (error && prices.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cryptocurrency Dashboard</h1>
          <p className="text-slate-400">Real-time prices and market data</p>
        </div>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Unable to Load Data</h3>
              <p className="text-red-300 mb-4">{error}</p>
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-300 mb-2"><strong>Possible Solutions:</strong></p>
                <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
                  <li>Wait a minute and try refreshing (CoinGecko free API has rate limits)</li>
                  <li>Check your internet connection</li>
                  <li>Try using a different network or VPN</li>
                  <li>Clear your browser cache and reload</li>
                </ul>
              </div>
              <button
                onClick={refreshPrices}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Refreshing...' : 'Retry'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalMarketCap = prices.reduce((sum: number, coin: { market_cap: number }) => sum + coin.market_cap, 0)
  const totalVolume = prices.reduce((sum: number, coin: { total_volume: number }) => sum + coin.total_volume, 0)
  const btcDominance = prices.find((p) => p.id === 'bitcoin')?.market_cap || 0
  const btcDominancePercent = totalMarketCap > 0 ? (btcDominance / totalMarketCap) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cryptocurrency Dashboard</h1>
          <p className="text-slate-400">Real-time prices and market data</p>
        </div>
        {error && (
          <button
            onClick={refreshPrices}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            title="Refresh prices"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        )}
      </div>

      {error && prices.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <p className="text-yellow-400 text-sm">{error}</p>
          </div>
          <button
            onClick={refreshPrices}
            disabled={loading}
            className="text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Enhanced Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg p-6 border border-primary-700">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-white/80" />
            <span className="text-xs text-white/60">Market Cap</span>
          </div>
          <p className="text-2xl font-bold text-white">${(totalMarketCap / 1e12).toFixed(2)}T</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-6 border border-green-700">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-5 w-5 text-white/80" />
            <span className="text-xs text-white/60">24h Volume</span>
          </div>
          <p className="text-2xl font-bold text-white">${(totalVolume / 1e9).toFixed(2)}B</p>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-lg p-6 border border-orange-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-white/80" />
            <span className="text-xs text-white/60">BTC Dominance</span>
          </div>
          <p className="text-2xl font-bold text-white">{btcDominancePercent.toFixed(2)}%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 border border-purple-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-white/80" />
            <span className="text-xs text-white/60">Total Coins</span>
          </div>
          <p className="text-2xl font-bold text-white">{prices.length}</p>
        </div>
      </div>

      {/* Top Gainers/Losers */}
      <TopGainersLosers prices={prices} onSelectCoin={setSelectedCoin} />

      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {selectedCoin ? (
            <PriceChart coinId={selectedCoin} onClose={() => setSelectedCoin(null)} />
          ) : (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-center">
                Select a cryptocurrency to view its price chart
              </p>
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Market Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Coins</span>
                <span className="text-white font-medium">{prices.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Market Cap</span>
                <span className="text-white font-medium">
                  ${(totalMarketCap / 1e12).toFixed(2)}T
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">24h Volume</span>
                <span className="text-white font-medium">
                  ${(totalVolume / 1e9).toFixed(2)}B
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">BTC Dominance</span>
                <span className="text-white font-medium">
                  {btcDominancePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PriceList 
        prices={filteredPrices} 
        onSelectCoin={setSelectedCoin}
        favorites={prices.filter(p => isFavorite(p.id)).map(p => p.id)}
        onToggleFavorite={toggleFavorite}
        onCoinClick={(coin) => setSelectedCoinDetails(coin)}
      />

      {selectedCoinDetails && (
        <CoinDetailsModal
          coin={selectedCoinDetails}
          onClose={() => setSelectedCoinDetails(null)}
          onSelectChart={setSelectedCoin}
        />
      )}
    </div>
  )
}

