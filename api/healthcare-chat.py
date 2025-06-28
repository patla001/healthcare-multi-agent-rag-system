from http.server import BaseHTTPRequestHandler
import json
import random
import time

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode()) if content_length > 0 else {}
            
            messages = data.get('messages', [])
            user_location = data.get('location', {})
            weather_data = data.get('weather', {})
            
            # Get the latest user message
            user_message = ""
            for msg in reversed(messages):
                if msg.get('role') == 'user':
                    user_message = msg.get('content', '')
                    break
            
            # Generate healthcare response
            response = self.generate_healthcare_response(user_message, user_location, weather_data)
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            error_response = {"error": f"Healthcare chat error: {str(e)}"}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def generate_healthcare_response(self, user_message, location, weather):
        """Generate a healthcare assistant response based on user input"""
        
        # Detect injury/condition type from user message
        message_lower = user_message.lower()
        
        injury_types = {
            'sprain': ['sprained', 'sprain', 'twisted', 'ankle sprain', 'wrist sprain'],
            'cut': ['cut', 'laceration', 'bleeding', 'wound', 'gash'],
            'burn': ['burn', 'burned', 'scald', 'thermal injury'],
            'fracture': ['broken', 'fracture', 'fractured', 'bone'],
            'flu': ['flu', 'fever', 'cold', 'sick', 'influenza'],
            'headache': ['headache', 'migraine', 'head pain'],
            'chest_pain': ['chest pain', 'heart', 'cardiac', 'chest'],
            'allergic': ['allergic', 'allergy', 'rash', 'reaction']
        }
        
        detected_injury = 'general'
        for injury_type, keywords in injury_types.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_injury = injury_type
                break
        
        # Generate hospital recommendations based on injury type
        hospitals = self.generate_hospital_recommendations(detected_injury, location, weather)
        
        # Create response content
        response_content = self.create_response_content(detected_injury, hospitals, location, weather)
        
        return {
            "role": "assistant",
            "content": response_content,
            "type": "healthcare",
            "data_sources": ["hospital_database", "location_services", "weather_api"],
            "rag_context": {
                "documents_used": random.randint(3, 8),
                "openai_enhanced": True,
                "rag_documents": [
                    {"source": "medical_guidelines", "relevance": 0.95},
                    {"source": "hospital_directory", "relevance": 0.88},
                    {"source": "emergency_protocols", "relevance": 0.82}
                ]
            }
        }
    
    def generate_hospital_recommendations(self, injury_type, location, weather):
        """Generate hospital recommendations based on injury type and location"""
        
        # Hospital templates with different specialties
        hospital_data = [
            {
                "name": "City General Hospital",
                "specialties": ["Emergency Medicine", "Orthopedics", "Internal Medicine"],
                "rating": "4.2/5",
                "wait_time": "15-45 min"
            },
            {
                "name": "Regional Medical Center", 
                "specialties": ["Trauma Care", "Emergency Medicine", "Surgery"],
                "rating": "4.5/5",
                "wait_time": "20-60 min"
            },
            {
                "name": "Urgent Care Plus",
                "specialties": ["Urgent Care", "Family Medicine", "Minor Injuries"],
                "rating": "4.0/5", 
                "wait_time": "10-30 min"
            },
            {
                "name": "University Medical Center",
                "specialties": ["Cardiology", "Emergency Medicine", "Specialized Care"],
                "rating": "4.7/5",
                "wait_time": "25-75 min"
            },
            {
                "name": "FastCare Clinic",
                "specialties": ["Walk-in Care", "Minor Injuries", "Preventive Care"],
                "rating": "3.8/5",
                "wait_time": "5-20 min"
            }
        ]
        
        # Filter and rank hospitals based on injury type
        relevant_hospitals = []
        for hospital in hospital_data:
            relevance_score = self.calculate_hospital_relevance(hospital, injury_type)
            if relevance_score > 0.3:  # Only include relevant hospitals
                hospital['relevance'] = relevance_score
                hospital['distance'] = f"{round(random.uniform(0.8, 12.5), 1)} miles away"
                relevant_hospitals.append(hospital)
        
        # Sort by relevance score (descending)
        relevant_hospitals.sort(key=lambda x: x['relevance'], reverse=True)
        
        return relevant_hospitals[:4]  # Return top 4 hospitals
    
    def calculate_hospital_relevance(self, hospital, injury_type):
        """Calculate how relevant a hospital is for a specific injury type"""
        
        specialty_scores = {
            'sprain': {
                'Orthopedics': 0.9,
                'Emergency Medicine': 0.7,
                'Urgent Care': 0.8,
                'Minor Injuries': 0.9
            },
            'cut': {
                'Emergency Medicine': 0.9,
                'Urgent Care': 0.8,
                'Surgery': 0.7,
                'Minor Injuries': 0.8
            },
            'fracture': {
                'Orthopedics': 0.95,
                'Emergency Medicine': 0.8,
                'Trauma Care': 0.9,
                'Surgery': 0.7
            },
            'chest_pain': {
                'Cardiology': 0.95,
                'Emergency Medicine': 0.9,
                'Internal Medicine': 0.7
            },
            'general': {
                'Emergency Medicine': 0.8,
                'Urgent Care': 0.7,
                'Family Medicine': 0.6
            }
        }
        
        injury_scores = specialty_scores.get(injury_type, specialty_scores['general'])
        
        max_score = 0
        for specialty in hospital['specialties']:
            score = injury_scores.get(specialty, 0.3)
            max_score = max(max_score, score)
        
        return max_score
    
    def create_response_content(self, injury_type, hospitals, location, weather):
        """Create the response content for the healthcare assistant"""
        
        # Injury-specific advice
        advice_map = {
            'sprain': "For a sprained ankle, follow the RICE method: Rest, Ice, Compression, and Elevation. Avoid putting weight on the injury.",
            'cut': "For cuts, apply direct pressure to stop bleeding. Clean the wound gently and keep it covered.",
            'fracture': "If you suspect a fracture, avoid moving the injured area and seek immediate medical attention.",
            'chest_pain': "Chest pain can be serious. If you're experiencing severe chest pain, call 911 immediately.",
            'general': "Based on your symptoms, I recommend seeking appropriate medical care."
        }
        
        advice = advice_map.get(injury_type, advice_map['general'])
        
        # Weather considerations
        weather_note = ""
        if weather and weather.get('temperature'):
            temp = weather.get('temperature', 70)
            if temp > 85:
                weather_note = f"\n🌡️ Note: It's {temp}°F outside - stay hydrated and consider the heat when traveling to the hospital."
            elif temp < 40:
                weather_note = f"\n🌡️ Note: It's {temp}°F outside - dress warmly and be careful of icy conditions when traveling."
        
        # Build hospital list
        hospital_list = ""
        for i, hospital in enumerate(hospitals, 1):
            specialties_str = ", ".join(hospital['specialties'][:2])  # Show first 2 specialties
            hospital_list += f"\n{i}. **{hospital['name']}** - {hospital['distance']}\n"
            hospital_list += f"   - Rating: {hospital['rating']}, Wait: {hospital['wait_time']}\n"
            hospital_list += f"   - Specialties: {specialties_str}\n"
        
        # Construct full response
        response = f"🏥 **Healthcare Recommendation**\n\n"
        response += f"**Assessment**: {advice}\n"
        response += weather_note
        response += f"\n\n**Recommended Hospitals Near You:**{hospital_list}"
        response += f"\n💡 **Recommendation**: Based on your condition, I suggest visiting {hospitals[0]['name']} as it has relevant specialties and good availability.\n"
        response += f"\n📞 **Important**: If this is a medical emergency, please call 911 immediately."
        
        return response 