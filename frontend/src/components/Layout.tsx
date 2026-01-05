import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Wallet, Bell, Star } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center space-x-2 px-2 py-2">
                <TrendingUp className="h-8 w-8 text-primary-400" />
                <span className="text-xl font-bold text-white">CryptoTracker</span>
              </Link>
            </div>
            <div className="flex space-x-1">
              <Link
                to="/"
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/portfolio"
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/portfolio')
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Portfolio
              </Link>
              <Link
                to="/alerts"
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/alerts')
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Bell className="h-4 w-4 mr-2" />
                Alerts
              </Link>
              <Link
                to="/watchlist"
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/watchlist')
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Star className="h-4 w-4 mr-2" />
                Watchlist
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

