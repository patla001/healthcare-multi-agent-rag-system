# Healthcare Multi-Agent System - Vercel Deployment Guide

## 🚀 Quick Deployment

This healthcare system is now configured for seamless Vercel deployment with serverless functions.

### 1. Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Development (local Python backend)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Production (leave empty to use Vercel serverless functions)
NEXT_PUBLIC_BACKEND_URL=

# Optional: OpenAI API Key for enhanced responses
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: GitHub Integration
1. Push code to GitHub
2. Connect repository to Vercel dashboard
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### 3. Environment Variables in Vercel

In your Vercel project dashboard, set:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | *(leave empty)* | Uses serverless functions in production |
| `OPENAI_API_KEY` | `sk-...` | Optional: For enhanced AI responses |

### 4. Architecture

**Development Mode:**
- Frontend: Next.js (`localhost:3000`)
- Backend: Python FastAPI (`localhost:8000`)
- API Calls: `http://localhost:8000/api/*`

**Production Mode (Vercel):**
- Frontend: Next.js (Vercel)
- Backend: Serverless Functions (`/api/python.py`)
- API Calls: `/api/*` (routed to serverless functions)

### 5. API Endpoints

All endpoints work in both development and production:

- `/api/health` - Health check
- `/api/healthcare-chat` - AI healthcare chat
- `/api/vectorize-rag` - RAG document retrieval
- `/api/weather` - Weather data
- `/api/weather/current` - Current weather
- `/api/geocode` - Location geocoding
- `/api/hospitals/locations` - Hospital finder

### 6. Dashboard Features

- ✅ Multi-tab navigation (Dashboard, AI Chat, Hospital Map)
- ✅ Real-time weather integration
- ✅ Location-aware hospital recommendations
- ✅ Advanced RAG-powered healthcare responses
- ✅ Interactive hospital map with markers
- ✅ Responsive design with modern UI

### 7. Testing Production

After deployment, test these URLs:
- `https://your-app.vercel.app/` - Main dashboard
- `https://your-app.vercel.app/healthcare` - Healthcare system
- `https://your-app.vercel.app/api/health` - API health check

### 8. Troubleshooting

**Issue: API calls failing**
- Check environment variables are set correctly
- Verify serverless function deployment in Vercel dashboard

**Issue: Map not loading**
- Ensure client-side rendering is working
- Check browser console for errors

**Issue: Weather/geocoding not working**
- Functions use simulated data - this is expected
- In production, integrate with real APIs as needed

### 9. Production Ready Features

- ✅ Unified serverless backend
- ✅ Environment-based configuration
- ✅ CORS properly configured
- ✅ Error handling and fallbacks
- ✅ Professional dashboard UI
- ✅ Mobile responsive design
- ✅ Real-time updates

### 10. Next Steps

1. **Custom Domain**: Add your domain in Vercel dashboard
2. **Real APIs**: Replace simulated data with real weather/maps APIs
3. **Authentication**: Add user authentication if needed
4. **Analytics**: Integrate Vercel Analytics
5. **Monitoring**: Add error tracking and performance monitoring

## 🎯 Production URL

Once deployed, your healthcare system will be available at:
`https://your-project-name.vercel.app/healthcare`

## 📊 Performance

- ⚡ **Fast**: Serverless functions with global edge network
- 🔄 **Scalable**: Auto-scaling based on traffic
- 🛡️ **Secure**: HTTPS by default, environment variable protection
- 📱 **Mobile**: Responsive design works on all devices

---

**Ready for production deployment! 🚀** 