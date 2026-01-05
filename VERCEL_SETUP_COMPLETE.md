# ✅ Vercel Setup Complete!

## What Was Changed

### 1. Frontend - Environment Variable Support ✅

**File:** `frontend/src/utils/apiClient.ts`

**Changes:**
- ✅ Now properly reads `VITE_API_URL` from environment variables
- ✅ Falls back to `http://localhost:5000/api/coingecko` for development
- ✅ No hardcoded URLs

**How it works:**
```typescript
const BACKEND_API_URL = getBackendApiUrl()
// Reads from: import.meta.env.VITE_API_URL
```

### 2. Backend - CORS Configuration ✅

**File:** `backend/src/server.ts`

**Changes:**
- ✅ Allows multiple origins (localhost + Vercel)
- ✅ Supports Vercel preview deployments
- ✅ Configurable via environment variables

**Allowed Origins:**
- `http://localhost:3000` (development)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:5174` (Vite alternate port)
- `FRONTEND_URL` from environment (your Vercel URL)
- `VERCEL_URL` if set automatically
- `*.vercel.app` (if `ALLOW_VERCEL_PREVIEWS=true`)

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend First

Deploy your backend to Railway, Render, or Fly.io and get the URL:
```
https://your-backend.railway.app
```

### Step 2: Set Backend Environment Variables

In your backend platform (Railway/Render/etc), set:
```env
FRONTEND_URL=https://your-project.vercel.app
```

**Optional (for preview deployments):**
```env
ALLOW_VERCEL_PREVIEWS=true
```

### Step 3: Deploy Frontend to Vercel

1. **Connect your repo to Vercel:**
   - Go to vercel.com
   - Import your GitHub repo
   - Select the `frontend` folder as root

2. **Set Environment Variable in Vercel:**
   - Go to: **Project → Settings → Environment Variables**
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://your-backend.railway.app/api/coingecko
     ```
   - **Important:** Include `/api/coingecko` at the end!

3. **Deploy:**
   - Vercel will automatically deploy
   - Or trigger a new deployment after adding env var

### Step 4: Update Backend with Vercel URL

After you get your Vercel URL, update backend:
```env
FRONTEND_URL=https://your-actual-project.vercel.app
```

---

## 📋 Environment Variables Checklist

### Frontend (Vercel Dashboard):
- [ ] `VITE_API_URL` = `https://your-backend-url/api/coingecko`

### Backend (Railway/Render/etc):
- [ ] `FRONTEND_URL` = `https://your-project.vercel.app`
- [ ] (Optional) `ALLOW_VERCEL_PREVIEWS` = `true`

---

## ✅ Verification

### Test Frontend:
1. Open your Vercel deployment
2. Open browser console (F12)
3. Should see: `✅ Backend API is available, using it for requests`
4. Charts should load without CORS errors

### Test Backend CORS:
```bash
curl -H "Origin: https://your-project.vercel.app" \
     https://your-backend-url/api/health
```

Should return JSON without CORS errors.

---

## 🎯 What This Fixes

✅ **No hardcoded URLs** - Everything uses environment variables  
✅ **CORS works** - Backend allows Vercel domains  
✅ **Preview deployments** - Can allow all Vercel previews  
✅ **Production ready** - Secure and configurable  

---

## 📝 Quick Reference

**Frontend Environment Variable:**
```
VITE_API_URL=https://your-backend.railway.app/api/coingecko
```

**Backend Environment Variables:**
```
FRONTEND_URL=https://your-project.vercel.app
ALLOW_VERCEL_PREVIEWS=false  # Optional
```

---

Everything is now configured for Vercel deployment! 🚀

