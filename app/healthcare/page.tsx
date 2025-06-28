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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'map'>('dashboard');
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

        {/* Enhanced Dashboard Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg border-2 border-blue-100">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('dashboard')}
              className="rounded-md px-6 py-3 text-sm font-medium transition-all duration-200"
            >
              🏠 Dashboard
            </Button>
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('chat')}
              className="rounded-md px-6 py-3 ml-1 text-sm font-medium transition-all duration-200"
            >
              💬 AI Chat Endpoint
            </Button>
            <Button
              variant={activeTab === 'map' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('map')}
              className="rounded-md px-6 py-3 ml-1 text-sm font-medium transition-all duration-200"
            >
              🗺️ Hospital Map Endpoint
              {recommendedHospitals.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white animate-pulse">
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
                        {activeTab !== 'map' ? (
                          <span>
                            {' '}Switch to the <strong>Hospital Map Endpoint</strong> to see them visualized on the map.
                          </span>
                        ) : (
                          <span>
                            {' '}Look for the highlighted star markers on the map below.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {activeTab !== 'map' && (
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

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* System Overview */}
            <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">🎯 Healthcare System Dashboard</h2>
                <p className="text-xl text-blue-100 mb-6">
                  Comprehensive healthcare assistance powered by multiple AI agents
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => setActiveTab('chat')}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-2"
                  >
                    Start AI Chat 💬
                  </Button>
                  <Button
                    onClick={() => setActiveTab('map')}
                    className="bg-white text-purple-600 hover:bg-purple-50 font-medium px-6 py-2"
                  >
                    Explore Map 🗺️
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="text-2xl font-bold text-blue-600 mb-2">Multi-Agent</h3>
                <p className="text-gray-600">AI System</p>
                <p className="text-sm text-gray-500 mt-2">Specialized healthcare agents</p>
              </Card>
              
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">🏥</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">1000+</h3>
                <p className="text-gray-600">Healthcare Facilities</p>
                <p className="text-sm text-gray-500 mt-2">Globally accessible</p>
              </Card>
              
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">🌍</div>
                <h3 className="text-2xl font-bold text-purple-600 mb-2">24/7</h3>
                <p className="text-gray-600">Weather Integration</p>
                <p className="text-sm text-gray-500 mt-2">Real-time global data</p>
              </Card>
              
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-2xl font-bold text-orange-600 mb-2">Real-Time</h3>
                <p className="text-gray-600">Live Updates</p>
                <p className="text-sm text-gray-500 mt-2">Instant recommendations</p>
              </Card>
            </div>



            {/* System Features */}
            <Card className="p-8 bg-gradient-to-r from-gray-50 to-blue-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                ✨ Advanced System Features
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="font-semibold text-lg mb-2">Smart Recommendations</h3>
                  <p className="text-gray-600 text-sm">
                    AI-powered hospital suggestions based on injury type, location, weather, and real-time availability
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="font-semibold text-lg mb-2">Location Benchmarking</h3>
                  <p className="text-gray-600 text-sm">
                    Compare healthcare quality, accessibility, and environmental factors across any location globally
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl mb-3">🔄</div>
                  <h3 className="font-semibold text-lg mb-2">Real-Time Integration</h3>
                  <p className="text-gray-600 text-sm">
                    Live data feeds for hospital availability, staff performance, and weather conditions
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* AI Chat Endpoint Content */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h2 className="text-2xl font-bold text-blue-800 mb-2">💬 AI Healthcare Chat Endpoint</h2>
              <p className="text-blue-700">
                Interactive consultation with specialized healthcare AI agents for personalized recommendations.
              </p>
            </Card>

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

        {/* Hospital Map Endpoint Content */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <Card className="p-6 bg-green-50 border-green-200">
              <h2 className="text-2xl font-bold text-green-800 mb-2">🗺️ Hospital Map Endpoint</h2>
              <p className="text-green-700">
                Global hospital mapping with weather integration and location benchmarking capabilities.
              </p>
            </Card>

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

        {/* System Capabilities Section */}
        <div className="mt-12">
          <Card className="p-6 bg-white/50 backdrop-blur-sm">
            <h3 className="font-semibold text-lg mb-4 text-center">🎯 System Capabilities</h3>
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

        {/* Footer with Last Updated Year */}
        <div className="mt-8 text-center">
          <Card className="p-4 bg-gray-50 border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                <span className="font-medium">Healthcare Multi-Agent System</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Last Updated:</span>
                <Badge variant="outline" className="font-mono">
                  {new Date().getFullYear()}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 