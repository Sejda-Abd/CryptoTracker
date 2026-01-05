import { useCrypto } from '../context/CryptoContext'
import PriceList from '../components/PriceList'
import { Star } from 'lucide-react'

export default function Watchlist() {
  const { prices, favorites, toggleFavorite, isFavorite } = useCrypto()
  
  const favoriteCoins = prices.filter((coin) => isFavorite(coin.id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-2">
          <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
          <span>Watchlist</span>
        </h1>
        <p className="text-slate-400">Your favorite cryptocurrencies</p>
      </div>

      {favoriteCoins.length === 0 ? (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
          <Star className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No favorites yet</h2>
          <p className="text-slate-400 mb-4">
            Start adding cryptocurrencies to your watchlist by clicking the star icon
          </p>
        </div>
      ) : (
        <PriceList
          prices={favoriteCoins}
          onSelectCoin={() => {}}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  )
}

