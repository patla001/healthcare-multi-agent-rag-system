import { NextRequest, NextResponse } from 'next/server';

interface WeatherRequest {
  location: string;
}

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export async function POST(request: NextRequest) {
  try {
    const { location }: WeatherRequest = await request.json();
    
    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }
    
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenWeather API key not found, using mock weather data');
      return NextResponse.json(getMockWeatherData(location));
    }
    
    try {
      // Get coordinates for the location first
      const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
      const geocodeResponse = await fetch(geocodeUrl);
      
      if (!geocodeResponse.ok) {
        throw new Error('Geocoding failed');
      }
      
      const geocodeData = await geocodeResponse.json();
      
      if (!geocodeData || geocodeData.length === 0) {
        throw new Error('Location not found');
      }
      
      const { lat, lon, name } = geocodeData[0];
      
      // Get weather data
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        throw new Error('Weather data fetch failed');
      }
      
      const weatherData = await weatherResponse.json();
      
      const formattedWeatherData: WeatherData = {
        location: name || location,
        temperature: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed),
        icon: weatherData.weather[0].icon
      };
      
      return NextResponse.json(formattedWeatherData);
      
    } catch (weatherError) {
      console.warn('Weather API error, using mock data:', weatherError);
      return NextResponse.json(getMockWeatherData(location));
    }
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

function getMockWeatherData(location: string): WeatherData {
  // Mock weather data based on location
  const mockWeatherMap: { [key: string]: WeatherData } = {
    'los angeles': {
      location: 'Los Angeles, CA',
      temperature: 72,
      description: 'partly cloudy',
      humidity: 65,
      windSpeed: 8,
      icon: '02d'
    },
    'new york': {
      location: 'New York, NY',
      temperature: 58,
      description: 'overcast',
      humidity: 78,
      windSpeed: 12,
      icon: '04d'
    },
    'chicago': {
      location: 'Chicago, IL',
      temperature: 45,
      description: 'light rain',
      humidity: 85,
      windSpeed: 15,
      icon: '10d'
    },
    'houston': {
      location: 'Houston, TX',
      temperature: 78,
      description: 'sunny',
      humidity: 70,
      windSpeed: 6,
      icon: '01d'
    },
    'phoenix': {
      location: 'Phoenix, AZ',
      temperature: 85,
      description: 'clear sky',
      humidity: 25,
      windSpeed: 4,
      icon: '01d'
    },
    'boston': {
      location: 'Boston, MA',
      temperature: 52,
      description: 'cloudy',
      humidity: 72,
      windSpeed: 10,
      icon: '03d'
    },
    'miami': {
      location: 'Miami, FL',
      temperature: 82,
      description: 'scattered clouds',
      humidity: 80,
      windSpeed: 9,
      icon: '02d'
    },
    'seattle': {
      location: 'Seattle, WA',
      temperature: 55,
      description: 'light rain',
      humidity: 88,
      windSpeed: 7,
      icon: '10d'
    }
  };
  
  // Find matching city
  const locationLower = location.toLowerCase();
  for (const [city, weatherData] of Object.entries(mockWeatherMap)) {
    if (locationLower.includes(city)) {
      return weatherData;
    }
  }
  
  // Default weather data
  return {
    location: location,
    temperature: 68,
    description: 'partly cloudy',
    humidity: 60,
    windSpeed: 8,
    icon: '02d'
  };
} 