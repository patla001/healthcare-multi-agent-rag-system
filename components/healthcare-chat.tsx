"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Hospital, Stethoscope, Clock, MapPin, Shield, Thermometer, Navigation } from "lucide-react";
import EnhancedRAGDisplay from "./enhanced-rag-display";

// Hospital recommendation interface
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

// Props interface for HealthcareChat
interface HealthcareChatProps {
  onHospitalRecommendations?: (hospitals: RecommendedHospital[]) => void;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  type?: "healthcare" | "guardrail_rejection" | "error" | "location";
  data_sources?: string[];
  guardrail_triggered?: boolean;
  rag_context?: {
    documents_used: number;
    openai_enhanced: boolean;
    rag_documents: any[];
  };
}

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  weather?: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
  };
}

// Use environment variable for backend URL, fallback to Vercel serverless functions
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || (typeof window !== 'undefined' ? '' : '');

export default function HealthcareChat({ onHospitalRecommendations, onLocationUpdate }: HealthcareChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "🏥 Healthcare Multi-Agent System with Location Intelligence\n\nI'm specialized in helping you find the best hospitals for less severe injuries. I can evaluate staff performance, facility quality, and availability using real-time data.\n\n🎯 I focus on: Minor injuries, sprains, cuts, flu, infections, minor fractures, and urgent care needs.\n🌍 Location-aware: I consider your location and current weather for personalized recommendations.\n\n🔒 This system only handles healthcare-related queries.",
      type: "healthcare"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const [backendError, setBackendError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Check backend status and get location on component mount
  useEffect(() => {
    checkBackendStatus();
    requestLocation();
  }, []);

  const checkBackendStatus = async () => {
    try {
      console.log('Checking backend status at:', `${BACKEND_URL}/health`);
      setBackendError(null);
      const response = await fetch(`${BACKEND_URL}/health`);
      console.log('Backend response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Backend response data:', data);
        setBackendStatus("connected");
        setBackendError(null);
      } else {
        console.error('Backend response not ok:', response.status, response.statusText);
        setBackendStatus("disconnected");
        setBackendError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Backend connection error:', error);
      setBackendStatus("disconnected");
      setBackendError(error instanceof Error ? error.message : String(error));
    }
  };

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    setIsLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Get weather data for the location
          const weatherResponse = await fetch(`${BACKEND_URL}/api/weather/current`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lon: longitude })
          });

          if (weatherResponse.ok) {
            const weatherData = await weatherResponse.json();
            const newLocationData: LocationData = {
              latitude,
              longitude,
              city: weatherData.location,
              weather: {
                temperature: weatherData.temperature,
                condition: weatherData.description,
                humidity: weatherData.humidity,
                windSpeed: weatherData.windSpeed,
                uvIndex: weatherData.uvIndex || 0
              }
            };
            
            setLocationData(newLocationData);
            
            // Notify parent component about location update
            if (onLocationUpdate) {
              onLocationUpdate({ lat: latitude, lng: longitude });
            }
            
            // Add location confirmation message
            const locationMessage: Message = {
              role: "assistant",
              content: `📍 Location detected: ${weatherData.location}\n🌡️ Current weather: ${weatherData.temperature}°F, ${weatherData.description}\n\nI can now provide location-aware healthcare recommendations considering your current weather conditions and nearby facilities.`,
              type: "location"
            };
            setMessages(prev => [...prev, locationMessage]);
          } else {
            const errorText = await weatherResponse.text();
            console.error('Weather API error:', errorText);
            throw new Error(`Weather API returned ${weatherResponse.status}: ${errorText}`);
          }
        } catch (error) {
          // Still save location even if weather fails
          console.error('Weather data error:', error);
          
          // Set location data without weather info
          setLocationData({ latitude, longitude });
          
          // Add location confirmation message without weather
          const locationMessage: Message = {
            role: "assistant",
            content: `📍 Location detected successfully!\n\nI can now provide location-aware healthcare recommendations. Weather data is temporarily unavailable, but I can still help you find nearby hospitals and provide relevant healthcare guidance.`,
            type: "location"
          };
          setMessages(prev => [...prev, locationMessage]);
        }
        
        setIsLocationLoading(false);
      },
      (error) => {
        setLocationError(`Location access denied: ${error.message}`);
        setIsLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Function to parse hospital recommendations from assistant response
  const parseHospitalRecommendations = (content: string): RecommendedHospital[] => {
    const hospitals: RecommendedHospital[] = [];
    
    console.log('Content to parse:', content);
    
    // Look for hospital patterns in the response - Updated to match backend format
    // Format: "1. **Hospital Name** - X.X miles away"
    //         "   - Rating: X.X/5, Wait: XX-XX min"
    //         "   - Specialties: Specialty1, Specialty2, Specialty3"
    
    // Try a more flexible regex that handles the actual backend format
    const hospitalPattern = /(\d+)\.\s*\*\*(.*?)\*\*\s*-\s*([\d.]+\s*miles\s*away)\s*\n\s*-\s*Rating:\s*([\d.\/]+),\s*Wait:\s*([\d-]+\s*min)\s*\n\s*-\s*Specialties:\s*(.*?)(?=\n\n|\n\d+\.|\n\*\*|$)/g;
    
    let match;
    while ((match = hospitalPattern.exec(content)) !== null) {
      console.log('Hospital match found:', match);
      const [, num, name, distance, rating, wait_time, specialtiesStr] = match;
      const specialties = specialtiesStr.split(',').map(s => s.trim());
      
      // Generate mock coordinates near user location (if available)
      const baseLatitude = locationData?.latitude || 34.0522; // Default to LA
      const baseLongitude = locationData?.longitude || -118.2437;
      
      // Add some random offset for different hospitals
      const latOffset = (Math.random() - 0.5) * 0.1; // ~5 mile radius
      const lngOffset = (Math.random() - 0.5) * 0.1;
      
      hospitals.push({
        name: name.trim(),
        distance: distance.trim(),
        rating: rating.trim(),
        wait_time: wait_time.trim(),
        specialties,
        lat: baseLatitude + latOffset,
        lng: baseLongitude + lngOffset,
        address: `${Math.floor(Math.random() * 9999)} Healthcare Blvd, ${locationData?.city || 'Los Angeles'}, CA`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        emergency: specialties.some(s => s.toLowerCase().includes('emergency')),
        urgentCare: specialties.some(s => s.toLowerCase().includes('urgent'))
      });
    }
    
    // If the above pattern doesn't match, try a simpler pattern for the non-location version
    if (hospitals.length === 0) {
      console.log('First regex failed, trying simpler pattern...');
      // Format: "1. **Hospital Name** - Rating: X.X/5, Wait: XX-XX min"
      const simplePattern = /(\d+)\.\s*\*\*(.*?)\*\*\s*-\s*Rating:\s*([\d.\/]+),\s*Wait:\s*([\d-]+\s*min)/g;
      
      let simpleMatch;
      while ((simpleMatch = simplePattern.exec(content)) !== null) {
        console.log('Simple hospital match found:', simpleMatch);
        const [, num, name, rating, wait_time] = simpleMatch;
        
        // Generate mock coordinates near user location (if available)
        const baseLatitude = locationData?.latitude || 34.0522; // Default to LA
        const baseLongitude = locationData?.longitude || -118.2437;
        
        // Add some random offset for different hospitals
        const latOffset = (Math.random() - 0.5) * 0.1; // ~5 mile radius
        const lngOffset = (Math.random() - 0.5) * 0.1;
        
        hospitals.push({
          name: name.trim(),
          distance: 'Location not specified',
          rating: rating.trim(),
          wait_time: wait_time.trim(),
          specialties: ['General Care', 'Emergency Services'],
          lat: baseLatitude + latOffset,
          lng: baseLongitude + lngOffset,
          address: `${Math.floor(Math.random() * 9999)} Healthcare Blvd, ${locationData?.city || 'Los Angeles'}, CA`,
          phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          emergency: true,
          urgentCare: true
        });
      }
    }
    
    console.log('Final parsed hospitals:', hospitals);
    return hospitals;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    console.log('🚀 Sending message:', input);
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => {
      console.log('📝 Adding user message to state:', [...prev, userMessage]);
      return [...prev, userMessage];
    });
    setInput("");
    setIsLoading(true);

    try {
      // Prepare message with location context if available
      const messageWithContext = locationData ? {
        role: "user",
        content: input,
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          city: locationData.city,
          weather: locationData.weather
        }
      } : { role: "user", content: input };

      console.log('📤 Sending message to backend:', messageWithContext);
      console.log('🔗 Backend URL:', `${BACKEND_URL}/api/healthcare-chat`);
      
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [messageWithContext],
          stream: false
        }),
      };
      
      console.log('📋 Request options:', requestOptions);
      
      const response = await fetch(`${BACKEND_URL}/api/healthcare-chat`, requestOptions);

      console.log('📥 Backend response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error response:', errorText);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Backend response data:', data);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message.content,
        type: data.message.type || "healthcare",
        data_sources: data.data_sources,
        guardrail_triggered: data.guardrail_triggered,
        rag_context: data.rag_context
      };

      console.log('🤖 Assistant message to add:', assistantMessage);
      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        console.log('📋 All messages after adding assistant response:', newMessages);
        return newMessages;
      });
      
      // Use structured hospital data from backend if available, otherwise parse from text
      if (onHospitalRecommendations) {
        const userQuery = input.toLowerCase();
        const isHospitalQuery = userQuery.includes('hospital') || 
                               userQuery.includes('facility') || 
                               userQuery.includes('clinic') || 
                               userQuery.includes('emergency') ||
                               userQuery.includes('urgent care') ||
                               userQuery.includes('find') ||
                               userQuery.includes('recommend') ||
                               userQuery.includes('best') ||
                               userQuery.includes('nearby') ||
                               userQuery.includes('near me') ||
                               userQuery.includes('allergies') ||
                               userQuery.includes('allergy') ||
                               userQuery.includes('weather') ||
                               userQuery.includes('symptoms') ||
                               userQuery.includes('treatment') ||
                               userQuery.includes('medical') ||
                               userQuery.includes('care');
        
        if (isHospitalQuery) {
          let hospitals: RecommendedHospital[] = [];
          
          // First try to use structured hospital data from backend
          if (data.hospitals && data.hospitals.length > 0) {
            console.log('🏥 Using structured hospital data from backend:', data.hospitals);
            hospitals = data.hospitals.map((hospital: any) => ({
              name: hospital.name,
              distance: hospital.distance || 'Distance not specified',
              rating: hospital.rating ? `${hospital.rating}/5` : '4.0/5',
              wait_time: hospital.wait_time || '20-30 min',
              specialties: hospital.services || ['General Care', 'Emergency Services'],
              lat: hospital.coordinates?.lat || (locationData?.latitude || 34.0522) + (Math.random() - 0.5) * 0.1,
              lng: hospital.coordinates?.lng || (locationData?.longitude || -118.2437) + (Math.random() - 0.5) * 0.1,
              address: hospital.address || `${Math.floor(Math.random() * 9999)} Healthcare Blvd, ${locationData?.city || 'Los Angeles'}, CA`,
              phone: hospital.phone || `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
              emergency: hospital.emergency || true,
              urgentCare: hospital.urgent_care || true
            }));
          } else {
            // Fallback to parsing from text content
            console.log('📝 No structured data, parsing from text content');
            hospitals = parseHospitalRecommendations(data.message.content);
          }
          
          console.log('🏥 Final hospitals to display:', hospitals);
          if (hospitals.length > 0) {
            onHospitalRecommendations(hospitals);
          }
        }
      }
      
    } catch (error) {
      console.error('💥 Error in sendMessage:', error);
      
      let errorDetails = '';
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorDetails = `\n\n🔍 Network Details:\n- URL: ${BACKEND_URL}/api/healthcare-chat\n- Error Type: ${error.name}\n- Error Message: ${error.message}\n\n💡 Troubleshooting:\n1. Check if backend is running\n2. Check browser console for CORS errors\n3. Try refreshing the page\n4. Check network connectivity`;
      }
      
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ Connection Error: Unable to connect to healthcare backend. Please ensure the Python backend is running on port 8000.\n\nError: ${error}${errorDetails}`,
        type: "error"
      };
      setMessages(prev => {
        const newMessages = [...prev, errorMessage];
        console.log('❌ Adding error message:', newMessages);
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      console.log('✅ sendMessage completed');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case "guardrail_rejection":
        return <Shield className="w-4 h-4 text-red-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "location":
        return <Navigation className="w-4 h-4 text-green-500" />;
      case "healthcare":
        return <Stethoscope className="w-4 h-4 text-blue-500" />;
      default:
        return <Hospital className="w-4 h-4 text-green-500" />;
    }
  };

  const getMessageStyle = (type?: string) => {
    switch (type) {
      case "guardrail_rejection":
        return "border-red-200 bg-red-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "location":
        return "border-green-200 bg-green-50";
      case "healthcare":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-green-200 bg-green-50";
    }
  };



  return (
    <div className="flex flex-col h-[90vh] max-w-4xl mx-auto p-4">
      {/* Header with Backend Status and Location */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Hospital className="w-6 h-6 text-blue-600" />
              Healthcare Multi-Agent System
            </CardTitle>
            <div className="flex items-center gap-4">
              {/* Location Status */}
              <div className="flex items-center gap-2">
                {isLocationLoading ? (
                  <>
                    <Navigation className="w-4 h-4 text-yellow-500 animate-pulse" />
                    <span className="text-sm">Getting location...</span>
                  </>
                ) : locationData ? (
                  <>
                    <Navigation className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">
                      {locationData.city || 'Located'}
                      {locationData.weather && (
                        <span className="ml-1 text-xs text-gray-600">
                          {locationData.weather.temperature}°F
                        </span>
                      )}
                    </span>
                  </>
                ) : locationError ? (
                  <>
                    <MapPin className="w-4 h-4 text-red-500" />
                    <Button variant="outline" size="sm" onClick={requestLocation}>
                      Enable Location
                    </Button>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">No location</span>
                  </>
                )}
              </div>
              
              {/* Backend Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  backendStatus === "connected" ? "bg-green-500" : 
                  backendStatus === "disconnected" ? "bg-red-500" : "bg-yellow-500"
                }`} />
                <span className="text-sm font-medium">
                  Backend: {backendStatus === "connected" ? "Connected" : 
                           backendStatus === "disconnected" ? "Disconnected" : "Checking..."}
                </span>
                <Button variant="outline" size="sm" onClick={checkBackendStatus}>
                  Test Connection
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Stethoscope className="w-3 h-3" />
              Staff Evaluation
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Hospital className="w-3 h-3" />
              Facility Assessment
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Availability Tracking
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Location Services
            </Badge>
            {locationData?.weather && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                Weather-Aware
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => {
          console.log('🎨 Rendering message:', index, message);
          return (
          <div key={index} className={`${
            message.role === "user" ? "ml-auto max-w-xs" : "mr-auto max-w-2xl"
          }`}>
            <Card className={`${
              message.role === "user" 
                ? "bg-blue-100 border-blue-200" 
                : getMessageStyle(message.type)
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {message.role === "user" ? (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        U
                      </div>
                    ) : (
                      getMessageIcon(message.type)
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-1 capitalize">
                      {message.role === "user" ? "You" : 
                       message.type === "guardrail_rejection" ? "Security Alert" :
                       message.type === "error" ? "System Error" :
                       message.type === "location" ? "Location Service" : "Healthcare AI"}
                    </div>
                    {/* Enhanced RAG Display */}
                    {message.rag_context && message.data_sources && (
                      <EnhancedRAGDisplay 
                        ragContext={message.rag_context}
                        dataSources={message.data_sources}
                      />
                    )}
                    
                    <div className="prose prose-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    
                    {/* Fallback Data Sources (for messages without RAG context) */}
                    {!message.rag_context && message.data_sources && message.data_sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Data Sources:</div>
                        <div className="flex flex-wrap gap-1">
                          {message.data_sources.map((source, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Guardrail Status */}
                    {message.guardrail_triggered && (
                      <div className="mt-2 text-xs text-red-600 font-medium">
                        🔒 Healthcare Security: Query rejected by guardrails
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          );
        })}
        
        {isLoading && (
          <div className="mr-auto max-w-2xl">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-4 h-4 text-blue-500 animate-pulse" />
                  <div className="text-blue-700">
                    Healthcare agents are processing your request
                    {locationData && " with location context"}...
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Separator className="mb-4" />

      {/* Input Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder={locationData 
                ? "Ask about nearby hospitals, weather-related health concerns, or facility quality..."
                : "Ask about hospitals, injuries, staff performance, or facility quality..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || backendStatus === "disconnected"}
            />
            <Button 
              onClick={sendMessage}
              disabled={isLoading || !input.trim() || backendStatus === "disconnected"}
              className="px-6"
            >
              {isLoading ? "Processing..." : "Send"}
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            💡 Try: {locationData 
              ? `"Find the best hospital near me for a sprained ankle" or "How does the current weather affect my allergies?"`
              : `"Find the best hospital for a sprained ankle" or "What's the wait time at local hospitals?"`
            }
          </div>
          
          {backendStatus === "disconnected" && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              ⚠️ Backend disconnected. Please start the Python backend: <code>cd agent-python-backend && uv run python main.py</code>
              {backendError && (
                <div className="mt-1 text-xs text-red-600">
                  Error: {backendError}
                </div>
              )}
            </div>
          )}
          
          {locationError && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
              📍 Location access needed for personalized recommendations. <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={requestLocation}>Enable location</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 