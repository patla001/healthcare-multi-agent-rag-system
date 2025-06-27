# Vectorize RAG Testing Guide

This guide demonstrates how to test the enhanced vectorize RAG functionality with OpenAI integration for better healthcare chat results.

## 🚀 Quick Start

### 1. Start the Backend
```bash
# Terminal 1: Start Python backend
cd agent-python-backend
uv run python main.py

# Or use the pnpm script
pnpm run backend:start
```

### 2. Start the Frontend
```bash
# Terminal 2: Start Next.js frontend
pnpm dev
```

### 3. Run Tests
```bash
# Test backend connectivity
pnpm run test:backend

# Run comprehensive RAG tests
pnpm run test:rag

# Run all tests
pnpm run test:all
```

## 🧪 Testing Scenarios

### 1. Vectorize RAG Integration Test

The test suite (`test-vectorize-rag.js`) validates:

- **Backend Health**: Verifies Python backend is running
- **Vectorize RAG**: Tests document retrieval and relevance scoring
- **Healthcare Chat**: Validates medical query processing with location data
- **Multi-Agent System**: Confirms agent coordination functionality

**Sample Test Queries:**
```javascript
const TEST_QUERIES = [
  "Find hospitals with emergency services",
  "What are the best clinics for urgent care?", 
  "Weather related allergies and treatment options",
  "Healthcare facilities with good ratings"
];
```

### 2. Manual Chat Testing

Visit `http://localhost:3000/healthcare` and try these queries:

**Basic Hospital Queries:**
- "Find the best hospital near me for a sprained ankle"
- "Show me hospitals with emergency services"
- "What urgent care centers are available?"

**Weather-Related Health Queries:**
- "How does current weather affect my allergies?"
- "Find allergy treatment centers nearby"
- "Weather-related breathing problems"

**Quality Assessment Queries:**
- "Which hospitals have the best ratings?"
- "Show me facilities with shortest wait times"
- "Find hospitals with specialized care"

## 🔧 Enhanced Features

### 1. RAG-Enhanced Responses

The system now provides:
- **Knowledge Base Integration**: Retrieves relevant healthcare documents
- **OpenAI Enhancement**: Uses GPT-4 for better reasoning and responses
- **Structured Hospital Data**: Returns formatted hospital recommendations
- **Source Transparency**: Shows which knowledge sources were used

### 2. Visual RAG Display

The enhanced UI shows:
- **RAG Context Card**: Displays knowledge sources and AI enhancement status
- **Document Details**: Expandable view of retrieved documents with relevance scores
- **Quality Indicators**: Evidence-based, knowledge retrieval, and AI reasoning badges
- **Source Attribution**: Clear indication of data sources used

### 3. Backend Enhancements

**New Endpoints:**
- `/api/vectorize-rag`: Direct RAG search functionality
- `/api/healthcare-chat`: Enhanced chat with RAG integration
- `/health`: Extended health check with feature status

**Key Features:**
- Simulated vectorize RAG with healthcare knowledge base
- OpenAI GPT-4 integration for medical reasoning
- Structured hospital data with coordinates
- Enhanced guardrails for healthcare queries

## 📊 Test Results Interpretation

### Successful RAG Test Output:
```
🚀 Starting Vectorize RAG Testing Suite
===============================================

🔍 Testing Backend Health...
✅ Backend is healthy: Healthcare Multi-Agent Backend v1.0.0

📋 Running test case: Healthcare Query
📚 Testing Vectorize RAG with query: "Find hospitals with emergency services"
📝 Response content length: 1247 characters
🔗 Sources found: 5
✅ RAG sources retrieved successfully
   Source 1: Emergency Department Best Practices
   Relevancy: 0.950
   Similarity: 0.880

📊 TEST SUMMARY REPORT
===============================================
🏥 Backend Health: ✅ PASS
📚 Vectorize RAG Tests: 4/4 PASSED
🏥 Healthcare Chat Tests: 2/2 PASSED
🤖 Multi-Agent System: ✅ ACCESSIBLE
```

### Common Issues and Solutions:

**Backend Connection Failed:**
```bash
# Ensure Python backend is running
cd agent-python-backend
uv run python main.py
```

**No RAG Sources Found:**
- Check if vectorize credentials are configured
- Verify OPENAI_API_KEY is set for enhanced responses
- Ensure healthcare queries contain relevant keywords

**Frontend Not Loading:**
```bash
# Restart development server
pnpm dev
```

## 🎯 Key Improvements Made

### 1. Enhanced OpenAI Integration
- **Model Upgrade**: Now uses GPT-4 for better medical reasoning
- **Structured Prompts**: Specialized healthcare assistant prompts
- **Temperature Control**: Lower temperature (0.3) for consistent medical advice
- **Context Integration**: Combines RAG documents with location/weather data

### 2. Improved RAG Simulation
- **Healthcare Knowledge Base**: 5 specialized medical documents
- **Relevance Scoring**: Smart keyword matching and ranking
- **Document Metadata**: Includes relevancy and similarity scores
- **Contextual Responses**: Documents are filtered based on query relevance

### 3. Enhanced User Experience
- **Visual RAG Display**: Interactive component showing sources and AI enhancement
- **Expandable Documents**: Click to view full document content
- **Quality Indicators**: Visual badges for evidence-based responses
- **Source Attribution**: Clear indication of knowledge sources used

### 4. Better Error Handling
- **Graceful Fallbacks**: System works even without OpenAI or external APIs
- **Connection Status**: Real-time backend connectivity monitoring
- **User Feedback**: Clear error messages and recommendations

## 🔍 Testing the RAG Flow

### Step-by-Step Verification:

1. **Start Backend** → Check health endpoint shows RAG features enabled
2. **Ask Healthcare Query** → Verify RAG documents are retrieved
3. **Check Response Quality** → Confirm OpenAI enhancement is used
4. **Examine Sources** → Review knowledge base documents used
5. **Test Hospital Results** → Verify structured hospital data is returned
6. **Check Map Integration** → Confirm hospitals appear on map

### Expected RAG Flow:
```
User Query → RAG Document Retrieval → OpenAI Enhancement → Response Generation
     ↓              ↓                        ↓                    ↓
"Find hospitals" → Medical Guidelines → GPT-4 Processing → Enhanced Answer
                      + Hospital Data      + Context           + Sources
```

## 📈 Performance Metrics

The test suite measures:
- **Response Time**: Healthcare chat processing speed
- **Source Quality**: Relevance scores of retrieved documents
- **Enhancement Status**: Whether OpenAI was used successfully
- **Hospital Data**: Number of structured hospital results returned

## 🚀 Next Steps

To further enhance the system:
1. Connect to actual Vectorize API with real healthcare documents
2. Add more sophisticated ranking algorithms
3. Integrate real hospital APIs for live data
4. Expand knowledge base with more medical specialties
5. Add user feedback loops for response quality improvement

## 🔧 Troubleshooting

**Common Test Failures:**
- Backend not running: Start with `pnpm run backend:start`
- Network issues: Check firewall and port availability
- API limits: Verify OpenAI API key and usage limits
- Dependencies: Run `pnpm install` to ensure all packages are installed

**Debug Mode:**
Set `DEBUG=true` in environment to see detailed RAG processing logs. 