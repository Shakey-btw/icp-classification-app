# Quick Deployment Guide

## ✅ GitHub Repository
**https://github.com/Shakey-btw/icp-classification-app**

---

## 🚀 Deploy in 3 Simple Steps

### Step 1: Deploy Backend (5 minutes)

**Railway (Recommended):**

1. Go to **https://railway.app**
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `icp-classification-app`
4. Set **Root Directory**: `backend`
5. Railway auto-detects everything else!
6. **Copy your backend URL** (looks like `https://xxx.railway.app`)

**Alternative: Render**
- Similar process, just set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

### Step 2: Deploy Frontend (3 minutes)

1. Go to **https://vercel.com/new**
2. Import repository: `Shakey-btw/icp-classification-app`
3. Set **Root Directory**: `frontend`
4. Click **Deploy** (yes, it's that simple!)

---

### Step 3: Connect Them (1 minute)

1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add **one** environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.railway.app/api
   ```
   (Use your Railway URL from Step 1, add `/api` at the end)
3. Vercel will automatically redeploy

---

## ✅ Done!

Your app is live! Visit your Vercel URL to test it.

---

## 🔧 How It Works

- **Development**: Frontend talks to `localhost:8000` (automatic)
- **Production**: Frontend uses `NEXT_PUBLIC_API_URL` environment variable
- No manual configuration needed beyond that one environment variable!

---

## 🐛 Troubleshooting

**Frontend shows errors:**
- Check that `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Make sure it ends with `/api` (e.g., `https://xxx.railway.app/api`)
- Verify your backend is running (visit the URL in browser)

**Backend errors:**
- Check logs in Railway dashboard
- Make sure `backend` directory is set as root

**CORS errors:**
- Backend will auto-allow your Vercel URL (it's already configured)

---

## 📝 Update Backend CORS (Optional)

If you want to restrict CORS to specific domains, edit `backend/app/config.py`:

```python
CORS_ORIGINS = [
    "http://localhost:3000",
    "https://your-app.vercel.app",  # Add your Vercel domain
]
```

Then commit and push:
```bash
git add backend/app/config.py
git commit -m "Update CORS"
git push
```

Railway will auto-deploy!

---

## 🎯 That's It!

- **No complex configuration**
- **One environment variable** to set
- **Auto-deploys** on git push
- **Free tier** available on both platforms
