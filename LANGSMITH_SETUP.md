# LangSmith Telemetry Setup Guide

## Overview
LangSmith provides comprehensive telemetry and observability for your healthcare RAG system, allowing you to monitor:
- OpenAI API calls and responses
- RAG document retrieval performance
- Healthcare chat interactions
- System performance metrics
- Error tracking and debugging

## Setup Instructions

### 1. Get LangSmith API Key
1. Go to [LangSmith](https://smith.langchain.com/)
2. Sign up or log in to your account
3. Navigate to Settings → API Keys
4. Create a new API key
5. Copy the API key (starts with `lsv2_pt_...`)

### 2. Configure Environment Variables
Add these variables to your `.env` file:

```bash
# LangSmith Configuration
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_PROJECT=healthcare-rag-system
```

### 3. Example .env File
Your complete `.env` file should look like:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-openai-key-here

# LangSmith Configuration
LANGSMITH_API_KEY=lsv2_pt_your-langsmith-key-here
LANGSMITH_PROJECT=healthcare-rag-system
```

## Features Tracked

### 🔍 RAG Enhancement Tracking
- **Input**: User queries, location context, OpenAI availability
- **Output**: Enhanced responses, document count, OpenAI usage
- **Metrics**: Response time, success rate, error tracking

### 💬 Healthcare Chat Tracking
- **Input**: Message count, user queries, location data
- **Output**: Response length, data sources, hospital recommendations
- **Metrics**: RAG document usage, OpenAI enhancement status

### 📊 What You'll See in LangSmith
1. **Trace Overview**: Complete request flow from user query to response
2. **Performance Metrics**: Response times, token usage, success rates
3. **Error Analysis**: Failed requests, timeout issues, API errors
4. **RAG Performance**: Document retrieval quality, relevance scores
5. **OpenAI Usage**: Model calls, token consumption, costs

## Dashboard Insights

### Key Metrics to Monitor
- **Response Time**: Average time for healthcare queries
- **Success Rate**: Percentage of successful responses
- **RAG Effectiveness**: Document retrieval quality
- **OpenAI Usage**: API call frequency and costs
- **Error Patterns**: Common failure points

### Useful Queries in LangSmith
```sql
-- Find slow responses
SELECT * FROM runs WHERE latency_ms > 5000

-- Track OpenAI usage
SELECT * FROM runs WHERE outputs.openai_used = true

-- Monitor RAG document usage
SELECT AVG(outputs.rag_documents_count) FROM runs

-- Error analysis
SELECT * FROM runs WHERE outputs.success = false
```

## Troubleshooting

### Common Issues

1. **"LangSmith API key not found"**
   - Ensure `LANGSMITH_API_KEY` is set in your `.env` file
   - Restart the backend server after adding the key

2. **"LangSmith tracking failed"**
   - Check your API key is valid
   - Verify internet connection
   - Check LangSmith service status

3. **No traces appearing**
   - Confirm the project name matches in LangSmith dashboard
   - Check that telemetry initialization succeeded in server logs

### Verification Steps
1. Start the backend server
2. Look for: `✅ LangSmith telemetry initialized for project: healthcare-rag-system`
3. Send a test healthcare query
4. Check LangSmith dashboard for new traces

## Benefits

### For Development
- **Debug Issues**: See exactly where requests fail
- **Optimize Performance**: Identify slow components
- **Monitor Quality**: Track RAG document relevance

### For Production
- **System Health**: Monitor uptime and performance
- **Cost Tracking**: Monitor OpenAI API costs
- **User Analytics**: Understand query patterns

### For Healthcare Compliance
- **Audit Trail**: Complete request/response logging
- **Performance SLA**: Track response time commitments
- **Error Monitoring**: Proactive issue detection

## Advanced Configuration

### Custom Project Names
Set different projects for different environments:
```bash
# Development
LANGSMITH_PROJECT=healthcare-rag-dev

# Production
LANGSMITH_PROJECT=healthcare-rag-prod
```

### Additional Metadata
The system automatically tracks:
- User location data
- Weather context
- Hospital recommendations
- RAG document sources
- OpenAI model usage

## Next Steps
1. Set up your LangSmith account
2. Add API key to `.env` file
3. Restart the backend server
4. Test with healthcare queries
5. Explore traces in LangSmith dashboard

🎉 **Your healthcare RAG system now has comprehensive telemetry!** 