import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Portfolio from './pages/Portfolio'
import Alerts from './pages/Alerts'
import Watchlist from './pages/Watchlist'
import { CryptoProvider } from './context/CryptoContext'

function App() {
  return (
    <CryptoProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </Layout>
      </Router>
    </CryptoProvider>
  )
}

export default App

