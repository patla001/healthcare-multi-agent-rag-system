import { NextRequest, NextResponse } from 'next/server';

interface GeocodeRequest {
  location: string;
}

interface GeocodeResponse {
  lat: number;
  lng: number;
  formatted: string;
  display_name?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { location }: GeocodeRequest = await request.json();
    
    if (!location || location.trim() === '') {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    // Check if input looks like coordinates (lat, lng)
    const coordPattern = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
    const coordMatch = location.match(coordPattern);
    
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      
      // Validate coordinates
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return NextResponse.json({
          lat,
          lng,
          formatted: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          display_name: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
        });
      } else {
        return NextResponse.json({ 
          error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.' 
        }, { status: 400 });
      }
    }

    // Try OpenCage Geocoding API first (if API key is available)
    const OPENCAGE_API_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || process.env.OPENCAGE_API_KEY;
    
    if (OPENCAGE_API_KEY) {
      try {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${OPENCAGE_API_KEY}&limit=1`,
          {
            headers: {
              'User-Agent': 'Healthcare-Map-App/1.0'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            return NextResponse.json({
              lat: result.geometry.lat,
              lng: result.geometry.lng,
              formatted: result.formatted,
              display_name: result.formatted
            });
          }
        }
      } catch (error) {
        console.warn('OpenCage API failed, falling back to Nominatim:', error);
      }
    }

    // Fallback to Nominatim (OpenStreetMap) - free but rate limited
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Healthcare-Map-App/1.0 (contact@example.com)'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          const result = data[0];
          return NextResponse.json({
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            formatted: result.display_name,
            display_name: result.display_name
          });
        }
      }
    } catch (error) {
      console.warn('Nominatim API failed:', error);
    }

    // If all geocoding services fail, try to provide a reasonable default based on common locations
    const commonLocations: { [key: string]: { lat: number; lng: number; name: string } } = {
      'los angeles': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA, USA' },
      'new york': { lat: 40.7128, lng: -74.0060, name: 'New York, NY, USA' },
      'chicago': { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL, USA' },
      'houston': { lat: 29.7604, lng: -95.3698, name: 'Houston, TX, USA' },
      'phoenix': { lat: 33.4484, lng: -112.0740, name: 'Phoenix, AZ, USA' },
      'philadelphia': { lat: 39.9526, lng: -75.1652, name: 'Philadelphia, PA, USA' },
      'san antonio': { lat: 29.4241, lng: -98.4936, name: 'San Antonio, TX, USA' },
      'san diego': { lat: 32.7157, lng: -117.1611, name: 'San Diego, CA, USA' },
      'dallas': { lat: 32.7767, lng: -96.7970, name: 'Dallas, TX, USA' },
      'san jose': { lat: 37.3382, lng: -121.8863, name: 'San Jose, CA, USA' },
    };

    const locationKey = location.toLowerCase();
    for (const [key, coords] of Object.entries(commonLocations)) {
      if (locationKey.includes(key)) {
        return NextResponse.json({
          lat: coords.lat,
          lng: coords.lng,
          formatted: coords.name,
          display_name: coords.name + ' (approximate)'
        });
      }
    }

    // If no match found, return error
    return NextResponse.json({ 
      error: `Location "${location}" not found. Please try a more specific address or city name.` 
    }, { status: 404 });

  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json({ 
      error: 'Failed to process geocoding request' 
    }, { status: 500 });
  }
} 