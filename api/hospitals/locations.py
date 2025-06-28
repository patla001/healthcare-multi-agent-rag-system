from http.server import BaseHTTPRequestHandler
import json
import random

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
            
            location = data.get('location', '')
            injury_type = data.get('injuryType', 'general')
            radius = data.get('radius', 25)
            
            # Get hospital locations
            hospitals = self.get_hospital_locations(location, injury_type, radius)
            
            self.wfile.write(json.dumps(hospitals).encode())
            
        except Exception as e:
            error_response = {"error": f"Hospital locations error: {str(e)}"}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def get_hospital_locations(self, location, injury_type='general', radius=25):
        """Generate hospital locations for a given area"""
        base_coords = self.geocode_location(location)
        hospitals = []
        
        # Hospital name templates
        hospital_types = [
            "General Hospital", "Medical Center", "Regional Medical Center", 
            "Community Hospital", "Memorial Hospital", "St. Mary's Hospital",
            "University Medical Center", "Emergency Medical Center"
        ]
        
        specialties = [
            ["Emergency Medicine", "Internal Medicine", "Surgery"],
            ["Cardiology", "Emergency Medicine", "Orthopedics"],
            ["Pediatrics", "Emergency Medicine", "Family Medicine"],
            ["Trauma Care", "Emergency Medicine", "Critical Care"],
            ["Orthopedics", "Sports Medicine", "Physical Therapy"],
            ["Urgent Care", "Family Medicine", "Internal Medicine"]
        ]
        
        # Generate 5-8 hospitals
        for i in range(random.randint(5, 8)):
            # Add some location variance
            lat_offset = random.uniform(-0.1, 0.1)
            lng_offset = random.uniform(-0.1, 0.1)
            
            hospital = {
                "name": f"{random.choice(['Central', 'West', 'East', 'North', 'South'])} {random.choice(hospital_types)}",
                "distance": f"{round(random.uniform(0.5, radius), 1)} miles",
                "rating": f"{round(random.uniform(3.5, 5.0), 1)}/5",
                "specialties": random.choice(specialties),
                "wait_time": f"{random.randint(15, 120)}-{random.randint(120, 180)} min",
                "lat": base_coords["lat"] + lat_offset,
                "lng": base_coords["lng"] + lng_offset,
                "address": f"{random.randint(100, 9999)} Medical Drive, {location}",
                "phone": f"({random.randint(200, 999)}) {random.randint(200, 999)}-{random.randint(1000, 9999)}",
                "emergency": random.choice([True, False]),
                "urgentCare": random.choice([True, False])
            }
            hospitals.append(hospital)
        
        # Sort by distance (approximate)
        hospitals.sort(key=lambda x: float(x["distance"].split()[0]))
        
        return hospitals
    
    def geocode_location(self, location):
        """Simple geocoding for demo purposes"""
        location_coords = {
            "los angeles, ca": {"lat": 34.0522, "lng": -118.2437},
            "new york, ny": {"lat": 40.7128, "lng": -74.0060},
            "chicago, il": {"lat": 41.8781, "lng": -87.6298},
            "houston, tx": {"lat": 29.7604, "lng": -95.3698},
            "phoenix, az": {"lat": 33.4484, "lng": -112.0740},
        }
        
        location_lower = location.lower().strip()
        
        # Check for exact or partial match
        for key, coords in location_coords.items():
            if any(part in location_lower for part in key.split(", ")):
                return coords
        
        # Default to Los Angeles
        return {"lat": 34.0522, "lng": -118.2437} 