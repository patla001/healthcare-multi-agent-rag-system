"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom hospital icon
const hospitalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjREM0NDQ0Ii8+CjxwYXRoIGQ9Ik0xMiA2VjE4TTE4IDEySDE2IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom recommended hospital icon (highlighted)
const recommendedHospitalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHN0eWxlPi5zdGFyLWZpbGwge2ZpbGw6ICNGRkQ3MDA7IHN0cm9rZTogIzAwNzlGRjsgc3Ryb2tlLXdpZHRoOiAyO308L3N0eWxlPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0iIzAwNzlGRiIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjMiLz4KPHN0YXIgY3g9IjE2IiBjeT0iMTYiIHI9IjgiIGZpbGw9IiNGRkQ3MDAiLz4KPHBhdGggZD0ibTE2IDZsMi4xMiA2LjI2TDI0IDEybC02LjI2IDIuMTJMMTYgMjBsLTEuNzQtNS44OEw4IDEybDUuODgtMS43NEwxNiA2WiIgZmlsbD0iI0ZGRDcwMCIvPgo8cGF0aCBkPSJNMTYgMTBWMjJNMjIgMTZIMTAiIHN0cm9rZT0iIzAwNzlGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  services?: string[];
  rating?: number;
  emergency: boolean;
  urgentCare: boolean;
}

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface RecommendedHospital {
  name: string;
  distance: string;
  rating: string;
  specialties?: string[];
  wait_time: string;
  lat?: number;
  lng?: number;
  address?: string;
  phone?: string;
  emergency?: boolean;
  urgentCare?: boolean;
}

interface HospitalMapProps {
  userLocation?: { lat: number; lng: number };
  searchLocation?: string;
  injuryType?: string;
  recommendedHospitals?: RecommendedHospital[];
}

// Weather overlay component
function WeatherOverlay({ weather }: { weather: WeatherData | null }) {
  if (!weather) return null;

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <h3 className="text-lg font-semibold mb-2">🌤️ Current Weather</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">📍 {weather.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{weather.temperature}°F</span>
          <span className="text-sm text-gray-600 capitalize">{weather.description}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>💧 {weather.humidity}%</div>
          <div>💨 {weather.windSpeed} mph</div>
        </div>
      </div>
    </div>
  );
}

export default function HospitalMap({ userLocation, searchLocation, injuryType, recommendedHospitals }: HospitalMapProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchStatus, setSearchStatus] = useState<string>('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]); // Default to center of USA
  const [isClient, setIsClient] = useState(false);

  // Use environment variable for backend URL, fallback to Vercel serverless functions
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || (typeof window !== 'undefined' ? '' : '');

  // Fetch hospitals from your backend
  const fetchHospitals = async (location: string) => {
    try {
      setSearchStatus('Finding hospitals...');
      const response = await fetch(`${BACKEND_URL}/api/hospitals/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          location,
          injuryType: injuryType || 'general',
          radius: 25 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setHospitals(data.hospitals || []);
        setSearchStatus(`Found ${data.hospitals?.length || 0} hospitals`);
      } else {
        setSearchStatus('Failed to fetch hospitals');
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setSearchStatus('Error loading hospitals');
    }
  };

  // Fetch weather data
  const fetchWeather = async (location: string) => {
    try {
      setSearchStatus('Getting weather data...');
      const response = await fetch(`${BACKEND_URL}/api/weather`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }),
      });

      if (response.ok) {
        const data = await response.json();
        setWeather(data);
        setSearchStatus('Weather data loaded');
      } else {
        setSearchStatus('Weather data unavailable');
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      setSearchStatus('Weather service error');
    }
  };

  // Enhanced geocode location function using server-side API
  const geocodeLocation = async (location: string) => {
    try {
      setSearchStatus(`Searching for "${location}"...`);
      setLocationError(null);

      // Use our server-side geocoding API
      const response = await fetch(`${BACKEND_URL}/api/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location }),
      });

      if (response.ok) {
        const data = await response.json();
        setMapCenter([data.lat, data.lng]);
        setSearchStatus(`Located: ${data.display_name || data.formatted}`);
      } else {
        const errorData = await response.json();
        setLocationError(errorData.error || `Location "${location}" not found.`);
        setSearchStatus('Location not found');
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      setLocationError(`Failed to search for location. Please check your internet connection and try again.`);
      setSearchStatus('Search failed');
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const initializeMap = async () => {
      setLoading(true);
      setLocationError(null);
      
      const location = searchLocation || 'Los Angeles, CA';
      
      try {
        // Geocode the location first
        await geocodeLocation(location);
        
        // Then fetch hospitals and weather in parallel
        await Promise.all([
          fetchHospitals(location),
          fetchWeather(location)
        ]);
        
        setSearchStatus('Ready');
      } catch (error) {
        console.error('Error initializing map:', error);
        setSearchStatus('Initialization failed');
      } finally {
        setLoading(false);
      }
    };

    initializeMap();
  }, [searchLocation, injuryType, isClient]);

  // Handle user location
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setSearchStatus('Using your current location');
    }
  }, [userLocation]);

  if (!isClient || loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isClient ? "Initializing map..." : searchStatus || "Loading hospitals and weather data..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
      {/* Search Status Banner */}
      {(searchStatus || locationError) && (
        <div className={`absolute top-4 left-4 z-[1000] px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs ${
          locationError 
            ? 'bg-red-100 border border-red-300 text-red-800' 
            : searchStatus.includes('Error') || searchStatus.includes('Failed')
              ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
              : 'bg-green-100 border border-green-300 text-green-800'
        }`}>
          <div className="flex items-center gap-2">
            <div className={
              locationError 
                ? '❌' 
                : searchStatus.includes('Error') || searchStatus.includes('Failed')
                  ? '⚠️'
                  : '✅'
            }>
            </div>
            <span>{locationError || searchStatus}</span>
          </div>
        </div>
      )}
      
      <MapContainer
        center={mapCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        key={`${mapCenter[0]}-${mapCenter[1]}`} // Force re-render when center changes
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Search location center marker */}
        <Marker position={mapCenter}>
          <Popup>
            <div>
              <strong>📍 Search Location</strong>
              <br />
              <span className="text-sm text-gray-600">
                {searchLocation || 'Center of search area'}
              </span>
              <br />
              <span className="text-xs text-gray-500">
                {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
              </span>
            </div>
          </Popup>
        </Marker>
        
        {/* User location marker (if different from search location) */}
        {userLocation && (
          Math.abs(userLocation.lat - mapCenter[0]) > 0.01 || 
          Math.abs(userLocation.lng - mapCenter[1]) > 0.01
        ) && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <div>
                <strong>👤 Your Current Location</strong>
                <br />
                <span className="text-xs text-gray-500">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Regular Hospital markers */}
        {hospitals.filter(hospital => hospital.lat && hospital.lng).map((hospital) => (
          <Marker
            key={hospital.id}
            position={[hospital.lat, hospital.lng]}
            icon={hospitalIcon}
          >
            <Popup>
              <div className="min-w-64">
                <h3 className="font-semibold text-lg mb-2">🏥 {hospital.name}</h3>
                <p className="text-sm text-gray-600 mb-2">📍 {hospital.address}</p>
                
                {hospital.phone && (
                  <p className="text-sm text-gray-600 mb-2">📞 {hospital.phone}</p>
                )}
                
                <div className="mb-2">
                  <p className="text-sm font-medium">Services:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hospital.services && hospital.services.length > 0 ? (
                      hospital.services.map((service, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {service}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        General Medicine
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {hospital.emergency && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        🚨 Emergency
                      </span>
                    )}
                    {hospital.urgentCare && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        ⚡ Urgent Care
                      </span>
                    )}
                  </div>
                  
                  {hospital.rating && (
                    <div className="flex items-center">
                      <span className="text-sm">⭐ {hospital.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Recommended Hospital markers (highlighted) */}
        {recommendedHospitals?.filter(hospital => hospital.lat && hospital.lng).map((hospital, index) => {
          
          return (
            <Marker
              key={`recommended-${index}`}
              position={[hospital.lat!, hospital.lng!]}
              icon={recommendedHospitalIcon}
            >
              <Popup>
                <div className="min-w-64">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">
                      ⭐ AI RECOMMENDED
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">🏥 {hospital.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">📍 {hospital.address}</p>
                  <p className="text-sm text-gray-600 mb-2">📏 Distance: {hospital.distance}</p>
                  
                  {hospital.phone && (
                    <p className="text-sm text-gray-600 mb-2">📞 {hospital.phone}</p>
                  )}
                  
                  <div className="mb-2">
                    <p className="text-sm font-medium">Specialties:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hospital.specialties && hospital.specialties.length > 0 ? (
                        hospital.specialties.map((specialty, specIndex) => (
                          <span key={specIndex} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {specialty}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          General Medicine
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {hospital.emergency && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          🚨 Emergency
                        </span>
                      )}
                      {hospital.urgentCare && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          ⚡ Urgent Care
                        </span>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        <span className="text-sm">⭐ {hospital.rating}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        ⏱️ Wait: {hospital.wait_time}
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Weather overlay */}
      <WeatherOverlay weather={weather} />
    </div>
  );
} 