import { useState } from 'react'
import { useCrypto } from '../context/CryptoContext'
import { Plus, Trash2, Bell, BellOff } from 'lucide-react'

export default function Alerts() {
  const { alerts, prices, addAlert, removeAlert } = useCrypto()
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    coinId: '',
    coinSymbol: '',
    coinName: '',
    targetPrice: '',
    condition: 'above' as 'above' | 'below',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addAlert({
      coinId: formData.coinId,
      coinSymbol: formData.coinSymbol,
      coinName: formData.coinName,
      targetPrice: parseFloat(formData.targetPrice),
      condition: formData.condition,
    })
    setFormData({ coinId: '', coinSymbol: '', coinName: '', targetPrice: '', condition: 'above' })
    setShowAddForm(false)
  }

  const getCurrentPrice = (coinId: string) => {
    return prices.find((p: { id: string }) => p.id === coinId)?.current_price || 0
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Price Alerts</h1>
          <p className="text-slate-400">Get notified when prices reach your target</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setFormData({ coinId: '', coinSymbol: '', coinName: '', targetPrice: '', condition: 'above' })
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create Alert</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Create Price Alert</h2>
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
                  Target Price (USD)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.targetPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, targetPrice: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Condition
                </label>
                <select
                  value={formData.condition}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, condition: e.target.value as 'above' | 'below' })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="above">Price goes above</option>
                  <option value="below">Price goes below</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Create Alert
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setFormData({ coinId: '', coinSymbol: '', coinName: '', targetPrice: '', condition: 'above' })
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
          <h2 className="text-xl font-semibold text-white">Active Alerts</h2>
        </div>
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <BellOff className="h-12 w-12 mx-auto mb-4 text-slate-500" />
            <p>No alerts yet. Create your first price alert!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {alerts.map((alert) => {
              const currentPrice = getCurrentPrice(alert.coinId)
              const isTriggered = alert.condition === 'above' 
                ? currentPrice >= alert.targetPrice 
                : currentPrice <= alert.targetPrice

              return (
                <div
                  key={alert.id}
                  className={`p-6 hover:bg-slate-700/30 transition-colors ${
                    !alert.isActive ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {alert.isActive ? (
                          <Bell className="h-5 w-5 text-primary-400" />
                        ) : (
                          <BellOff className="h-5 w-5 text-slate-500" />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {alert.coinName} ({alert.coinSymbol.toUpperCase()})
                          </h3>
                          <p className="text-sm text-slate-400">
                            Alert when price goes {alert.condition} ${alert.targetPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="ml-8 space-y-1">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-slate-400">Current Price:</span>
                          <span className="text-white font-medium">${currentPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-slate-400">Target Price:</span>
                          <span className="text-white font-medium">${alert.targetPrice.toFixed(2)}</span>
                        </div>
                        {isTriggered && alert.isActive && (
                          <div className="mt-2 px-3 py-1 bg-green-900/30 border border-green-700 rounded text-green-400 text-sm inline-block">
                            Alert Triggered!
                          </div>
                        )}
                        {!alert.isActive && (
                          <div className="mt-2 px-3 py-1 bg-slate-700 border border-slate-600 rounded text-slate-400 text-sm inline-block">
                            Alert Inactive
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="ml-4 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

