import React, { useState } from 'react'
import { ArrowUp, ArrowDown, TrendingUp, Star, ArrowUpDown } from 'lucide-react'
import { CryptoPrice } from '../context/CryptoContext'

interface PriceListProps {
  prices: CryptoPrice[]
  onSelectCoin: (coinId: string) => void
  favorites?: string[]
  onToggleFavorite?: (coinId: string) => void
  onCoinClick?: (coin: CryptoPrice) => void
}

type SortField = 'name' | 'price' | 'change' | 'market_cap' | 'volume'
type SortDirection = 'asc' | 'desc'

export default function PriceList({ 
  prices, 
  onSelectCoin, 
  favorites = [],
  onToggleFavorite,
  onCoinClick 
}: PriceListProps) {
  const [sortField, setSortField] = useState<SortField>('market_cap')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6)
    if (price < 1) return price.toFixed(4)
    return price.toFixed(2)
  }

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
    return `$${cap.toFixed(2)}`
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedPrices = [...prices].sort((a, b) => {
    let aValue: number | string
    let bValue: number | string

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue as string)
      case 'price':
        aValue = a.current_price
        bValue = b.current_price
        break
      case 'change':
        aValue = a.price_change_percentage_24h
        bValue = b.price_change_percentage_24h
        break
      case 'market_cap':
        aValue = a.market_cap
        bValue = b.market_cap
        break
      case 'volume':
        aValue = a.total_volume
        bValue = b.total_volume
        break
      default:
        return 0
    }

    if (sortDirection === 'asc') {
      return (aValue as number) - (bValue as number)
    } else {
      return (bValue as number) - (aValue as number)
    }
  })

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center justify-end space-x-1">
        <span>{children}</span>
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </th>
  )

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h2 className="text-xl font-semibold text-white">Live Prices</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <span>Coin</span>
                  {onToggleFavorite && (
                    <Star className="h-3 w-3" />
                  )}
                </div>
              </th>
              <SortableHeader field="price">Price</SortableHeader>
              <SortableHeader field="change">24h Change</SortableHeader>
              <SortableHeader field="market_cap">Market Cap</SortableHeader>
              <SortableHeader field="volume">Volume</SortableHeader>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">
                Chart
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {sortedPrices.map((coin) => (
              <tr
                key={coin.id}
                className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                onClick={() => {
                  if (onCoinClick) {
                    onCoinClick(coin)
                  } else {
                    onSelectCoin(coin.id)
                  }
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {onToggleFavorite && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite(coin.id)
                        }}
                        className="mr-2 text-slate-400 hover:text-yellow-400 transition-colors"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            favorites.includes(coin.id) ? 'fill-yellow-400 text-yellow-400' : ''
                          }`}
                        />
                      </button>
                    )}
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="h-8 w-8 rounded-full mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">{coin.name}</div>
                      <div className="text-sm text-slate-400 uppercase">{coin.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-white">
                    ${formatPrice(coin.current_price)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div
                    className={`text-sm font-medium flex items-center justify-end ${
                      coin.price_change_percentage_24h >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {coin.price_change_percentage_24h >= 0 ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-slate-300">{formatMarketCap(coin.market_cap)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-slate-300">{formatMarketCap(coin.total_volume)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation()
                      onSelectCoin(coin.id)
                    }}
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    <TrendingUp className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

