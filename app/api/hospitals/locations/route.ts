import { NextRequest, NextResponse } from 'next/server';

interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  services: string[];
  rating?: number;
  emergency: boolean;
  urgentCare: boolean;
}

interface HospitalLocationRequest {
  location: string;
  injuryType?: string;
  radius?: number;
}

// Enhanced geocoding function with multiple fallback options
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  // First try coordinate parsing (if user entered coordinates directly)
  const coordMatch = address.match(/^(-?\d+\.?\d*),?\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // Try server-side geocoding first (to avoid CORS issues)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.lat && data.lng) {
        return { lat: data.lat, lng: data.lng };
      }
    }
  } catch (error) {
    console.warn('Server-side geocoding failed:', error);
  }

  // Fallback to hardcoded coordinates for common locations
  const commonLocations: Record<string, { lat: number; lng: number }> = {
    // Major US Cities
    'new york': { lat: 40.7128, lng: -74.0060 },
    'new york, ny': { lat: 40.7128, lng: -74.0060 },
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'los angeles, ca': { lat: 34.0522, lng: -118.2437 },
    'chicago': { lat: 41.8781, lng: -87.6298 },
    'chicago, il': { lat: 41.8781, lng: -87.6298 },
    'houston': { lat: 29.7604, lng: -95.3698 },
    'houston, tx': { lat: 29.7604, lng: -95.3698 },
    'phoenix': { lat: 33.4484, lng: -112.0740 },
    'phoenix, az': { lat: 33.4484, lng: -112.0740 },
    'philadelphia': { lat: 39.9526, lng: -75.1652 },
    'philadelphia, pa': { lat: 39.9526, lng: -75.1652 },
    'san antonio': { lat: 29.4241, lng: -98.4936 },
    'san antonio, tx': { lat: 29.4241, lng: -98.4936 },
    'san diego': { lat: 32.7157, lng: -117.1611 },
    'san diego, ca': { lat: 32.7157, lng: -117.1611 },
    'dallas': { lat: 32.7767, lng: -96.7970 },
    'dallas, tx': { lat: 32.7767, lng: -96.7970 },
    'san jose': { lat: 37.3382, lng: -121.8863 },
    'san jose, ca': { lat: 37.3382, lng: -121.8863 }
  };

  const normalizedAddress = address.toLowerCase().trim();
  if (commonLocations[normalizedAddress]) {
    return commonLocations[normalizedAddress];
  }

  return null;
}

// Extract hospital data from RAG results
async function extractHospitalDataFromRAG(ragResponse: any): Promise<Hospital[]> {
  const hospitals: Hospital[] = [];
  
  if (!ragResponse || !ragResponse.hospitals) {
    return hospitals;
  }
  
  for (const ragHospital of ragResponse.hospitals) {
    // Only include hospitals that have valid coordinates from RAG
    if (ragHospital.lat && ragHospital.lng) {
      const hospital: Hospital = {
        id: ragHospital.id || `rag-${Math.random().toString(36).substr(2, 9)}`,
        name: ragHospital.name || 'Unknown Hospital',
        address: ragHospital.address || 'Address not available',
        lat: ragHospital.lat,
        lng: ragHospital.lng,
        phone: ragHospital.phone,
        services: ragHospital.services || ['General Medicine'],
        rating: ragHospital.rating || 4.0,
        emergency: ragHospital.emergency || false,
        urgentCare: ragHospital.urgentCare || false
      };
      hospitals.push(hospital);
    }
  }
  
  return hospitals;
}

// Enhanced location-aware mock hospital generation
async function generateLocationAwareMockHospitals(searchLocation: string): Promise<Hospital[]> {
  const mockHospitals: Hospital[] = [];
  
  // Get base coordinates for the search location
  const baseCoords = await geocodeAddress(searchLocation);
  if (!baseCoords) {
    console.warn(`Could not geocode location: ${searchLocation}`);
    // Default to Los Angeles if geocoding fails
    baseCoords.lat = 34.0522;
    baseCoords.lng = -118.2437;
  }
  
  // Hospital templates with realistic data
  const hospitalTemplates = [
    {
      nameTemplate: 'Regional Medical Center',
      services: ['Emergency Medicine', 'Urgent Care', 'Family Medicine', 'Cardiology', 'Orthopedics'],
      rating: 4.5
    },
    {
      nameTemplate: 'General Hospital',
      services: ['Emergency Medicine', 'Trauma Center', 'Pediatrics', 'Surgery', 'Radiology'],
      rating: 4.3
    },
    {
      nameTemplate: 'University Medical Center',
      services: ['Research Hospital', 'Specialized Care', 'Neurology', 'Oncology', 'Teaching Hospital'],
      rating: 4.7
    },
    {
      nameTemplate: 'Community Health Center',
      services: ['Family Medicine', 'Urgent Care', 'Preventive Care', 'Women\'s Health'],
      rating: 4.2
    },
    {
      nameTemplate: 'Urgent Care Center',
      services: ['Urgent Care', 'Walk-in Clinic', 'Minor Injuries', 'Flu Treatment'],
      rating: 4.1
    },
    {
      nameTemplate: 'Memorial Hospital',
      services: ['Emergency Medicine', 'Cardiac Care', 'Maternity', 'Rehabilitation'],
      rating: 4.4
    },
    {
      nameTemplate: 'Children\'s Hospital',
      services: ['Pediatrics', 'Pediatric Emergency', 'Child Surgery', 'Neonatal Care'],
      rating: 4.6
    },
    {
      nameTemplate: 'Veterans Medical Center',
      services: ['Veterans Care', 'Emergency Medicine', 'Mental Health', 'Rehabilitation'],
      rating: 4.0
    }
  ];
  
  // Generate 6-8 hospitals around the search location
  for (let i = 0; i < hospitalTemplates.length; i++) {
    const template = hospitalTemplates[i];
    
    // Generate random offset within ~15 mile radius (approximately 0.2 degrees)
    const latOffset = (Math.random() - 0.5) * 0.4;
    const lngOffset = (Math.random() - 0.5) * 0.4;
    
    const hospitalLat = baseCoords.lat + latOffset;
    const hospitalLng = baseCoords.lng + lngOffset;
    
    // Generate realistic hospital name based on location
    const locationParts = searchLocation.split(',');
    const cityName = locationParts[0].trim();
    const hospitalName = `${cityName} ${template.nameTemplate}`;
    
    // Generate address
    const streetNumber = Math.floor(Math.random() * 9999) + 100;
    const streetNames = ['Medical Blvd', 'Healthcare Dr', 'Hospital Ave', 'Wellness St', 'Care Center Rd'];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    const address = `${streetNumber} ${streetName}, ${searchLocation}`;
    
    // Generate phone number
    const areaCode = Math.floor(Math.random() * 800) + 200;
    const exchange = Math.floor(Math.random() * 800) + 200;
    const number = Math.floor(Math.random() * 9000) + 1000;
    const phone = `(${areaCode}) ${exchange}-${number}`;
    
    mockHospitals.push({
      id: `mock-hospital-${i}`,
      name: hospitalName,
      address: address,
      lat: hospitalLat,
      lng: hospitalLng,
      phone: phone,
      services: template.services,
      rating: template.rating + (Math.random() - 0.5) * 0.4, // Add some variation
      emergency: template.services.includes('Emergency Medicine'),
      urgentCare: template.services.includes('Urgent Care') || template.nameTemplate.includes('Urgent Care')
    });
  }
  
  return mockHospitals;
}

export async function POST(request: NextRequest) {
  try {
    const { location, injuryType, radius }: HospitalLocationRequest = await request.json();
    
    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    console.log(`🏥 Hospital search request: location="${location}", injuryType="${injuryType}", radius=${radius}`);
    
    // PRIORITY 1: Try to get hospital data from RAG system
    const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    
    try {
      console.log('🧠 Attempting to fetch hospital data from RAG system...');
      
      const ragResponse = await fetch(`${backendUrl}/api/hospitals/rag-locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: location,
          injury_type: injuryType || 'general',
          max_results: 10
        })
      });

      if (ragResponse.ok) {
        const ragData = await ragResponse.json();
        console.log('✅ RAG response received:', ragData);
        
        // Extract hospitals from RAG data
        const ragHospitals = await extractHospitalDataFromRAG(ragData);
        
        if (ragHospitals.length > 0) {
          console.log(`🎯 Found ${ragHospitals.length} hospitals from RAG system`);
          return NextResponse.json({ 
            hospitals: ragHospitals,
            source: 'vectorize_rag',
            query_used: ragData.rag_query
          });
        } else {
          console.log('⚠️ RAG system returned no valid hospital coordinates');
        }
      } else {
        console.log('⚠️ RAG API returned non-OK status:', ragResponse.status);
      }
      
    } catch (ragError) {
      console.warn('❌ RAG system unavailable:', ragError);
    }

    // PRIORITY 2: Try the existing find-best-hospitals endpoint for text-based data
    try {
      console.log('🔄 Trying find-best-hospitals endpoint...');
      
      const backendResponse = await fetch(`${backendUrl}/api/find-best-hospitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          injury_description: injuryType || 'general medical care',
          location: location,
          max_distance: radius || 25
        })
      });
      
      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        console.log('✅ Backend response received');
        
        // If backend returns structured hospital data, use it
        if (backendData.hospitals && backendData.hospitals.length > 0) {
          // Add coordinates to backend hospitals if they don't have them
          const hospitalsWithCoords = await Promise.all(
            backendData.hospitals.map(async (hospital: any) => {
              if (!hospital.lat || !hospital.lng) {
                // Generate coordinates near the search location
                const baseCoords = await geocodeAddress(location);
                if (baseCoords) {
                  const latOffset = (Math.random() - 0.5) * 0.1;
                  const lngOffset = (Math.random() - 0.5) * 0.1;
                  hospital.lat = baseCoords.lat + latOffset;
                  hospital.lng = baseCoords.lng + lngOffset;
                }
              }
              return hospital;
            })
          );
          
          console.log(`🎯 Using ${hospitalsWithCoords.length} hospitals from backend`);
          return NextResponse.json({ 
            hospitals: hospitalsWithCoords,
            source: 'backend_structured'
          });
        }
      }
      
    } catch (backendError) {
      console.warn('❌ Backend find-best-hospitals unavailable:', backendError);
    }
    
    // PRIORITY 3: Generate location-aware mock data as fallback
    console.log('🔄 Generating location-aware mock hospital data...');
    const mockHospitals = await generateLocationAwareMockHospitals(location);
    
    console.log(`✅ Generated ${mockHospitals.length} mock hospitals for ${location}`);
    return NextResponse.json({ 
      hospitals: mockHospitals,
      source: 'location_aware_mock',
      note: 'RAG and backend systems unavailable, using location-aware mock data'
    });
    
  } catch (error) {
    console.error('❌ Error in hospital locations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospital locations' },
      { status: 500 }
    );
  }
}