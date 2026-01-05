import { useEffect, useState } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface PriceChangeIndicatorProps {
  currentPrice: number
  previousPrice: number
  changePercent: number
}

export default function PriceChangeIndicator({ 
  currentPrice, 
  previousPrice, 
  changePercent 
}: PriceChangeIndicatorProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (previousPrice && currentPrice !== previousPrice) {
      setPriceChange(currentPrice > previousPrice ? 'up' : 'down')
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [currentPrice, previousPrice])

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6)
    if (price < 1) return price.toFixed(4)
    return price.toFixed(2)
  }

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`transition-all duration-300 ${
          isAnimating && priceChange === 'up'
            ? 'text-green-400 scale-110'
            : isAnimating && priceChange === 'down'
            ? 'text-red-400 scale-110'
            : 'text-white'
        }`}
      >
        ${formatPrice(currentPrice)}
      </div>
      <div
        className={`flex items-center text-sm font-medium transition-all duration-300 ${
          changePercent >= 0
            ? isAnimating && priceChange === 'up'
              ? 'text-green-400 scale-110'
              : 'text-green-400'
            : isAnimating && priceChange === 'down'
            ? 'text-red-400 scale-110'
            : 'text-red-400'
        }`}
      >
        {changePercent >= 0 ? (
          <ArrowUp className="h-3 w-3 mr-1" />
        ) : (
          <ArrowDown className="h-3 w-3 mr-1" />
        )}
        {Math.abs(changePercent).toFixed(2)}%
      </div>
    </div>
  )
}

