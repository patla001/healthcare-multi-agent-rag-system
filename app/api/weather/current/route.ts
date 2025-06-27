import { NextRequest, NextResponse } from 'next/server';

interface GeolocationWeatherRequest {
  lat: number;
  lon: number;
}

interface WeatherData {
  location: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  feelsLike: number;
  pressure: number;
  visibility: number;
  uvIndex?: number;
  sunrise: number;
  sunset: number;
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lon }: GeolocationWeatherRequest = await request.json();
    
    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }
    
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenWeather API key not found, using mock weather data');
      return NextResponse.json(getMockWeatherDataByCoords(lat, lon));
    }
    
    try {
      // Get current weather data
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        throw new Error('Weather data fetch failed');
      }
      
      const weatherData = await weatherResponse.json();
      
      // Get UV Index data
      let uvIndex = undefined;
      try {
        const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const uvResponse = await fetch(uvUrl);
        if (uvResponse.ok) {
          const uvData = await uvResponse.json();
          uvIndex = Math.round(uvData.value);
        }
      } catch (uvError) {
        console.warn('UV Index fetch failed:', uvError);
      }
      
      const formattedWeatherData: WeatherData = {
        location: `${weatherData.name}, ${weatherData.sys.country}`,
        coordinates: { lat, lon },
        temperature: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed),
        icon: weatherData.weather[0].icon,
        feelsLike: Math.round(weatherData.main.feels_like),
        pressure: weatherData.main.pressure,
        visibility: Math.round(weatherData.visibility / 1000), // Convert to km
        uvIndex,
        sunrise: weatherData.sys.sunrise,
        sunset: weatherData.sys.sunset
      };
      
      return NextResponse.json(formattedWeatherData);
      
    } catch (weatherError) {
      console.warn('Weather API error, using mock data:', weatherError);
      return NextResponse.json(getMockWeatherDataByCoords(lat, lon));
    }
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

function getMockWeatherDataByCoords(lat: number, lon: number): WeatherData {
  // Determine approximate location based on coordinates
  let location = 'Unknown Location';
  let temperature = 68;
  let description = 'partly cloudy';
  let icon = '02d';
  
  // Rough geographic regions
  if (lat >= 32 && lat <= 42 && lon >= -125 && lon <= -114) {
    // California region
    location = 'California, US';
    temperature = 72;
    description = 'sunny';
    icon = '01d';
  } else if (lat >= 40 && lat <= 42 && lon >= -75 && lon <= -73) {
    // New York region
    location = 'New York, US';
    temperature = 58;
    description = 'overcast';
    icon = '04d';
  } else if (lat >= 25 && lat <= 26 && lon >= -81 && lon <= -80) {
    // Miami region
    location = 'Miami, FL';
    temperature = 82;
    description = 'scattered clouds';
    icon = '02d';
  } else if (lat >= 47 && lat <= 48 && lon >= -123 && lon <= -122) {
    // Seattle region
    location = 'Seattle, WA';
    temperature = 55;
    description = 'light rain';
    icon = '10d';
  }
  
  return {
    location,
    coordinates: { lat, lon },
    temperature,
    description,
    humidity: 60,
    windSpeed: 8,
    icon,
    feelsLike: temperature + 2,
    pressure: 1013,
    visibility: 10,
    uvIndex: 5,
    sunrise: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    sunset: Math.floor(Date.now() / 1000) + 7200   // 2 hours from now
  };
} 