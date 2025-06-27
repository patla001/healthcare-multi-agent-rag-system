from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from typing import List, Dict, Any, Optional
import time

# Initialize FastAPI app
app = FastAPI(
    title="Healthcare Multi-Agent RAG API",
    description="Healthcare intelligence with RAG capabilities",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class HealthcareQuery(BaseModel):
    query: str
    location: Optional[Dict[str, Any]] = None
    weather: Optional[Dict[str, Any]] = None

class RAGResponse(BaseModel):
    response: str
    sources: List[Dict[str, Any]]
    relevance_scores: List[float]
    enhanced: bool = False

# Simulated healthcare knowledge base
HEALTHCARE_DOCS = [
    {
        "id": "emergency_response",
        "title": "Emergency Response Guidelines",
        "content": "For chest pain, difficulty breathing, or severe injuries, call 911 immediately. Do not attempt self-treatment for emergency conditions.",
        "relevance_keywords": ["emergency", "chest pain", "breathing", "911", "severe", "urgent"]
    },
    {
        "id": "hospital_evaluation",
        "title": "Hospital Evaluation Criteria",
        "content": "When choosing a hospital, consider: staff qualifications, facility accreditation, wait times, insurance acceptance, and proximity to your location.",
        "relevance_keywords": ["hospital", "evaluation", "staff", "facility", "wait times", "insurance"]
    },
    {
        "id": "allergy_treatment",
        "title": "Allergy Treatment Protocols",
        "content": "For allergic reactions: remove allergen, take antihistamines for mild reactions, use epinephrine for severe reactions, seek medical attention if symptoms persist.",
        "relevance_keywords": ["allergy", "allergic", "reaction", "antihistamine", "epinephrine", "symptoms"]
    },
    {
        "id": "general_healthcare",
        "title": "General Healthcare Guidelines",
        "content": "Maintain regular check-ups, follow prescribed medications, eat a balanced diet, exercise regularly, and stay hydrated.",
        "relevance_keywords": ["healthcare", "check-up", "medication", "diet", "exercise", "health"]
    },
    {
        "id": "sprained_ankle",
        "title": "Sprained Ankle Treatment",
        "content": "For sprained ankle: Rest, Ice (15-20 min every 2-3 hours), Compression bandage, Elevation. Seek medical attention if severe pain or inability to bear weight.",
        "relevance_keywords": ["sprained", "ankle", "rest", "ice", "compression", "elevation", "RICE"]
    }
]

def calculate_relevance(query: str, doc: Dict[str, Any]) -> float:
    """Calculate relevance score for a document based on query"""
    query_lower = query.lower()
    score = 0.0
    
    # Check title relevance
    if any(keyword in query_lower for keyword in doc["relevance_keywords"]):
        score += 0.8
    
    # Check content relevance
    content_words = doc["content"].lower().split()
    query_words = query_lower.split()
    matching_words = sum(1 for word in query_words if word in content_words)
    score += (matching_words / len(query_words)) * 0.2
    
    # Boost emergency-related queries
    if any(word in query_lower for word in ["emergency", "urgent", "severe", "911", "chest pain"]):
        if doc["id"] == "emergency_response":
            score = max(score, 0.95)
    
    return min(score, 1.0)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Healthcare Multi-Agent RAG API",
        "version": "1.0.0",
        "openai_available": bool(os.getenv("OPENAI_API_KEY")),
        "rag_simulation": True,
        "vectorize_ready": True,
        "timestamp": time.time()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "openai_available": bool(os.getenv("OPENAI_API_KEY")),
        "rag_simulation": True,
        "vectorize_ready": True,
        "backend_status": "healthy",
        "timestamp": time.time()
    }

@app.post("/api/vectorize-rag")
async def vectorize_rag(query: HealthcareQuery):
    """Vectorize RAG endpoint with healthcare knowledge base"""
    try:
        # Calculate relevance scores for all documents
        doc_scores = []
        for doc in HEALTHCARE_DOCS:
            relevance = calculate_relevance(query.query, doc)
            doc_scores.append((doc, relevance))
        
        # Sort by relevance and get top 3
        doc_scores.sort(key=lambda x: x[1], reverse=True)
        top_docs = doc_scores[:3]
        
        # Prepare response
        sources = []
        relevance_scores = []
        
        for doc, score in top_docs:
            sources.append({
                "id": doc["id"],
                "title": doc["title"],
                "content": doc["content"][:200] + "..." if len(doc["content"]) > 200 else doc["content"],
                "relevance": score
            })
            relevance_scores.append(score)
        
        return {
            "query": query.query,
            "sources": sources,
            "relevance_scores": relevance_scores,
            "total_documents": len(HEALTHCARE_DOCS),
            "retrieved_documents": len(sources)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG processing error: {str(e)}")

@app.post("/api/healthcare-chat")
async def healthcare_chat(query: HealthcareQuery):
    """Enhanced healthcare chat with RAG integration"""
    try:
        # Get RAG documents
        doc_scores = []
        for doc in HEALTHCARE_DOCS:
            relevance = calculate_relevance(query.query, doc)
            if relevance > 0.3:  # Only include relevant documents
                doc_scores.append((doc, relevance))
        
        doc_scores.sort(key=lambda x: x[1], reverse=True)
        top_docs = doc_scores[:3]
        
        # Generate response based on query type
        query_lower = query.query.lower()
        
        if "sprained ankle" in query_lower or "ankle" in query_lower:
            response = """For a sprained ankle, follow the RICE protocol:

**Immediate Care:**
- **Rest**: Avoid putting weight on the injured ankle
- **Ice**: Apply ice for 15-20 minutes every 2-3 hours for the first 48 hours
- **Compression**: Use an elastic bandage (not too tight)
- **Elevation**: Keep the ankle elevated above heart level when possible

**When to Seek Medical Attention:**
- Severe pain or inability to bear weight
- Numbness or tingling
- No improvement after 2-3 days
- Signs of infection (increased pain, redness, warmth)

**Nearby Hospitals:** Based on your location, consider visiting urgent care or emergency services if symptoms worsen."""
            
        elif any(word in query_lower for word in ["emergency", "chest pain", "breathing"]):
            response = """🚨 **EMERGENCY SITUATION DETECTED** 🚨

**Call 911 immediately if experiencing:**
- Chest pain or pressure
- Difficulty breathing
- Severe bleeding
- Loss of consciousness
- Severe allergic reactions

**Do not delay emergency care.** Time is critical in emergency situations.

**While waiting for emergency services:**
- Stay calm and keep the person comfortable
- Do not give food or water
- Monitor breathing and pulse
- Be prepared to perform CPR if trained"""
            
        else:
            # Generate general healthcare response
            response = f"""Based on your healthcare query, here's what I recommend:

**General Guidance:**
- Consult with a healthcare professional for personalized advice
- Consider your symptoms, medical history, and current medications
- Monitor your condition and seek immediate care if symptoms worsen

**Available Resources:**
- Primary care physician for routine concerns
- Urgent care for non-emergency issues
- Emergency room for serious conditions
- Telehealth services for consultations"""
        
        # Prepare sources
        sources = []
        for doc, score in top_docs:
            sources.append({
                "id": doc["id"],
                "title": doc["title"],
                "content": doc["content"],
                "relevance": score
            })
        
        return RAGResponse(
            response=response,
            sources=sources,
            relevance_scores=[score for _, score in top_docs],
            enhanced=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Healthcare chat error: {str(e)}")

@app.post("/api/hospitals/locations")
async def get_hospital_locations(location_data: Dict[str, Any]):
    """Get nearby hospital locations"""
    # Simulated hospital data
    hospitals = [
        {
            "name": "General Hospital",
            "address": "123 Medical Center Dr",
            "coordinates": {"lat": 37.7749, "lng": -122.4194},
            "rating": 4.2,
            "wait_time": "15-30 minutes",
            "specialties": ["Emergency", "Internal Medicine", "Surgery"]
        },
        {
            "name": "St. Mary's Medical Center",
            "address": "456 Health Ave",
            "coordinates": {"lat": 37.7849, "lng": -122.4094},
            "rating": 4.5,
            "wait_time": "10-25 minutes",
            "specialties": ["Cardiology", "Orthopedics", "Emergency"]
        },
        {
            "name": "City Urgent Care",
            "address": "789 Care Blvd",
            "coordinates": {"lat": 37.7649, "lng": -122.4294},
            "rating": 4.0,
            "wait_time": "5-15 minutes",
            "specialties": ["Urgent Care", "Family Medicine"]
        }
    ]
    
    return {"hospitals": hospitals, "count": len(hospitals)}

# Vercel serverless function handler
def handler(request):
    """Vercel serverless function handler"""
    return app(request)

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 