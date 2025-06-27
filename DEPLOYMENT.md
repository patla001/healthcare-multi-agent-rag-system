# 🚀 Deployment Guide - Vercel Production

This guide will help you deploy your Healthcare Multi-Agent System to Vercel with both the Next.js frontend and Python FastAPI backend.

## 🌟 Deployment Options

### Option 1: Full Vercel Deployment (Recommended)
- ✅ Next.js frontend on Vercel
- ✅ Python FastAPI backend as Vercel serverless functions
- ✅ Single domain, unified deployment

### Option 2: Hybrid Deployment
- ✅ Next.js frontend on Vercel
- ✅ Python backend on Railway/Render/Heroku

## 🚀 Option 1: Full Vercel Deployment

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Configure Environment Variables
In your Vercel dashboard, add these environment variables:

#### Required:
```
OPENAI_API_KEY=sk-your_openai_api_key
NODE_ENV=production
```

#### Optional:
```
LANGSMITH_API_KEY=your_langsmith_api_key
LANGSMITH_PROJECT=healthcare-rag-system
WEATHER_API_KEY=your_weather_api_key
VECTORIZE_PIPELINE_ACCESS_TOKEN=your_vectorize_token
VECTORIZE_ORGANIZATION_ID=your_vectorize_org_id
VECTORIZE_PIPELINE_ID=your_vectorize_pipeline_id
```

### Step 4: Deploy to Vercel
```bash
# From your project root
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: healthcare-multi-agent-rag-system
# - Directory: ./
# - Override settings? No
```

### Step 5: Verify Deployment
After deployment, test these endpoints:
- `https://your-app.vercel.app/` - Frontend
- `https://your-app.vercel.app/api/python/health` - Backend health check
- `https://your-app.vercel.app/healthcare` - Healthcare interface

## 🔧 Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    },
    {
      "src": "api/python.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/python/(.*)",
      "dest": "api/python.py"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "PYTHON_VERSION": "3.11"
  },
  "functions": {
    "api/python.py": {
      "runtime": "python3.11"
    }
  }
}
```

### requirements-vercel.txt
Essential Python dependencies for Vercel:
```
fastapi==0.115.13
uvicorn==0.32.1
pydantic==2.10.4
python-multipart==0.0.20
python-dotenv==1.0.1
openai==1.58.1
langchain==0.3.10
langchain-openai==0.2.14
langsmith==0.2.5
requests==2.32.3
geopy==2.4.1
```

## 🌐 Option 2: Hybrid Deployment

### Frontend: Vercel
1. Deploy Next.js app to Vercel
2. Set `NEXT_PUBLIC_API_URL` to your backend URL

### Backend Options:

#### Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy Python backend
4. Use the Railway URL in frontend

#### Render
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd agent-python-backend && pip install -r requirements.txt`
4. Set start command: `cd agent-python-backend && python main.py`

#### Heroku
1. Create new app
2. Set buildpack to Python
3. Add Procfile: `web: cd agent-python-backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

## 📊 Production Checklist

### Security
- [ ] Environment variables configured
- [ ] API keys secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled (if needed)

### Performance
- [ ] Frontend optimized (Next.js build)
- [ ] Python dependencies minimized
- [ ] Caching configured
- [ ] CDN enabled (Vercel automatic)

### Monitoring
- [ ] Health endpoints working
- [ ] Error tracking configured
- [ ] LangSmith telemetry enabled
- [ ] Performance monitoring

### Testing
- [ ] Frontend loads correctly
- [ ] Backend health check passes
- [ ] Healthcare chat functionality works
- [ ] RAG system responds properly
- [ ] Hospital map displays correctly

## 🔍 Troubleshooting

### Common Issues:

#### 1. Python Dependencies
```bash
# If deployment fails, check requirements-vercel.txt
# Remove unnecessary dependencies
# Use specific versions
```

#### 2. API Routes
```bash
# Ensure API routes are correctly configured
# Check vercel.json routing
# Verify function paths
```

#### 3. Environment Variables
```bash
# Double-check all required env vars
# Ensure OPENAI_API_KEY is set
# Verify NODE_ENV=production
```

#### 4. CORS Issues
```bash
# Update CORS origins in api/python.py
# Use specific domains in production
# Remove "*" for security
```

## 📱 Mobile Optimization

The healthcare system is responsive and works on:
- ✅ Desktop browsers
- ✅ Mobile devices
- ✅ Tablets
- ✅ Progressive Web App (PWA) ready

## 🚀 Post-Deployment

### 1. Test All Features
- Healthcare chat interface
- RAG document retrieval
- Hospital location mapping
- Emergency response system
- Testing suite functionality

### 2. Monitor Performance
- Check Vercel Analytics
- Monitor API response times
- Track error rates
- Review LangSmith traces

### 3. Update Documentation
- Update README with live URLs
- Add production environment setup
- Document any production-specific configurations

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Python on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

**Your Healthcare Multi-Agent System is now ready for production! 🎉** 