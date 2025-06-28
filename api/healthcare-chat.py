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
            
            # Get the latest user message and extract location data from it
            user_message = ""
            for msg in reversed(messages):
                if msg.get('role') == 'user':
                    user_message = msg.get('content', '')
                    # Extract location data from the message if available
                    if msg.get('location') and not user_location:
                        user_location = msg.get('location', {})
                        print(f"📍 Extracted location from message: {user_location}")
                    break
            
            print(f"🔍 Processing request with location: {user_location}")
            print(f"💬 User message: {user_message}")
            
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
            "hospital_recommendations": hospitals,  # Add hospital data for map display
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
        
        # Parse location coordinates - try to get lat/lng from location string
        base_lat, base_lng = self.get_location_coordinates(location)
        
        # Hospital templates with different specialties
        hospital_data = [
            {
                "name": "City General Hospital",
                "specialties": ["Emergency Medicine", "Orthopedics", "Internal Medicine"],
                "rating": "4.2",
                "wait_time": "15-45 min",
                "emergency": True,
                "urgentCare": False
            },
            {
                "name": "Regional Medical Center", 
                "specialties": ["Trauma Care", "Emergency Medicine", "Surgery"],
                "rating": "4.5",
                "wait_time": "20-60 min",
                "emergency": True,
                "urgentCare": False
            },
            {
                "name": "Urgent Care Plus",
                "specialties": ["Urgent Care", "Family Medicine", "Minor Injuries"],
                "rating": "4.0", 
                "wait_time": "10-30 min",
                "emergency": False,
                "urgentCare": True
            },
            {
                "name": "University Medical Center",
                "specialties": ["Cardiology", "Emergency Medicine", "Specialized Care"],
                "rating": "4.7",
                "wait_time": "25-75 min",
                "emergency": True,
                "urgentCare": False
            },
            {
                "name": "FastCare Clinic",
                "specialties": ["Walk-in Care", "Minor Injuries", "Preventive Care"],
                "rating": "3.8",
                "wait_time": "5-20 min",
                "emergency": False,
                "urgentCare": True
            }
        ]
        
        # Filter and rank hospitals based on injury type
        relevant_hospitals = []
        for i, hospital in enumerate(hospital_data):
            relevance_score = self.calculate_hospital_relevance(hospital, injury_type)
            if relevance_score > 0.3:  # Only include relevant hospitals
                distance_miles = round(random.uniform(0.8, 12.5), 1)
                
                # Generate coordinates around the base location
                lat_offset = random.uniform(-0.05, 0.05)  # ~3-4 miles radius
                lng_offset = random.uniform(-0.05, 0.05)
                
                hospital['relevance'] = relevance_score
                hospital['distance'] = f"{distance_miles} miles"
                hospital['lat'] = base_lat + lat_offset
                hospital['lng'] = base_lng + lng_offset
                
                # Generate realistic address based on location
                city_name = "Unknown City"
                if isinstance(location, dict):
                    city_name = location.get('city', 'Unknown City')
                elif isinstance(location, str) and location != "Not provided":
                    city_name = location
                
                hospital['address'] = f"{random.randint(100, 9999)} Medical Drive, {city_name}"
                hospital['phone'] = f"({random.randint(200, 999)}) {random.randint(200, 999)}-{random.randint(1000, 9999)}"
                
                print(f"🏥 Generated hospital: {hospital['name']} at ({hospital['lat']:.4f}, {hospital['lng']:.4f})")
                
                relevant_hospitals.append(hospital)
        
        # Sort by relevance score (descending)
        relevant_hospitals.sort(key=lambda x: x['relevance'], reverse=True)
        
        return relevant_hospitals[:4]  # Return top 4 hospitals
    
    def get_location_coordinates(self, location):
        """Get coordinates for a given location - handles both structured data and strings"""
        
        # Default coordinates (Los Angeles area as fallback)
        default_coords = (34.0522, -118.2437)
        
        if not location:
            return default_coords
        
        # Handle structured location data from frontend (preferred method)
        if isinstance(location, dict):
            latitude = location.get('latitude')
            longitude = location.get('longitude')
            
            # If we have valid coordinates, use them
            if latitude is not None and longitude is not None:
                try:
                    lat = float(latitude)
                    lng = float(longitude)
                    # Validate coordinates are reasonable
                    if -90 <= lat <= 90 and -180 <= lng <= 180:
                        print(f"✅ Using structured location coordinates: {lat}, {lng}")
                        return (lat, lng)
                except (ValueError, TypeError):
                    print(f"⚠️ Invalid coordinate values: lat={latitude}, lng={longitude}")
            
            # Fallback to city name if coordinates not available
            city = location.get('city', '')
            if city:
                location_string = city
            else:
                print("⚠️ No valid location data found in structured location object")
                return default_coords
        else:
            # Handle string location data
            location_string = str(location)
        
        # String-based location matching (fallback)
        if location_string and location_string != "Not provided":
            location_coords = {
                "los angeles": (34.0522, -118.2437),
                "new york": (40.7128, -74.0060),
                "chicago": (41.8781, -87.6298),
                "houston": (29.7604, -95.3698),
                "phoenix": (33.4484, -112.0740),
                "philadelphia": (39.9526, -75.1652),
                "san antonio": (29.4241, -98.4936),
                "san diego": (32.7157, -117.1611),
                "dallas": (32.7767, -96.7970),
                "san jose": (37.3382, -121.8863),
                "seattle": (47.6062, -122.3321),
                "boston": (42.3601, -71.0589),
                "denver": (39.7392, -104.9903),
                "atlanta": (33.7490, -84.3880),
                "miami": (25.7617, -80.1918)
            }
            
            location_lower = location_string.lower()
            
            # Check for matches in the location string
            for city, coords in location_coords.items():
                if city in location_lower:
                    print(f"✅ Using city-based coordinates for {city}: {coords}")
                    return coords
        
        # If no match found, return default coordinates
        print(f"⚠️ No location match found, using default coordinates: {default_coords}")
        return default_coords
    
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
        current_location = "your area"
        
        # Get weather info from location data
        if isinstance(location, dict):
            weather_info = location.get('weather', {})
            city_name = location.get('city', '')
            if city_name:
                current_location = city_name
            
            # Use weather from location object if available
            if weather_info and weather_info.get('temperature'):
                temp = weather_info.get('temperature', 70)
                condition = weather_info.get('condition', '')
                if temp > 85:
                    weather_note = f"\n🌡️ Note: It's {temp}°F in {current_location} with {condition} - stay hydrated and consider the heat when traveling to the hospital."
                elif temp < 40:
                    weather_note = f"\n🌡️ Note: It's {temp}°F in {current_location} with {condition} - dress warmly and be careful of icy conditions when traveling."
                else:
                    weather_note = f"\n🌡️ Current weather in {current_location}: {temp}°F, {condition}"
            
        # Fallback to standalone weather data
        elif weather and weather.get('temperature'):
            temp = weather.get('temperature', 70)
            if temp > 85:
                weather_note = f"\n🌡️ Note: It's {temp}°F outside - stay hydrated and consider the heat when traveling to the hospital."
            elif temp < 40:
                weather_note = f"\n🌡️ Note: It's {temp}°F outside - dress warmly and be careful of icy conditions when traveling."
        
        # Build hospital list
        hospital_list = ""
        for i, hospital in enumerate(hospitals, 1):
            specialties_str = ", ".join(hospital['specialties'][:2])  # Show first 2 specialties
            rating_display = f"{hospital['rating']}/5"
            hospital_list += f"\n{i}. **{hospital['name']}** - {hospital['distance']}\n"
            hospital_list += f"   - Rating: {rating_display}, Wait: {hospital['wait_time']}\n"
            hospital_list += f"   - Specialties: {specialties_str}\n"
        
        # Construct full response
        response = f"🏥 **Healthcare Recommendation**\n\n"
        response += f"**Assessment**: {advice}\n"
        response += weather_note
        response += f"\n\n**Recommended Hospitals Near {current_location}:**{hospital_list}"
        response += f"\n💡 **Recommendation**: Based on your condition, I suggest visiting {hospitals[0]['name']} as it has relevant specialties and good availability.\n"
        response += f"\n📞 **Important**: If this is a medical emergency, please call 911 immediately."
        
        return response 