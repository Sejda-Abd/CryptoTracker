import { Router, Request, Response } from 'express'

export const healthCheck = Router()

healthCheck.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CryptoTracker Backend API',
  })
})

