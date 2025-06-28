from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from typing import List, Dict, Any, Optional
import time
import random

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

class WeatherRequest(BaseModel):
    location: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

class GeocodeRequest(BaseModel):
    location: str

class HospitalLocationRequest(BaseModel):
    location: str
    injuryType: str = "general"
    radius: int = 25

class ChatMessage(BaseModel):
    role: str
    content: str
    location: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    stream: bool = True

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

def get_weather_data(location: str = None, lat: float = None, lon: float = None) -> Dict[str, Any]:
    """
    Simulate weather data for a given location or coordinates
    In production, this would call a real weather API
    """
    conditions = ["Clear", "Partly Cloudy", "Cloudy", "Light Rain", "Sunny", "Overcast"]
    
    # Determine location name
    if location:
        location_name = location
    elif lat is not None and lon is not None:
        # Reverse geocode coordinates to location name (simplified)
        if abs(lat - 34.0522) < 1 and abs(lon - (-118.2437)) < 1:
            location_name = "Los Angeles, CA"
        elif abs(lat - 40.7128) < 1 and abs(lon - (-74.0060)) < 1:
            location_name = "New York, NY"
        elif abs(lat - 41.8781) < 1 and abs(lon - (-87.6298)) < 1:
            location_name = "Chicago, IL"
        else:
            location_name = f"Location at {lat:.2f}, {lon:.2f}"
    else:
        location_name = "Unknown Location"
    
    # Convert temperature to Fahrenheit for US locations
    temp_celsius = round(random.uniform(15, 35), 1)
    temp_fahrenheit = round((temp_celsius * 9/5) + 32, 1)
    
    return {
        "location": location_name,
        "temperature": temp_fahrenheit,  # Return Fahrenheit for compatibility
        "description": random.choice(conditions),
        "humidity": random.randint(30, 80),
        "windSpeed": round(random.uniform(5, 25), 1),
        "uvIndex": random.randint(1, 11),
        "icon": "01d",  # Default sunny icon
        "condition": random.choice(conditions)
    }

def geocode_location(location: str) -> Dict[str, Any]:
    """
    Geocode a location string to coordinates
    In production, this would use a real geocoding service
    """
    # Common locations mapping for demo
    location_coords = {
        "los angeles, ca": {"lat": 34.0522, "lng": -118.2437, "display_name": "Los Angeles, California, USA"},
        "new york, ny": {"lat": 40.7128, "lng": -74.0060, "display_name": "New York, New York, USA"},
        "chicago, il": {"lat": 41.8781, "lng": -87.6298, "display_name": "Chicago, Illinois, USA"},
        "houston, tx": {"lat": 29.7604, "lng": -95.3698, "display_name": "Houston, Texas, USA"},
        "phoenix, az": {"lat": 33.4484, "lng": -112.0740, "display_name": "Phoenix, Arizona, USA"},
        "philadelphia, pa": {"lat": 39.9526, "lng": -75.1652, "display_name": "Philadelphia, Pennsylvania, USA"},
        "san antonio, tx": {"lat": 29.4241, "lng": -98.4936, "display_name": "San Antonio, Texas, USA"},
        "san diego, ca": {"lat": 32.7157, "lng": -117.1611, "display_name": "San Diego, California, USA"},
        "dallas, tx": {"lat": 32.7767, "lng": -96.7970, "display_name": "Dallas, Texas, USA"},
        "san jose, ca": {"lat": 37.3382, "lng": -121.8863, "display_name": "San Jose, California, USA"},
    }
    
    location_lower = location.lower().strip()
    
    # Check if we have exact match
    if location_lower in location_coords:
        return location_coords[location_lower]
    
    # Try partial matching
    for key, coords in location_coords.items():
        if any(part in location_lower for part in key.split(", ")):
            return coords
    
    # Default to Los Angeles if no match found
    return {
        "lat": 34.0522, 
        "lng": -118.2437, 
        "display_name": f"{location} (estimated location)",
        "estimated": True
    }

def get_hospital_locations(location: str, injury_type: str = "general", radius: int = 25) -> List[Dict[str, Any]]:
    """
    Generate hospital locations for a given area
    In production, this would query a real hospital database
    """
    base_coords = geocode_location(location)
    hospitals = []
    
    # Generate sample hospitals
    hospital_names = [
        "City General Hospital",
        "Regional Medical Center", 
        "Emergency Care Hospital",
        "Urgent Care Clinic",
        "Community Health Center",
        "Trauma Center",
        "Family Medicine Hospital",
        "Specialty Care Facility"
    ]
    
    for i, name in enumerate(hospital_names[:6]):  # Limit to 6 hospitals
        # Generate coordinates within radius
        lat_offset = random.uniform(-0.1, 0.1)
        lng_offset = random.uniform(-0.1, 0.1)
        
        hospital = {
            "id": f"hospital_{i+1}",
            "name": name,
            "address": f"{random.randint(100, 9999)} Medical Way, {location}",
            "lat": base_coords["lat"] + lat_offset,
            "lng": base_coords["lng"] + lng_offset,
            "phone": f"({random.randint(200, 999)}) {random.randint(200, 999)}-{random.randint(1000, 9999)}",
            "services": ["Emergency Care", "Urgent Care", "General Medicine"],
            "rating": round(random.uniform(3.5, 5.0), 1),
            "emergency": random.choice([True, False]),
            "urgentCare": True
        }
        hospitals.append(hospital)
    
    return hospitals

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
        "service": "Healthcare Multi-Agent Backend",
        "version": "1.0.0",
        "timestamp": time.time(),
        "features": {
            "openai_available": bool(os.getenv("OPENAI_API_KEY")),
            "rag_simulation": True,
            "vectorize_ready": True
        }
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
async def healthcare_chat(request: ChatRequest):
    """Enhanced healthcare chat with RAG integration"""
    try:
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        last_message = request.messages[-1]
        user_query = last_message.content.lower()
        location_context = ""
        
        if hasattr(last_message, 'location') and last_message.location:
            location_context = f"User location: {last_message.location.get('city', 'Unknown')}"
        
        # Generate response based on query type
        if "sprained ankle" in user_query or "ankle" in user_query:
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
            
        elif any(word in user_query for word in ["emergency", "chest pain", "breathing"]):
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
- Telehealth services for consultations

{location_context}"""
        
        return {
            "role": "assistant",
            "content": response,
            "type": "healthcare"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Healthcare chat error: {str(e)}")

@app.post("/api/weather")
async def get_weather(request: WeatherRequest):
    """Get weather data for a location"""
    try:
        # Validate request has either location or coordinates
        if not request.location and (request.lat is None or request.lon is None):
            raise HTTPException(status_code=400, detail="Either location or lat/lon coordinates required")
        
        weather_data = get_weather_data(request.location, request.lat, request.lon)
        return weather_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather service error: {str(e)}")

@app.post("/api/weather/current")
async def get_current_weather(request: WeatherRequest):
    """Get current weather data for a location (alternative endpoint)"""
    try:
        # Validate request has either location or coordinates
        if not request.location and (request.lat is None or request.lon is None):
            raise HTTPException(status_code=400, detail="Either location or lat/lon coordinates required")
        
        weather_data = get_weather_data(request.location, request.lat, request.lon)
        return weather_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather service error: {str(e)}")

@app.post("/api/geocode")
async def geocode_location_endpoint(request: GeocodeRequest):
    """Geocode a location string to coordinates"""
    try:
        coords = geocode_location(request.location)
        return coords
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geocoding error: {str(e)}")

@app.post("/api/hospitals/locations")
async def get_hospitals_locations(request: HospitalLocationRequest):
    """Get hospital locations for a given area"""
    try:
        hospitals = get_hospital_locations(request.location, request.injuryType, request.radius)
        return {
            "hospitals": hospitals,
            "location": request.location,
            "injuryType": request.injuryType,
            "radius": request.radius,
            "count": len(hospitals)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hospital lookup error: {str(e)}")

# Vercel serverless function handler
def handler(request):
    """Vercel serverless function handler"""
    return app(request)

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 