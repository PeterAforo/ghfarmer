import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Ghana region coordinates
const GHANA_REGIONS: Record<string, { lat: number; lon: number }> = {
  "Greater Accra": { lat: 5.6037, lon: -0.187 },
  "Ashanti": { lat: 6.6885, lon: -1.6244 },
  "Western": { lat: 5.0527, lon: -1.9821 },
  "Eastern": { lat: 6.1042, lon: -0.2696 },
  "Central": { lat: 5.1315, lon: -1.2795 },
  "Volta": { lat: 6.6018, lon: 0.4707 },
  "Northern": { lat: 9.4034, lon: -0.8424 },
  "Upper East": { lat: 10.7853, lon: -0.8601 },
  "Upper West": { lat: 10.3927, lon: -2.1439 },
  "Brong-Ahafo": { lat: 7.9527, lon: -1.6781 },
  "Bono": { lat: 7.5, lon: -2.5 },
  "Bono East": { lat: 7.75, lon: -1.05 },
  "Ahafo": { lat: 7.0, lon: -2.3 },
  "Savannah": { lat: 9.0, lon: -1.0 },
  "North East": { lat: 10.5, lon: -0.3 },
  "Oti": { lat: 7.8, lon: 0.3 },
};

// Default to Accra
const DEFAULT_COORDS = { lat: 5.6037, lon: -0.187 };

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || "Greater Accra";
    const coords = GHANA_REGIONS[region] || DEFAULT_COORDS;

    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    console.log("Weather API - API Key present:", !!apiKey);
    
    // If no API key, return mock data for development
    if (!apiKey) {
      console.log("Weather API - No API key, returning mock data");
      return NextResponse.json(getMockWeatherData(region));
    }

    // Fetch current weather
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`
    );

    // Fetch 5-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`
    );

    if (!currentRes.ok || !forecastRes.ok) {
      // Return mock data if API fails
      return NextResponse.json(getMockWeatherData(region));
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    // Process forecast to get daily data
    const dailyForecast = processForecast(forecastData.list);

    return NextResponse.json({
      current: {
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        main: currentData.weather[0].main,
      },
      forecast: dailyForecast,
      location: region,
      lastUpdated: new Date().toISOString(),
      isMock: false,
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}

function processForecast(list: any[]) {
  const dailyMap = new Map();

  list.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date: item.dt * 1000,
        tempMax: item.main.temp_max,
        tempMin: item.main.temp_min,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        main: item.weather[0].main,
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6),
      });
    } else {
      const existing = dailyMap.get(date);
      existing.tempMax = Math.max(existing.tempMax, item.main.temp_max);
      existing.tempMin = Math.min(existing.tempMin, item.main.temp_min);
    }
  });

  return Array.from(dailyMap.values())
    .slice(0, 5)
    .map((day) => ({
      ...day,
      tempMax: Math.round(day.tempMax),
      tempMin: Math.round(day.tempMin),
    }));
}

function getMockWeatherData(region: string) {
  const now = Date.now();
  return {
    current: {
      temp: 28,
      feelsLike: 31,
      humidity: 78,
      windSpeed: 12,
      description: "partly cloudy",
      icon: "02d",
      main: "Clouds",
    },
    forecast: [
      { date: now, tempMax: 30, tempMin: 24, description: "partly cloudy", icon: "02d", main: "Clouds", humidity: 75, windSpeed: 10 },
      { date: now + 86400000, tempMax: 31, tempMin: 25, description: "light rain", icon: "10d", main: "Rain", humidity: 82, windSpeed: 8 },
      { date: now + 172800000, tempMax: 29, tempMin: 24, description: "thunderstorm", icon: "11d", main: "Thunderstorm", humidity: 88, windSpeed: 15 },
      { date: now + 259200000, tempMax: 28, tempMin: 23, description: "scattered clouds", icon: "03d", main: "Clouds", humidity: 70, windSpeed: 12 },
      { date: now + 345600000, tempMax: 30, tempMin: 24, description: "clear sky", icon: "01d", main: "Clear", humidity: 65, windSpeed: 9 },
    ],
    location: region,
    lastUpdated: new Date().toISOString(),
    isMock: true,
  };
}
