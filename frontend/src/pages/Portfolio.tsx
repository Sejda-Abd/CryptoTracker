import React, { useState } from 'react'
import { useCrypto } from '../context/CryptoContext'
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react'
import { PortfolioItem } from '../context/CryptoContext'

export default function Portfolio() {
  const { portfolio, prices, addPortfolioItem, removePortfolioItem, updatePortfolioItem } = useCrypto()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    coinId: '',
    coinSymbol: '',
    coinName: '',
    amount: '',
    purchasePrice: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updatePortfolioItem(editingId, parseFloat(formData.amount), parseFloat(formData.purchasePrice))
      setEditingId(null)
    } else {
      addPortfolioItem({
        coinId: formData.coinId,
        coinSymbol: formData.coinSymbol,
        coinName: formData.coinName,
        amount: parseFloat(formData.amount),
        purchasePrice: parseFloat(formData.purchasePrice),
      })
    }
    setFormData({ coinId: '', coinSymbol: '', coinName: '', amount: '', purchasePrice: '' })
    setShowAddForm(false)
  }

  const handleEdit = (item: PortfolioItem) => {
    setEditingId(item.id)
    setFormData({
      coinId: item.coinId,
      coinSymbol: item.coinSymbol,
      coinName: item.coinName,
      amount: item.amount.toString(),
      purchasePrice: item.purchasePrice.toString(),
    })
    setShowAddForm(true)
  }

  const calculatePortfolioValue = () => {
    return portfolio.reduce((total: number, item: PortfolioItem) => {
      const currentPrice = prices.find((p: { id: string }) => p.id === item.coinId)?.current_price || 0
      return total + currentPrice * item.amount
    }, 0)
  }

  const calculateTotalCost = () => {
    return portfolio.reduce((total: number, item: PortfolioItem) => {
      return total + item.purchasePrice * item.amount
    }, 0)
  }

  const calculateProfit = () => {
    return calculatePortfolioValue() - calculateTotalCost()
  }

  const calculateProfitPercentage = () => {
    const cost = calculateTotalCost()
    if (cost === 0) return 0
    return (calculateProfit() / cost) * 100
  }

  const portfolioValue = calculatePortfolioValue()
  const totalCost = calculateTotalCost()
  const profit = calculateProfit()
  const profitPercentage = calculateProfitPercentage()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
          <p className="text-slate-400">Track your cryptocurrency investments</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingId(null)
            setFormData({ coinId: '', coinSymbol: '', coinName: '', amount: '', purchasePrice: '' })
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Coin</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Value</p>
          <p className="text-2xl font-bold text-white">${portfolioValue.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Cost</p>
          <p className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Profit/Loss</p>
          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${profit.toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Profit/Loss %</p>
          <p className={`text-2xl font-bold ${profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            {editingId ? 'Edit Portfolio Item' : 'Add to Portfolio'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Coin Name
                </label>
                <input
                  type="text"
                  value={formData.coinName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, coinName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Coin Symbol
                </label>
                <input
                  type="text"
                  value={formData.coinSymbol}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, coinSymbol: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Coin ID (from CoinGecko)
                </label>
                <input
                  type="text"
                  value={formData.coinId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, coinId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., bitcoin"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Purchase Price (USD)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.purchasePrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingId(null)
                  setFormData({ coinId: '', coinSymbol: '', coinName: '', amount: '', purchasePrice: '' })
                }}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Your Holdings</h2>
        </div>
        {portfolio.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p>No portfolio items yet. Add your first cryptocurrency holding!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                    Coin
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">
                    Purchase Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">
                    Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">
                    Profit/Loss
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {portfolio.map((item: PortfolioItem) => {
                  const currentPrice = prices.find((p: { id: string }) => p.id === item.coinId)?.current_price || 0
                  const value = currentPrice * item.amount
                  const profit = value - item.purchasePrice * item.amount
                  const profitPercent = ((currentPrice - item.purchasePrice) / item.purchasePrice) * 100

                  return (
                    <tr key={item.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {item.coinName} ({item.coinSymbol.toUpperCase()})
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300">
                        {item.amount.toFixed(6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300">
                        ${item.purchasePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300">
                        ${currentPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-white">
                        ${value.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-medium flex items-center justify-end ${
                          profit >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {profit >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          <div>
                            <div>${profit.toFixed(2)}</div>
                            <div className="text-xs">
                              {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-primary-400 hover:text-primary-300 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removePortfolioItem(item.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

