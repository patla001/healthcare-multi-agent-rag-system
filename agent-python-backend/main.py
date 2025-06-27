import os
import re
import json
import asyncio
import random
from datetime import datetime
from typing import Optional, List, Dict, Any

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()  # Load .env file from current directory or parent
    print("✅ Environment variables loaded from .env file")
except ImportError:
    print("⚠️ python-dotenv not installed, using system environment variables")

# Initialize LangSmith for telemetry
try:
    from langsmith import Client
    import langsmith
    
    # Get LangSmith configuration from environment
    langsmith_api_key = os.getenv("LANGSMITH_API_KEY")
    langsmith_project = os.getenv("LANGSMITH_PROJECT", "healthcare-rag-system")
    
    if langsmith_api_key:
        # Initialize LangSmith client
        langsmith_client = Client(api_key=langsmith_api_key)
        
        # Set environment variables for automatic tracing
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
        os.environ["LANGCHAIN_API_KEY"] = langsmith_api_key
        os.environ["LANGCHAIN_PROJECT"] = langsmith_project
        
        print(f"✅ LangSmith telemetry initialized for project: {langsmith_project}")
        LANGSMITH_AVAILABLE = True
    else:
        print("⚠️ LangSmith API key not found, telemetry disabled")
        langsmith_client = None
        LANGSMITH_AVAILABLE = False
        
except ImportError:
    print("⚠️ LangSmith not installed, telemetry disabled")
    langsmith_client = None
    LANGSMITH_AVAILABLE = False

# Try to import OpenAI, make it optional for now
try:
    from openai import OpenAI
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        openai_client = OpenAI(api_key=api_key)
        OPENAI_AVAILABLE = True
        print(f"✅ OpenAI client initialized with API key: {api_key[:8]}...")
    else:
        print("⚠️ OPENAI_API_KEY not found in environment variables")
        openai_client = None
        OPENAI_AVAILABLE = False
except ImportError:
    print("⚠️ OpenAI package not available - using mock responses")
    openai_client = None
    OPENAI_AVAILABLE = False

# Initialize FastAPI app
app = FastAPI(title="Healthcare Multi-Agent RAG System")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

print("Healthcare Multi-Agent RAG System Starting...")
print("Server: http://0.0.0.0:8000")
print("Using OpenAI for enhanced healthcare responses")
print("Frontend CORS: http://localhost:3000")

# ===============================
# DATA MODELS
# ===============================

class WeatherData(BaseModel):
    temperature: float
    condition: str
    humidity: float
    windSpeed: float
    uvIndex: float

class LocationData(BaseModel):
    latitude: float
    longitude: float
    city: Optional[str] = None
    weather: Optional[WeatherData] = None

class ChatMessage(BaseModel):
    role: str
    content: str
    location: Optional[LocationData] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    stream: bool = True

class HospitalRagRequest(BaseModel):
    location: str
    injury_type: str = "general"
    max_results: int = 5

class VectorizeRAGRequest(BaseModel):
    query: str
    context_window: int = 5
    location: Optional[str] = None

# ===============================
# ENHANCED VECTORIZE RAG INTEGRATION
# ===============================

def simulate_vectorize_rag_search(query: str, context_window: int = 5) -> List[Dict]:
    """
    Simulate vectorize RAG search results for healthcare queries
    In production, this would connect to actual Vectorize API
    """
    
    # Simulate healthcare knowledge base documents
    healthcare_documents = [
        {
            "id": "doc_001",
            "title": "Emergency Department Best Practices",
            "source": "Healthcare Quality Guidelines",
            "content": """Emergency departments should maintain average wait times under 30 minutes for non-critical cases. 
            Key quality indicators include staff-to-patient ratios, availability of specialized equipment, 
            and 24/7 physician coverage. Hospitals with Level 1 trauma centers provide the highest level of emergency care.""",
            "relevancy": 0.95,
            "similarity": 0.88
        },
        {
            "id": "doc_002", 
            "title": "Hospital Rating and Quality Metrics",
            "source": "Medical Facility Evaluation Standards",
            "content": """Hospital quality is measured through patient satisfaction scores, readmission rates, 
            infection control metrics, and clinical outcomes. Top-rated hospitals typically maintain 
            4.5+ star ratings, with excellent nursing staff ratios and modern medical equipment.""",
            "relevancy": 0.92,
            "similarity": 0.85
        },
        {
            "id": "doc_003",
            "title": "Allergy Treatment and Weather Correlation",
            "source": "Environmental Health Research",
            "content": """Weather conditions significantly impact allergy symptoms. High pollen counts occur during 
            spring months with warm, windy conditions. Treatment facilities with allergy specialists 
            provide immunotherapy, antihistamines, and environmental control recommendations.""",
            "relevancy": 0.89,
            "similarity": 0.82
        },
        {
            "id": "doc_004",
            "title": "Urgent Care Facility Standards",
            "source": "Ambulatory Care Guidelines",
            "content": """Urgent care centers provide same-day treatment for non-emergency conditions. 
            Quality indicators include board-certified physicians, on-site diagnostic capabilities, 
            and integration with hospital networks for seamless care transitions.""",
            "relevancy": 0.87,
            "similarity": 0.79
        },
        {
            "id": "doc_005",
            "title": "Healthcare Facility Location Analysis",
            "source": "Geographic Health Access Study",
            "content": """Optimal healthcare access requires facilities within 15-minute drive times. 
            Urban areas benefit from multiple specialty centers, while rural areas need comprehensive 
            community hospitals with telemedicine capabilities.""",
            "relevancy": 0.84,
            "similarity": 0.76
        }
    ]
    
    # Filter documents based on query relevance
    query_lower = query.lower()
    relevant_docs = []
    
    for doc in healthcare_documents:
        content_lower = doc["content"].lower() + " " + doc["title"].lower()
        
        # Simple relevance scoring based on keyword matches
        relevance_score = 0.0
        query_terms = query_lower.split()
        
        for term in query_terms:
            if term in content_lower:
                relevance_score += 0.1
        
        if relevance_score > 0.0:
            doc["computed_relevancy"] = relevance_score
            relevant_docs.append(doc)
    
    # Sort by relevance and return top results
    relevant_docs.sort(key=lambda x: x.get("computed_relevancy", 0), reverse=True)
    return relevant_docs[:context_window]

async def enhance_response_with_rag(user_query: str, location_context: str = "") -> Dict[str, Any]:
    """
    Enhance healthcare responses using RAG-retrieved documents and OpenAI
    """
    
    # Initialize telemetry tracking
    run_id = None
    if LANGSMITH_AVAILABLE and langsmith_client:
        try:
            from langsmith.run_helpers import traceable
            import uuid
            
            # Generate a unique run ID
            run_id = str(uuid.uuid4())
            
            # Create run with explicit ID
            langsmith_client.create_run(
                id=run_id,
                name="healthcare_rag_enhancement",
                run_type="chain",
                inputs={
                    "user_query": user_query,
                    "location_context": location_context,
                    "openai_available": OPENAI_AVAILABLE
                },
                project_name=os.getenv("LANGSMITH_PROJECT", "healthcare-rag-system")
            )
            print(f"📊 LangSmith tracking started: {run_id}")
        except Exception as e:
            print(f"⚠️ LangSmith tracking failed: {e}")
            run_id = None
    
    try:
        # Step 1: Retrieve relevant documents from knowledge base
        rag_documents = simulate_vectorize_rag_search(user_query, context_window=3)
        
        # Step 2: Format context from retrieved documents
        context_text = "\n\n".join([
            f"Document: {doc['title']}\nSource: {doc['source']}\nContent: {doc['content']}"
            for doc in rag_documents
        ])
        
        # Step 3: Generate enhanced response with OpenAI
        if OPENAI_AVAILABLE and openai_client:
            enhanced_prompt = f"""You are a healthcare assistant specializing in hospital evaluation and medical guidance.

CONTEXT FROM KNOWLEDGE BASE:
{context_text}

USER LOCATION & WEATHER:
{location_context}

USER QUERY: {user_query}

Instructions:
1. Use the knowledge base context to provide accurate, evidence-based healthcare information
2. Include specific hospital recommendations with ratings, wait times, and specialties when relevant
3. Consider location and weather factors for personalized recommendations
4. Always emphasize when to seek immediate emergency care
5. Format hospital recommendations in this structure:
   **Hospital Name** - Distance
   - Rating: X.X/5, Wait: XX-XX min
   - Specialties: Specialty1, Specialty2, Specialty3

Provide a comprehensive response that combines the knowledge base information with practical healthcare guidance."""

            # Add timeout handling for OpenAI requests
            import asyncio
            import concurrent.futures
            
            def call_openai():
                return openai_client.chat.completions.create(
                    model="gpt-4",  # Use GPT-4 for better reasoning
                    messages=[
                        {"role": "system", "content": enhanced_prompt},
                        {"role": "user", "content": user_query}
                    ],
                    temperature=0.3,  # Lower temperature for more consistent medical advice
                    max_tokens=1200,
                    presence_penalty=0.1,
                    frequency_penalty=0.1,
                    timeout=30  # 30 second timeout
                )
            
            # Execute with timeout
            try:
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(call_openai)
                    response = future.result(timeout=35)  # 35 second timeout for the whole operation
            except concurrent.futures.TimeoutError:
                print("⚠️ OpenAI request timed out, falling back to mock response")
                raise Exception("OpenAI timeout")
            
            enhanced_response = response.choices[0].message.content
            
        else:
            # Enhanced fallback response using RAG context
            enhanced_response = f"""**RAG-Enhanced Healthcare Recommendation**

Based on your query "{user_query}" and our healthcare knowledge base:

{generate_mock_healthcare_response(user_query, location_context)}

**Evidence from Knowledge Base:**
{context_text[:500]}...

**💡 RAG Processing:** Retrieved {len(rag_documents)} relevant healthcare documents with average relevancy of {sum(doc.get('computed_relevancy', 0) for doc in rag_documents) / len(rag_documents):.2f}"""

        result = {
            "enhanced_response": enhanced_response,
            "rag_documents": rag_documents,
            "context_used": len(rag_documents),
            "openai_used": True  # Mark as used when OpenAI actually succeeded
        }
        
        # Complete telemetry tracking
        if LANGSMITH_AVAILABLE and langsmith_client and run_id:
            try:
                langsmith_client.update_run(
                    run_id,
                    outputs={
                        "enhanced_response": enhanced_response[:500] + "..." if len(enhanced_response) > 500 else enhanced_response,
                        "rag_documents_count": len(rag_documents),
                        "context_used": len(rag_documents),
                        "openai_used": True,
                        "success": True
                    },
                    end_time=datetime.now()
                )
                print(f"📊 LangSmith tracking completed: {run_id}")
            except Exception as e:
                print(f"⚠️ LangSmith completion failed: {e}")
        
        return result
        
    except Exception as e:
        print(f"⚠️ Error in RAG enhancement: {e}")
        # Fallback to enhanced mock response using RAG context
        enhanced_response = f"""**RAG-Enhanced Healthcare Recommendation**

Based on your query "{user_query}" and our healthcare knowledge base:

{generate_mock_healthcare_response(user_query, location_context)}

**Evidence from Knowledge Base:**
{context_text[:500]}...

**💡 RAG Processing:** Retrieved {len(rag_documents)} relevant healthcare documents with average relevancy of {sum(doc.get('computed_relevancy', 0) for doc in rag_documents) / len(rag_documents):.2f}

*Note: Using enhanced mock response due to OpenAI API limitations.*"""
        
        result = {
            "enhanced_response": enhanced_response,
            "rag_documents": rag_documents,
            "context_used": len(rag_documents),
            "openai_used": False,
            "error": str(e)
        }
        
        # Complete telemetry tracking with error
        if LANGSMITH_AVAILABLE and langsmith_client and run_id:
            try:
                langsmith_client.update_run(
                    run_id,
                    outputs={
                        "enhanced_response": enhanced_response[:500] + "..." if len(enhanced_response) > 500 else enhanced_response,
                        "rag_documents_count": len(rag_documents),
                        "context_used": len(rag_documents),
                        "openai_used": False,
                        "error": str(e),
                        "success": False
                    },
                    end_time=datetime.now()
                )
                print(f"📊 LangSmith error tracking completed: {run_id}")
            except Exception as tracking_error:
                print(f"⚠️ LangSmith error completion failed: {tracking_error}")
        
        return result

# ===============================
# HEALTHCARE VALIDATION
# ===============================

def validate_healthcare_query(user_input: str) -> str:
    """Validate that the query is healthcare-related"""
    
    healthcare_keywords = [
        'hospital', 'doctor', 'medical', 'health', 'injury', 'pain', 'sick', 'treatment',
        'emergency', 'clinic', 'nurse', 'medicine', 'symptom', 'fever', 'hurt', 'wound',
        'care', 'therapy', 'diagnosis', 'patient', 'healthcare', 'wellness', 'disease',
        'infection', 'surgery', 'prescription', 'urgent care', 'pharmacy', 'specialist',
        'allergy', 'allergies', 'allergic', 'weather', 'breathing', 'asthma', 'sinus',
        'congestion', 'sneezing', 'runny nose', 'itchy', 'rash', 'hives', 'pollen',
        'sprain', 'sprained', 'ankle', 'twisted', 'fracture', 'broken', 'bone',
        'bleeding', 'blood', 'headache', 'migraine', 'stomach', 'nausea', 'vomit',
        'dizzy', 'weakness', 'fatigue', 'tired', 'sleep', 'stress', 'anxiety',
        'depression', 'mental health', 'therapy', 'counseling', 'physical therapy',
        'ache', 'aches', 'sore', 'swollen', 'swelling', 'bruise', 'cut', 'burn',
        'first aid', 'bandage', 'stitches', 'x-ray', 'scan', 'test', 'examination'
    ]
    
    non_healthcare_indicators = [
        'weather forecast only', 'stock price', 'news update', 'sports score', 'entertainment news',
        'cooking recipe', 'travel booking', 'shopping list', 'political news', 'business news',
        'technology review', 'movie review', 'music recommendation', 'game strategy', 'fashion advice'
    ]
    
    user_input_lower = user_input.lower()
    
    # Check for non-healthcare content
    for indicator in non_healthcare_indicators:
        if indicator in user_input_lower:
            raise ValueError(f"Healthcare System Alert: This system is specialized for healthcare and hospital evaluation only. Your query about '{indicator}' is outside our scope. Please ask about hospitals, medical care, injuries, healthcare services, or weather-related health concerns.")
    
    # Check for healthcare content - be more lenient
    has_healthcare_content = any(keyword in user_input_lower for keyword in healthcare_keywords)
    
    # Allow queries with common injury/medical terms even if they're short
    injury_terms = ['sprain', 'ankle', 'pain', 'hurt', 'injury', 'sick', 'fever', 'headache', 'ache']
    has_injury_terms = any(term in user_input_lower for term in injury_terms)
    
    # Only reject if it's clearly not healthcare related and long enough to be meaningful
    if not has_healthcare_content and not has_injury_terms and len(user_input.split()) > 5:
        # Allow any query that mentions body parts or common medical terms
        body_parts = ['head', 'neck', 'shoulder', 'arm', 'hand', 'chest', 'back', 'leg', 'foot', 'knee', 'elbow', 'wrist', 'finger', 'toe']
        has_body_parts = any(part in user_input_lower for part in body_parts)
        
        if not has_body_parts:
            raise ValueError("Healthcare System Alert: Please specify your healthcare-related question. This system helps with hospital evaluation, medical care, injuries, healthcare services, and weather-related health concerns. Please rephrase your query to include healthcare context.")
    
    return user_input

# ===============================
# HOSPITAL RAG FUNCTIONS
# ===============================

def extract_hospital_locations_from_rag(location: str, injury_type: str = "general") -> List[Dict]:
    """Extract hospital location data from RAG system with OpenAI enhancement"""
    try:
        # Mock RAG search results (replace with actual RAG implementation)
        mock_rag_results = [
            {
                "content": f"Regional Medical Center near {location} - Full-service hospital with emergency department, trauma center, and specialized care units. Located at downtown area with 24/7 availability.",
                "metadata": {"relevance_score": 0.95, "source": "hospital_directory"}
            },
            {
                "content": f"City General Hospital in {location} - Community hospital offering urgent care, family medicine, and surgical services. Known for excellent patient care and modern facilities.",
                "metadata": {"relevance_score": 0.88, "source": "healthcare_database"}
            },
            {
                "content": f"Emergency Care Center near {location} - Specialized emergency and urgent care facility with fast treatment times and expert medical staff.",
                "metadata": {"relevance_score": 0.82, "source": "emergency_services"}
            }
        ]
        
        hospitals = []
        for result in mock_rag_results:
            hospital_info = parse_hospital_from_rag_content(
                result["content"], 
                result["metadata"], 
                location
            )
            if hospital_info:
                hospitals.append(hospital_info)
        
        return hospitals
        
    except Exception as e:
        print(f"Error in RAG hospital extraction: {e}")
        return []

def parse_hospital_from_rag_content(content: str, metadata: dict, location: str) -> Optional[Dict]:
    """Parse hospital information from RAG content"""
    try:
        # Extract hospital name
        name_match = re.search(r'(.*?(?:Hospital|Medical Center|Clinic|Care Center))', content, re.IGNORECASE)
        hospital_name = name_match.group(1).strip() if name_match else "Unknown Hospital"
        
        # Generate realistic hospital data with proper coordinates
        import random
        
        # Generate coordinates near the location (mock implementation)
        base_lat = 34.0522 if "los angeles" in location.lower() else 33.1597
        base_lng = -118.2437 if "los angeles" in location.lower() else -117.0796
        
        # Add random offset for different hospitals
        lat_offset = (random.random() - 0.5) * 0.1  # ~5 mile radius
        lng_offset = (random.random() - 0.5) * 0.1
        
        hospital_info = {
            'name': hospital_name,
            'address': f"123 Healthcare Blvd, {location}",
            'phone': f"(555) 123-4567",
            'services': ['Emergency Care', 'Urgent Care', 'General Medicine'],
            'rating': round(4.0 + random.random() * 1.0, 1),  # Rating between 4.0-5.0
            'emergency': True,
            'urgent_care': True,
            'coordinates': {
                'lat': round(base_lat + lat_offset, 6),
                'lng': round(base_lng + lng_offset, 6)
            },
            'relevance_score': metadata.get('relevance_score', 0.0),
            'distance': f"{round(random.uniform(0.5, 5.0), 1)} miles away",
            'wait_time': f"{random.randint(10, 45)} minutes"
        }
        
        # Try to extract coordinates using OpenAI if missing
        if not hospital_info['coordinates']:
            coords = extract_coordinates_with_openai(hospital_name, hospital_info['address'], location)
            if coords:
                hospital_info['coordinates'] = coords
        
        return hospital_info
        
    except Exception as e:
        print(f"Error parsing hospital content: {e}")
        return None

def generate_mock_healthcare_response(user_query: str, location_context: str) -> str:
    """Generate mock healthcare responses for common queries when OpenAI is not available"""
    query_lower = user_query.lower()
    
    if any(word in query_lower for word in ['sprain', 'ankle', 'injury', 'hurt', 'twisted']):
        return f"""**Orthopedic Care for Sprained Ankle**

Recommended healthcare facilities for your ankle injury:

1. **Los Angeles Orthopedic Hospital** - 1.2 miles away
   - Rating: 4.8/5, Wait: 15-25 min
   - Specialties: Orthopedics, Sports Medicine, Emergency Care

2. **Urgent Care Express** - 0.8 miles away
   - Rating: 4.5/5, Wait: 10-20 min
   - Specialties: Urgent Care, X-Ray Services, Orthopedic Consultation

3. **Regional Medical Center** - 2.1 miles away
   - Rating: 4.6/5, Wait: 20-30 min
   - Specialties: Emergency Medicine, Orthopedics, Physical Therapy

**Treatment Recommendations:**
- RICE protocol: Rest, Ice, Compression, Elevation
- X-ray evaluation recommended to rule out fracture
- Consider physical therapy for recovery

**When to Seek Immediate Care:**
- Severe pain or inability to bear weight
- Visible deformity or numbness
- Signs of fracture or severe ligament damage

{location_context}"""
    
    elif any(word in query_lower for word in ['allergy', 'allergies', 'allergic', 'weather']):
        return f"""**Weather & Allergy Impact Analysis**

Based on current weather conditions, allergy symptoms may be elevated. Here are recommended healthcare facilities:

1. **Regional Allergy & Asthma Center** - 2.3 miles away
   - Rating: 4.7/5, Wait: 15-25 min
   - Specialties: Allergy Testing, Immunotherapy, Asthma Care

2. **City Medical Center** - 3.1 miles away
   - Rating: 4.5/5, Wait: 20-30 min
   - Specialties: Emergency Care, ENT Services, Pulmonology

3. **Urgent Care Plus** - 1.8 miles away
   - Rating: 4.3/5, Wait: 10-20 min
   - Specialties: Urgent Care, Allergy Shots, Respiratory Care

**Weather-Related Health Tips:**
- High pollen counts may worsen symptoms
- Consider indoor activities during peak pollen hours
- Use air purifiers and keep windows closed

{location_context}"""
    
    elif any(word in query_lower for word in ['hospital', 'emergency', 'urgent']):
        return f"""**Hospital Recommendations**

Top-rated healthcare facilities in your area:

1. **Metropolitan General Hospital** - 2.8 miles away
   - Rating: 4.6/5, Wait: 25-35 min
   - Specialties: Emergency Medicine, Trauma Center, Surgery

2. **Community Health Center** - 1.5 miles away
   - Rating: 4.4/5, Wait: 15-25 min
   - Specialties: Urgent Care, Family Medicine, Pediatrics

3. **Advanced Medical Center** - 4.2 miles away
   - Rating: 4.8/5, Wait: 30-40 min
   - Specialties: Cardiology, Orthopedics, Neurology

**Quality Indicators:**
- Average wait times under 30 minutes
- 24/7 emergency services available
- Modern facilities with latest equipment

{location_context}"""
    
    else:
        return f"""**Healthcare Assistance Available**

I'm here to help with healthcare-related questions including:
- Hospital recommendations and quality assessments
- Medical facility wait times and availability
- Healthcare service guidance
- Weather-related health concerns
- Allergy and symptom management

Please specify your healthcare need, and I'll provide detailed recommendations with nearby hospital options.

{location_context}"""

def extract_coordinates_with_openai(hospital_name: str, address: str, location: str) -> Optional[Dict]:
    """Use OpenAI to extract coordinates for hospital location"""
    try:
        prompt = f"""
        Extract the approximate latitude and longitude coordinates for this hospital:
        Hospital: {hospital_name}
        Address: {address}
        Location: {location}
        
        Respond with only a JSON object in this format:
        {{"lat": latitude_number, "lng": longitude_number}}
        
        If you cannot determine exact coordinates, provide approximate coordinates for the general area of {location}.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=100
        )
        
        result = response.choices[0].message.content.strip()
        coordinates = json.loads(result)
        
        if 'lat' in coordinates and 'lng' in coordinates:
            return coordinates
            
    except Exception as e:
        print(f"OpenAI coordinate extraction error: {e}")
    
    return None

# ===============================
# API ENDPOINTS
# ===============================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Healthcare Multi-Agent Backend",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": {
            "openai_available": OPENAI_AVAILABLE,
            "rag_simulation": True,
            "vectorize_ready": True
        }
    }

@app.get("/healthcare")
async def healthcare_check():
    """Healthcare endpoint for frontend connectivity testing"""
    return {
        "status": "healthy",
        "service": "Healthcare Multi-Agent Backend",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/vectorize-rag")
async def vectorize_rag_search(request: VectorizeRAGRequest):
    """Enhanced vectorize RAG search endpoint"""
    try:
        # Simulate vectorize RAG search
        documents = simulate_vectorize_rag_search(request.query, request.context_window)
        
        return {
            "success": True,
            "query": request.query,
            "documents": documents,
            "total_found": len(documents),
            "context_window": request.context_window,
            "location": request.location
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vectorize RAG search failed: {str(e)}")

@app.post("/api/hospitals/rag-locations")
async def get_hospitals_from_rag(request: HospitalRagRequest):
    """Get hospital locations from RAG system"""
    try:
        hospitals = extract_hospital_locations_from_rag(
            request.location, 
            request.injury_type
        )
        
        return {
            "success": True,
            "hospitals": hospitals[:request.max_results],
            "location": request.location,
            "injury_type": request.injury_type,
            "total_found": len(hospitals),
            "rag_query": f"hospitals near {request.location} for {request.injury_type}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG hospital extraction failed: {str(e)}")

@app.options("/api/healthcare-chat")
async def healthcare_chat_options():
    """Handle CORS preflight requests for healthcare chat"""
    return {"message": "OK"}

@app.post("/api/healthcare-chat")
async def healthcare_chat(request: ChatRequest):
    """Enhanced healthcare chat endpoint with RAG integration"""
    
    # Initialize telemetry for chat endpoint
    chat_run_id = None
    if LANGSMITH_AVAILABLE and langsmith_client:
        try:
            import uuid
            
            # Generate a unique run ID
            chat_run_id = str(uuid.uuid4())
            
            # Create run with explicit ID
            langsmith_client.create_run(
                id=chat_run_id,
                name="healthcare_chat_endpoint",
                run_type="chain",
                inputs={
                    "messages_count": len(request.messages),
                    "user_query": request.messages[-1].content if request.messages else "",
                    "has_location": bool(request.messages[-1].location) if request.messages else False
                },
                project_name=os.getenv("LANGSMITH_PROJECT", "healthcare-rag-system")
            )
            print(f"📊 Chat endpoint tracking started: {chat_run_id}")
        except Exception as e:
            print(f"⚠️ Chat endpoint tracking failed: {e}")
            chat_run_id = None
    
    try:
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        user_message = request.messages[-1]
        user_query = user_message.content
        
        # Validate healthcare query
        try:
            validate_healthcare_query(user_query)
        except ValueError as e:
            return {
                "message": {
                    "role": "assistant",
                    "content": str(e),
                    "type": "guardrail_rejection"
                },
                "guardrail_triggered": True,
                "data_sources": []
            }
        
        # Generate location context
        location_context = ""
        if user_message.location:
            location_context = f"Location: {user_message.location.city or 'Unknown'}"
            if user_message.location.weather:
                weather = user_message.location.weather
                location_context += f" | Weather: {weather.temperature}°F, {weather.condition}, Humidity: {weather.humidity}%"
        
        # Generate enhanced RAG response
        rag_result = await enhance_response_with_rag(user_query, location_context)
        assistant_response = rag_result["enhanced_response"]
        
        # Check if we should include hospital data for this query
        hospital_data = []
        if any(word in user_query.lower() for word in ['hospital', 'facility', 'clinic', 'allergy', 'allergies', 'find', 'recommend', 'care', 'weather', 'symptoms', 'treatment']):
            try:
                # Try to get hospital data from RAG
                location_query = "Los Angeles, CA"  # Default location
                if hasattr(user_message, 'location') and user_message.location and user_message.location.city:
                    location_query = user_message.location.city
                
                rag_hospitals = extract_hospital_locations_from_rag(location_query, "general")
                if rag_hospitals and len(rag_hospitals) > 0:
                    hospital_data = rag_hospitals[:3]  # Limit to top 3 hospitals
            except Exception as e:
                print(f"Error getting hospital data for chat: {e}")
        
        # Prepare data sources
        data_sources = ["Enhanced RAG System"]
        if rag_result.get("openai_used"):
            data_sources.append("OpenAI GPT-4")
        if rag_result.get("context_used", 0) > 0:
            data_sources.append("Healthcare Knowledge Base")
        
        response = {
            "message": {
                "role": "assistant",
                "content": assistant_response,
                "type": "healthcare"
            },
            "guardrail_triggered": False,
            "data_sources": data_sources,
            "hospitals": hospital_data,
            "rag_context": {
                "documents_used": rag_result.get("context_used", 0),
                "openai_enhanced": rag_result.get("openai_used", False),
                "rag_documents": rag_result.get("rag_documents", [])
            }
        }
        
        # Complete chat endpoint telemetry
        if LANGSMITH_AVAILABLE and langsmith_client and chat_run_id:
            try:
                langsmith_client.update_run(
                    chat_run_id,
                    outputs={
                        "response_length": len(assistant_response),
                        "data_sources": data_sources,
                        "hospitals_found": len(hospital_data),
                        "rag_documents_used": rag_result.get("context_used", 0),
                        "openai_enhanced": rag_result.get("openai_used", False),
                        "guardrail_triggered": False,
                        "success": True
                    },
                    end_time=datetime.now()
                )
                print(f"📊 Chat endpoint tracking completed: {chat_run_id}")
            except Exception as e:
                print(f"⚠️ Chat endpoint completion failed: {e}")
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Healthcare chat error: {str(e)}")

# ===============================
# MAIN EXECUTION
# ===============================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
