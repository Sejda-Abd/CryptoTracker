import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { coinGeckoProxy } from './routes/coinGecko.js'
import { healthCheck } from './routes/health.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// CORS Configuration - Allow multiple origins
// Supports localhost for development and Vercel for production
const getAllowedOrigins = (): (string | RegExp)[] => {
  const origins: (string | RegExp)[] = []
  
  // Add localhost origins for development
  origins.push('http://localhost:3000')
  origins.push('http://localhost:5173') // Vite default port
  origins.push('http://localhost:5174')
  
  // Add FRONTEND_URL from environment (for production)
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL)
  }
  
  // Add VERCEL_URL if provided (Vercel automatically sets this)
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`)
  }
  
  // Allow any Vercel preview/deployment URLs (pattern matching)
  // Vercel URLs follow pattern: project-name-*.vercel.app
  if (process.env.ALLOW_VERCEL_PREVIEWS === 'true') {
    // This allows all Vercel preview deployments
    // For production, specify exact URLs in FRONTEND_URL
    origins.push(/^https:\/\/.*\.vercel\.app$/)
  }
  
  return origins
}

// Middleware
app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins()
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true)
    }
    
    // Check if origin matches any allowed origin
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin)
      }
      return false
    })
    
    if (isAllowed) {
      callback(null, true)
    } else {
      console.warn(`CORS blocked origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', limiter)

// Routes
app.use('/api/health', healthCheck)
app.use('/api/coingecko', coinGeckoProxy)

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🚀 CryptoTracker Backend Server running on port ${PORT}`)
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔒 CORS: Allowing origins from FRONTEND_URL and localhost`)
})

