# Vercel Deployment Guide

## 🚀 Quick Setup for Vercel

### Frontend Deployment (Vercel)

#### 1. Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

#### 2. Deploy Frontend
```bash
cd frontend
vercel
```

Or connect your GitHub repo directly in Vercel Dashboard.

#### 3. Set Environment Variables in Vercel

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Add:**
```
VITE_API_URL = https://your-backend-url.railway.app/api/coingecko
```

**Important:** 
- Replace `your-backend-url.railway.app` with your actual backend URL
- Use the full URL including `/api/coingecko`
- No trailing slash

#### 4. Redeploy
After adding environment variables, Vercel will automatically redeploy, or you can manually trigger a redeploy.

---

### Backend CORS Configuration

The backend is already configured to allow Vercel domains. You just need to set the environment variable.

#### Option 1: Specific Vercel URL (Recommended for Production)

In your backend `.env` file (or Railway/Render environment variables):

```env
FRONTEND_URL=https://your-project.vercel.app
```

#### Option 2: Allow All Vercel Previews (For Development)

If you want to allow all Vercel preview deployments:

```env
ALLOW_VERCEL_PREVIEWS=true
FRONTEND_URL=https://your-main-project.vercel.app
```

**Note:** This allows any `*.vercel.app` domain. For production, use Option 1 for better security.

---

## 📋 Deployment Checklist

### Frontend (Vercel):
- [ ] Deploy to Vercel
- [ ] Set `VITE_API_URL` environment variable
- [ ] Verify deployment works
- [ ] Test API connection

### Backend (Railway/Render/etc):
- [ ] Deploy backend
- [ ] Set `FRONTEND_URL` to your Vercel URL
- [ ] (Optional) Set `ALLOW_VERCEL_PREVIEWS=true` if needed
- [ ] Test CORS: `curl -H "Origin: https://your-project.vercel.app" https://your-backend-url/api/health`

---

## 🔍 Testing CORS

### Test from Browser Console:

```javascript
fetch('https://your-backend-url/api/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(res => res.json())
.then(data => console.log('✅ CORS works!', data))
.catch(err => console.error('❌ CORS error:', err))
```

### Test with curl:

```bash
curl -H "Origin: https://your-project.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-backend-url/api/health
```

---

## 🐛 Troubleshooting

### CORS Still Blocked?

1. **Check backend logs** - Should see CORS warnings if origin is blocked
2. **Verify FRONTEND_URL** - Must match exactly (including https://)
3. **Check Vercel URL** - Make sure you're using the correct Vercel deployment URL
4. **Try ALLOW_VERCEL_PREVIEWS=true** - For testing only

### Environment Variable Not Working?

1. **Redeploy after adding env var** - Vercel needs a new build
2. **Check variable name** - Must be exactly `VITE_API_URL`
3. **Check build logs** - Should see the variable being used
4. **Clear browser cache** - Old builds might be cached

### Backend Not Connecting?

1. **Verify backend is running** - Check health endpoint
2. **Check VITE_API_URL** - Must be full URL with `/api/coingecko`
3. **Check browser console** - Look for network errors
4. **Test backend directly** - `curl https://your-backend-url/api/health`

---

## 📝 Environment Variables Summary

### Frontend (Vercel):
```
VITE_API_URL=https://your-backend-url.railway.app/api/coingecko
```

### Backend (Railway/Render):
```
FRONTEND_URL=https://your-project.vercel.app
ALLOW_VERCEL_PREVIEWS=false  # Optional, for preview deployments
```

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Frontend loads without errors
- ✅ Charts load successfully
- ✅ No CORS errors in browser console
- ✅ Network tab shows requests to your backend URL
- ✅ Backend logs show successful requests

---

## 🎯 Quick Reference

**Frontend URL Pattern:**
```
https://your-project.vercel.app
https://your-project-git-branch.vercel.app  (preview)
https://your-project-abc123.vercel.app     (deployment)
```

**Backend URL Pattern:**
```
https://your-backend.railway.app/api/coingecko
https://your-backend.onrender.com/api/coingecko
```

**Environment Variables:**
- Frontend: `VITE_API_URL` (in Vercel)
- Backend: `FRONTEND_URL` (in Railway/Render)

---

That's it! Your app should now work perfectly on Vercel! 🚀

