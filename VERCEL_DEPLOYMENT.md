# Deploy Everything to Vercel

Your backend is now ready for Vercel! The code automatically detects whether it's running on Vercel or locally and uses the appropriate storage.

## Storage Setup

The app now uses:
- **Development**: Local JSON files (automatic, no setup)
- **Production (Vercel)**: Upstash Redis + Vercel Blob (needs setup)

## Step 1: Deploy Backend to Vercel

### 1.1 Create Upstash Redis Database (for sessions)

1. Go to https://vercel.com/dashboard
2. Click your project (or create new)
3. Go to **Storage** tab
4. Click **Create Database** → Scroll to **Marketplace Database Providers**
5. Click **Upstash** → Click **Continue**
6. Create a Redis database → Name it `icp-sessions`
7. Vercel will auto-connect it to your project

### 1.2 Create Vercel Blob Storage (for files)

1. Still in Storage tab
2. Click **Create Store** → Select **Blob**
3. Name it `icp-uploads` → Create

### 1.3 Deploy Backend

**Option A: Via Dashboard**
1. Go to https://vercel.com/new
2. Import `icp-classification-app` repo
3. Set **Root Directory**: `backend`
4. Click **Deploy**
5. Vercel auto-connects KV and Blob!

**Option B: Via CLI**
```bash
cd backend
vercel

# Link the KV and Blob stores when prompted
vercel --prod
```

### 1.4 Get Backend URL

After deployment, copy your backend URL (e.g., `https://icp-backend.vercel.app`)

## Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Import `icp-classification-app` repo  (same repo, different project!)
3. Set **Root Directory**: `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.vercel.app/api`
5. Click **Deploy**

## Step 3: Update Backend CORS

1. Go to backend project settings
2. Add environment variable:
   - `FRONTEND_URL` = `https://your-frontend.vercel.app`
3. Redeploy backend

## Done!

Both frontend and backend are now on Vercel!

## How It Works

### Development (localhost)
```
Sessions → data/sessions/ (JSON files)
Uploads → data/uploads/ (local files)
```

### Production (Vercel)
```
Sessions → Upstash Redis (via Vercel Marketplace)
Uploads → Vercel Blob (Cloud storage)
```

The code automatically detects the environment and uses the right storage!

## Troubleshooting

**"Redis credentials not found"**
- Make sure you connected Upstash Redis from Vercel Storage → Marketplace
- Check Environment Variables tab has `KV_URL` or `REDIS_URL`
- Verify the integration is properly connected in Vercel dashboard

**"Blob token not found"**
- Make sure you created Vercel Blob and it's linked to your project
- Check Environment Variables tab has `BLOB_READ_WRITE_TOKEN`

**Sessions not persisting**
- Check Upstash Redis is properly connected
- View data in Upstash dashboard (link from Vercel Storage tab)

**Files not uploading**
- Check Vercel Blob is properly configured
- View files in Vercel dashboard → Storage → Blob → Browse

## Cost

**Free Tier Includes:**
- Upstash Redis: 10k commands/day (free tier)
- Vercel Blob: 1 GB storage, 10k operations/month
- More than enough for personal use!

## Advantages vs Railway

✅ Everything in one platform
✅ No separate backend to manage
✅ Auto-scales
✅ Faster global CDN
✅ Integrated storage
✅ Better DX (developer experience)

## Local Development

Still works perfectly! Just run:
```bash
# Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

No configuration needed - automatically uses local storage!
