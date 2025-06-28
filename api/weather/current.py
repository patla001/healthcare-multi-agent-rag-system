from http.server import BaseHTTPRequestHandler
import json
import random
import urllib.parse

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
            
            # Extract location data
            location = data.get('location')
            lat = data.get('lat')
            lon = data.get('lon')
            
            # Generate weather data
            weather_data = self.get_weather_data(location, lat, lon)
            
            self.wfile.write(json.dumps(weather_data).encode())
            
        except Exception as e:
            error_response = {"error": f"Weather data error: {str(e)}"}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_GET(self):
        # Handle GET requests with query parameters
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        # Parse query parameters
        parsed_path = urllib.parse.urlparse(self.path)
        query_params = urllib.parse.parse_qs(parsed_path.query)
        
        location = query_params.get('location', [None])[0]
        lat = query_params.get('lat', [None])[0]
        lon = query_params.get('lon', [None])[0]
        
        if lat:
            lat = float(lat)
        if lon:
            lon = float(lon)
        
        weather_data = self.get_weather_data(location, lat, lon)
        self.wfile.write(json.dumps(weather_data).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def get_weather_data(self, location=None, lat=None, lon=None):
        """Generate simulated weather data"""
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
        
        # Generate weather data
        temp_celsius = round(random.uniform(15, 35), 1)
        temp_fahrenheit = round((temp_celsius * 9/5) + 32, 1)
        
        return {
            "location": location_name,
            "temperature": temp_fahrenheit,
            "description": random.choice(conditions),
            "humidity": random.randint(30, 80),
            "windSpeed": round(random.uniform(5, 25), 1),
            "uvIndex": random.randint(1, 11),
            "icon": "01d",
            "condition": random.choice(conditions)
        } 