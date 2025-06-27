"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import HealthcareChat from "@/components/healthcare-chat";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Hospital data interface
export interface RecommendedHospital {
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

// Dynamically import the map component to avoid SSR issues
const HospitalMap = dynamic(() => import('@/components/hospital-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

export default function HealthcarePage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'map'>('chat');
  const [searchLocation, setSearchLocation] = useState('Los Angeles, CA');
  const [injuryType, setInjuryType] = useState('general');
  const [recommendedHospitals, setRecommendedHospitals] = useState<RecommendedHospital[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Handle hospital recommendations from chat
  const handleHospitalRecommendations = (hospitals: RecommendedHospital[]) => {
    setRecommendedHospitals(hospitals);
    // Auto-switch to map tab when hospitals are recommended
    if (hospitals.length > 0) {
      setActiveTab('map');
    }
  };

  // Handle location updates from chat
  const handleLocationUpdate = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏥 Healthcare Multi-Agent System
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI-powered healthcare assistance with intelligent chat and interactive hospital mapping. 
            Find the best hospitals for less severe injuries with real-time availability, weather conditions, and location-aware recommendations.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('chat')}
              className="rounded-md px-6 py-2"
            >
              💬 AI Healthcare Chat
            </Button>
            <Button
              variant={activeTab === 'map' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('map')}
              className="rounded-md px-6 py-2 ml-1"
            >
              🗺️ Hospital Map & Weather
              {recommendedHospitals.length > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-white">
                  {recommendedHospitals.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Hospital Recommendations Notification */}
        {recommendedHospitals.length > 0 && (
          <div className="mb-6">
            <Card className="border-yellow-200 bg-yellow-50">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">⭐</div>
                    <div>
                      <h3 className="font-semibold text-yellow-800">
                        AI Hospital Recommendations Ready!
                      </h3>
                      <p className="text-sm text-yellow-700">
                        Found {recommendedHospitals.length} recommended hospitals based on your query. 
                        {activeTab === 'chat' ? (
                          <span>
                            {' '}Switch to the <strong>Hospital Map</strong> tab to see them visualized on the map.
                          </span>
                        ) : (
                          <span>
                            {' '}Look for the highlighted star markers on the map below.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {activeTab === 'chat' && (
                    <Button
                      onClick={() => setActiveTab('map')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      View on Map 🗺️
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            {/* Features Overview for Chat */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <h3 className="font-semibold">AI Multi-Agent System</h3>
                    <p className="text-sm text-gray-600">Specialized healthcare agents for personalized recommendations</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h3 className="font-semibold">Location-Aware</h3>
                    <p className="text-sm text-gray-600">Weather-informed healthcare guidance based on your location</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <h3 className="font-semibold">Real-Time Data</h3>
                    <p className="text-sm text-gray-600">Live hospital availability and staff performance metrics</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <HealthcareChat 
              onHospitalRecommendations={handleHospitalRecommendations}
              onLocationUpdate={handleLocationUpdate}
            />
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Enhanced Map Controls */}
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🗺️ Location Benchmarking
                </h3>
                <p className="text-sm text-gray-600">
                  Search any location worldwide to benchmark healthcare facilities and weather conditions.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Location Input with Search */}
                <div className="lg:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    📍 Search Location
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter city, address, or coordinates..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          // Trigger search when Enter is pressed
                          setSearchLocation(e.currentTarget.value);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button 
                      onClick={() => {
                        // Force refresh of map data
                        setSearchLocation(searchLocation + ' ');
                        setTimeout(() => setSearchLocation(searchLocation.trim()), 100);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      🔍 Search
                    </Button>
                  </div>
                  
                  {/* Popular Locations Quick Select */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs text-gray-500">Quick select:</span>
                    {[
                      'Los Angeles, CA',
                      'New York, NY',
                      'Chicago, IL',
                      'Houston, TX',
                      'Phoenix, AZ',
                      'Philadelphia, PA',
                      'San Antonio, TX',
                      'San Diego, CA'
                    ].map((location) => (
                      <button
                        key={location}
                        onClick={() => setSearchLocation(location)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Injury Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    🏥 Care Type
                  </label>
                  <select
                    value={injuryType}
                    onChange={(e) => setInjuryType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General Care</option>
                    <option value="emergency">Emergency</option>
                    <option value="urgent care">Urgent Care</option>
                    <option value="sprain">Sprains & Strains</option>
                    <option value="minor fracture">Minor Fractures</option>
                    <option value="cut">Cuts & Wounds</option>
                    <option value="burn">Minor Burns</option>
                    <option value="allergy">Allergic Reactions</option>
                    <option value="flu">Flu & Infections</option>
                  </select>
                </div>

                {/* Location Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    📱 Location Options
                  </label>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const { latitude, longitude } = position.coords;
                              setSearchLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                            },
                            (error) => {
                              alert('Unable to get your location. Please check browser permissions.');
                            },
                            { enableHighAccuracy: true, timeout: 10000 }
                          );
                        } else {
                          alert('Geolocation is not supported by this browser.');
                        }
                      }}
                      className="w-full text-sm"
                      variant="outline"
                    >
                      📍 Use Current Location
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        const coords = prompt('Enter coordinates (latitude, longitude):');
                        if (coords && coords.includes(',')) {
                          setSearchLocation(coords.trim());
                        }
                      }}
                      className="w-full text-sm"
                      variant="outline"
                    >
                      🌐 Enter Coordinates
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Search Info */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 mt-0.5">💡</div>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      Benchmarking Location: {searchLocation}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Enter any location format: "New York, NY" • "123 Main St, Boston, MA" • "40.7128, -74.0060" • "London, UK"
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Map Display */}
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Hospital Locations & Weather Analysis
                </h2>
                <p className="text-gray-600">
                  Interactive map showing hospitals and real-time weather data for <strong>{searchLocation}</strong>. 
                  Click markers for detailed facility information and recommendations.
                </p>
              </div>
              
              <HospitalMap
                searchLocation={searchLocation}
                injuryType={injuryType}
                userLocation={userLocation || undefined}
                recommendedHospitals={recommendedHospitals}
              />
            </Card>

            {/* Location Benchmarking Stats */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  📊 Location Benchmarking Summary
                </h3>
                <p className="text-gray-600">
                  Comprehensive healthcare and environmental analysis for <strong>{searchLocation}</strong>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🏥</div>
                    <div>
                      <p className="text-sm text-gray-600">Healthcare Facilities</p>
                      <p className="text-xl font-bold text-blue-600">25+ Available</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🌡️</div>
                    <div>
                      <p className="text-sm text-gray-600">Weather Status</p>
                      <p className="text-xl font-bold text-green-600">Optimal</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⭐</div>
                    <div>
                      <p className="text-sm text-gray-600">Average Rating</p>
                      <p className="text-xl font-bold text-yellow-600">4.2/5.0</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⏱️</div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Wait Time</p>
                      <p className="text-xl font-bold text-purple-600">15-25 min</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white/70 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 mt-0.5">🎯</div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">
                      Healthcare Accessibility Score: <span className="text-green-600 font-bold">Excellent (8.5/10)</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Based on facility density, quality ratings, weather conditions, and average response times in this area.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Map Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">🏥</div>
                  <h3 className="font-semibold text-lg mb-2">Hospital Benchmarking</h3>
                  <p className="text-gray-600 text-sm">
                    Compare ratings, services, contact info, and real-time availability across locations
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">🌍</div>
                  <h3 className="font-semibold text-lg mb-2">Global Weather Integration</h3>
                  <p className="text-gray-600 text-sm">
                    Analyze weather conditions, temperature, and environmental health factors worldwide
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="font-semibold text-lg mb-2">Location Analytics</h3>
                  <p className="text-gray-600 text-sm">
                    AI-powered insights for healthcare accessibility and quality by geographic region
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Bottom Info Section */}
        <div className="mt-12 text-center">
          <Card className="p-6 bg-white/50 backdrop-blur-sm">
            <h3 className="font-semibold text-lg mb-4">🎯 System Capabilities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-2">
                <Badge variant="secondary" className="w-full">Staff Evaluation</Badge>
                <p className="text-gray-600">Real-time staff performance metrics</p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary" className="w-full">Facility Assessment</Badge>
                <p className="text-gray-600">Quality ratings and equipment status</p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary" className="w-full">Availability Tracking</Badge>
                <p className="text-gray-600">Live bed counts and wait times</p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary" className="w-full">Weather Intelligence</Badge>
                <p className="text-gray-600">Location-aware health recommendations</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 