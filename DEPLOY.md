# Deploy to Vercel (Super Simple!)

The app is now a unified Next.js application with no separate backend.

## One-Click Vercel Deployment

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Set **Root Directory** to: `frontend`
4. Click **Deploy**

That's it! No environment variables, no storage configuration, no backend setup.

## How It Works

- **CSV Parsing**: Done in the browser with papaparse
- **Session Storage**: Stored in browser IndexedDB (persistent)
- **CSV Export**: Generated client-side
- **Website Proxy**: Single Next.js API route (`/api/proxy`)

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- ✅ No backend configuration needed
- ✅ No database setup required
- ✅ All data stored locally in browser
- ✅ Instant CSV processing
- ✅ Smooth navigation with preloading
- ✅ Keyboard shortcuts (← Not ICP, → ICP, Cmd+Z Undo)
- ✅ Download results anytime

## Note

All session data is stored in your browser's IndexedDB. Clearing browser data will remove your sessions. For permanent storage, export your CSV results.
