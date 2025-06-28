"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Navigation, User, Hospital } from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// User Location Benchmark Icon (Blue Star)
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHN0eWxlPi5zdGFyLWZpbGwge2ZpbGw6ICNGRkQ3MDA7IHN0cm9rZTogIzAwNzlGRjsgc3Ryb2tlLXdpZHRoOiAyO308L3N0eWxlPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzAwNzlGRiIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjQiLz4KPHN0YXIgY3g9IjIwIiBjeT0iMjAiIHI9IjEwIiBmaWxsPSIjRkZENzAwIi8+CjxwYXRoIGQ9Im0yMCA4bDMuMDkgOS4yNkwzMiAxOGwtOS4yNiAzLjA5TDIwIDMyTDE2LjkxIDIyLjA5TDggMThsOS4yNi0zLjA5TDIwIDh6IiBmaWxsPSIjRkZENzAwIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjQiIGZpbGw9IiMwMDc5RkYiLz4KPC9zdmc+',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
});

// Hospital Benchmark Icon (Red Cross)
const hospitalBenchmarkIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHN0eWxlPi5zdGFyLWZpbGwge2ZpbGw6ICNGRkQ3MDA7IHN0cm9rZTogI0VGNDQ0NDsgc3Ryb2tlLXdpZHRoOiAyO308L3N0eWxlPgo8Y2lyY2xlIGN4PSIxOCIgY3k9IjE4IiByPSIxNiIgZmlsbD0iI0VGNDQ0NCIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjMiLz4KPHN0YXIgY3g9IjE4IiBjeT0iMTgiIHI9IjgiIGZpbGw9IiNGRkZGRkYiLz4KPHBhdGggZD0iTTE4IDEwVjI2TTI2IDE4SDEwIiBzdHJva2U9IiNFRjQ0NDQiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPg==',
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -45],
});

// Recommended Hospital Benchmark Icon (Gold Star)
const recommendedHospitalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHN0eWxlPi5zdGFyLWZpbGwge2ZpbGw6ICNGRkQ3MDA7IHN0cm9rZTogI0VGNDQ0NDsgc3Ryb2tlLXdpZHRoOiAyO308L3N0eWxlPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI0VGNDQ0NCIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjQiLz4KPHN0YXIgY3g9IjIwIiBjeT0iMjAiIHI9IjEwIiBmaWxsPSIjRkZENzAwIi8+CjxwYXRoIGQ9Im0yMCA4bDMuMDkgOS4yNkwzMiAxOGwtOS4yNiAzLjA5TDIwIDMyTDE2LjkxIDIyLjA5TDggMThsOS4yNi0zLjA5TDIwIDh6IiBmaWxsPSIjRkZENzAwIi8+CjxwYXRoIGQ9Ik0yMCAxMlYyOE0yOCAyMEgxMiIgc3Ryb2tlPSIjRUY0NDQ0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4=',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
});

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
  specialties: string[];
  wait_time: string;
  lat?: number;
  lng?: number;
  address?: string;
  phone?: string;
  emergency?: boolean;
  urgentCare?: boolean;
}

interface DualBenchmarkMapProps {
  userLocation?: { lat: number; lng: number };
  searchLocation?: string;
  recommendedHospitals?: RecommendedHospital[];
  onLocationChange?: (location: { lat: number; lng: number; address: string }) => void;
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

// Map updater component to handle center changes
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export default function DualBenchmarkMap({ 
  userLocation, 
  searchLocation, 
  recommendedHospitals, 
  onLocationChange 
}: DualBenchmarkMapProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchStatus, setSearchStatus] = useState<string>('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]); // Default to center of USA
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Use environment variable for backend URL, with proper fallbacks for development and production
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

  // Fetch weather data for a location
  const fetchWeather = async (lat: number, lng: number) => {
    try {
      setSearchStatus('Getting weather data...');
      const response = await fetch(`${BACKEND_URL}/api/weather/current`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon: lng }),
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
      setIsSearching(true);

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
        const newCenter: [number, number] = [data.lat, data.lng];
        setMapCenter(newCenter);
        setCurrentAddress(data.display_name || data.formatted || location);
        setSearchStatus(`Located: ${data.display_name || data.formatted}`);
        
        // Fetch weather for the new location
        await fetchWeather(data.lat, data.lng);
        
        // Notify parent component about location change
        if (onLocationChange) {
          onLocationChange({
            lat: data.lat,
            lng: data.lng,
            address: data.display_name || data.formatted || location
          });
        }
        
        setSearchInput(''); // Clear search input after successful search
      } else {
        const errorData = await response.json();
        setLocationError(errorData.error || `Location "${location}" not found.`);
        setSearchStatus('Location not found');
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      setLocationError(`Failed to search for location. Please check your internet connection and try again.`);
      setSearchStatus('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Get current GPS location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    setIsSearching(true);
    setSearchStatus('Getting your current location...');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newCenter: [number, number] = [latitude, longitude];
        setMapCenter(newCenter);
        setCurrentAddress('Your Current Location');
        setSearchStatus('Using your current location');
        
        // Fetch weather for current location
        await fetchWeather(latitude, longitude);
        
        // Notify parent component about location change
        if (onLocationChange) {
          onLocationChange({
            lat: latitude,
            lng: longitude,
            address: 'Your Current Location'
          });
        }
        
        setIsSearching(false);
      },
      (error) => {
        setLocationError(`Location access denied: ${error.message}`);
        setSearchStatus('Location access failed');
        setIsSearching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    await geocodeLocation(searchInput.trim());
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const initializeMap = async () => {
      setLoading(true);
      setLocationError(null);
      
      try {
        // Use user location if available, otherwise search location, otherwise default
        if (userLocation) {
          setMapCenter([userLocation.lat, userLocation.lng]);
          setCurrentAddress('Your Location');
          setSearchStatus('Using your current location');
          await fetchWeather(userLocation.lat, userLocation.lng);
        } else {
          const location = searchLocation || 'Los Angeles, CA';
          await geocodeLocation(location);
        }
        
        setSearchStatus('Ready');
      } catch (error) {
        console.error('Error initializing map:', error);
        setSearchStatus('Initialization failed');
      } finally {
        setLoading(false);
      }
    };

    initializeMap();
  }, [searchLocation, isClient]);

  // Handle user location updates
  useEffect(() => {
    if (userLocation && !loading) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setCurrentAddress('Your Current Location');
      setSearchStatus('Using your current location');
      fetchWeather(userLocation.lat, userLocation.lng);
    }
  }, [userLocation, loading]);

  if (!isClient || loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isClient ? "Initializing dual benchmark map..." : searchStatus || "Loading location data..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Benchmark Controls Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Dual Benchmark System</h3>
            </div>
            
            {/* Benchmark Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Your Location Benchmark */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Your Location Benchmark</span>
                </div>
                <div className="text-sm text-blue-700">
                  <div>{currentAddress || 'Not set'}</div>
                  {userLocation && (
                    <div className="text-xs text-blue-600 mt-1">
                      ✓ GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>

              {/* Hospital Benchmarks */}
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Hospital className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">Hospital Benchmarks</span>
                </div>
                <div className="text-sm text-red-700">
                  {recommendedHospitals && recommendedHospitals.length > 0 ? (
                    <div>
                      {recommendedHospitals.length} hospitals from chat
                      <div className="text-xs text-red-600 mt-1">
                        ✓ AI recommended locations
                      </div>
                    </div>
                  ) : (
                    <div>No hospital recommendations yet
                      <div className="text-xs text-red-600 mt-1">
                        Ask healthcare chat for recommendations
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="Search for a location (e.g., Los Angeles, CA)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={isSearching}
              />
              <Button 
                type="submit" 
                disabled={isSearching || !searchInput.trim()}
                className="px-4"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={getCurrentLocation}
                disabled={isSearching}
                className="px-4"
                title="Use current location"
              >
                <Navigation className="w-4 h-4" />
              </Button>
            </form>
            
            {/* Status Messages */}
            {(searchStatus || locationError) && (
              <div className={`px-3 py-2 rounded-lg text-sm ${
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
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapUpdater center={mapCenter} />
          
          {/* Your Location Benchmark (Blue Star) */}
          <Marker position={mapCenter} icon={userLocationIcon}>
            <Popup>
              <div className="min-w-48">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <strong className="text-lg text-blue-800">Your Location Benchmark</strong>
                </div>
                <p className="text-sm text-gray-600 mb-2">{currentAddress}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Latitude: {mapCenter[0].toFixed(6)}</div>
                  <div>Longitude: {mapCenter[1].toFixed(6)}</div>
                </div>
                {weather && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="text-sm font-medium mb-1">Current Weather:</div>
                    <div className="text-sm text-gray-600">
                      🌡️ {weather.temperature}°F, {weather.description}
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Hospital Benchmarks (Red Cross Markers) */}
          {recommendedHospitals?.filter(hospital => hospital.lat && hospital.lng).map((hospital, index) => {
            const isRecommended = hospital.rating && parseFloat(hospital.rating) >= 4.0;
            
            return (
              <Marker
                key={`hospital-benchmark-${index}`}
                position={[hospital.lat!, hospital.lng!]}
                icon={isRecommended ? recommendedHospitalIcon : hospitalBenchmarkIcon}
              >
                <Popup>
                  <div className="min-w-64">
                    <div className="flex items-center gap-2 mb-2">
                      <Hospital className="w-5 h-5 text-red-600" />
                      <strong className="text-lg text-red-800">Hospital Benchmark</strong>
                      {isRecommended && (
                        <Badge className="bg-yellow-500 text-yellow-900 text-xs">
                          ⭐ TOP RATED
                        </Badge>
                      )}
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
                            <Badge key={specIndex} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            General Medicine
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {hospital.emergency && (
                          <Badge className="bg-red-500 text-white text-xs">
                            🚨 Emergency
                          </Badge>
                        )}
                        {hospital.urgentCare && (
                          <Badge className="bg-yellow-500 text-yellow-900 text-xs">
                            ⚡ Urgent Care
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          <span className="text-sm">⭐ {hospital.rating}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          ⏱️ {hospital.wait_time}
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
        
        {/* Legend overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
          <h4 className="text-sm font-semibold mb-2">Map Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-blue-600" />
              <span>Your Location Benchmark</span>
            </div>
            <div className="flex items-center gap-2">
              <Hospital className="w-3 h-3 text-red-600" />
              <span>Hospital Benchmarks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⭐</span>
              <span>Top Rated Hospitals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 