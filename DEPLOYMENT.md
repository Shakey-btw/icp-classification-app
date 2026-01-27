# Deployment Guide

## GitHub Repository

✅ **Repository Created**: https://github.com/Shakey-btw/icp-classification-app

Your code has been pushed to GitHub!

## Deploy to Vercel (Frontend)

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Repository**:
   - Click "Import Git Repository"
   - Select `Shakey-btw/icp-classification-app`
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Environment Variables** (Add these in Vercel):
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   ```
   (You'll update this after deploying the backend)

5. **Click "Deploy"**

6. **Wait for deployment** (~2-3 minutes)

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? icp-classification-app
# - Directory? ./
# - Override settings? No

# After initial deployment, deploy to production:
vercel --prod
```

## Deploy Backend (Multiple Options)

### Option 1: Railway (Easiest for FastAPI)

1. **Go to Railway**: https://railway.app

2. **New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `icp-classification-app`

3. **Configure Service**:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables if needed

4. **Get Backend URL**: Railway will provide a URL like `https://your-app.railway.app`

5. **Update Frontend**: Go back to Vercel and update the `NEXT_PUBLIC_API_URL` environment variable with your Railway URL

### Option 2: Render

1. **Go to Render**: https://render.com

2. **New Web Service**:
   - Connect your GitHub repo
   - Select `icp-classification-app`

3. **Configure**:
   - **Name**: icp-classification-backend
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables**:
   ```
   PYTHON_VERSION=3.9
   ```

5. **Get URL and update Vercel**

### Option 3: DigitalOcean App Platform

1. **Go to DigitalOcean**: https://cloud.digitalocean.com/apps

2. **Create App**:
   - Connect GitHub
   - Select repository
   - Choose `backend` directory

3. **Configure**:
   - **Type**: Web Service
   - **Run Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8080`

4. **Get URL and update Vercel**

## After Deployment

### Update Frontend API URL

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Update `NEXT_PUBLIC_API_URL` with your backend URL
4. Redeploy the frontend

### Update Backend CORS

Edit `backend/app/config.py` and add your Vercel URL to `CORS_ORIGINS`:

```python
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://your-app.vercel.app",  # Add this
]
```

Then commit and push:
```bash
git add backend/app/config.py
git commit -m "Update CORS for production"
git push
```

## Testing

1. Visit your Vercel URL (e.g., `https://icp-classification-app.vercel.app`)
2. Upload a CSV file
3. Test classification with arrow keys
4. Test download functionality

## Troubleshooting

### Frontend can't connect to backend
- Check that `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Ensure backend is running and accessible
- Check backend CORS settings include your Vercel URL

### Backend errors
- Check backend logs in Railway/Render/DigitalOcean
- Verify all dependencies are installed
- Check that the start command is correct

### Upload not working
- Check backend has write permissions for `data/` directories
- For production, consider using cloud storage (S3, etc.)

## Custom Domain (Optional)

### Add to Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Add to Backend
1. Configure custom domain in Railway/Render
2. Update CORS settings with custom domain
3. Update Vercel `NEXT_PUBLIC_API_URL` with custom backend domain

## Production Considerations

### Backend
- [ ] Set up persistent storage for session data (S3, database)
- [ ] Configure proper logging
- [ ] Set up error monitoring (Sentry)
- [ ] Add rate limiting
- [ ] Use production database instead of JSON files

### Frontend
- [ ] Configure analytics
- [ ] Set up error tracking
- [ ] Add monitoring

### Security
- [ ] Review CORS settings
- [ ] Add authentication if needed
- [ ] Implement API rate limiting
- [ ] Review file upload size limits

## Resources

- **GitHub Repo**: https://github.com/Shakey-btw/icp-classification-app
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
