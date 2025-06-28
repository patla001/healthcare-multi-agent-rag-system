from http.server import BaseHTTPRequestHandler
import json

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
            
            # Geocode the location
            coords = self.geocode_location(location)
            
            self.wfile.write(json.dumps(coords).encode())
            
        except Exception as e:
            error_response = {"error": f"Geocoding error: {str(e)}"}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def geocode_location(self, location):
        """Geocode a location string to coordinates"""
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