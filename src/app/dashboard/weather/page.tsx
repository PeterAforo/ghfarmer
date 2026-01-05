"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
    main: string;
  };
  forecast: Array<{
    date: number;
    tempMax: number;
    tempMin: number;
    description: string;
    icon: string;
    main: string;
    humidity: number;
    windSpeed: number;
  }>;
  location: string;
  lastUpdated: string;
  isMock?: boolean;
}

const REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Savannah",
  "North East",
  "Oti",
];

function getWeatherIcon(main: string, size: "sm" | "lg" = "sm") {
  const sizeClass = size === "lg" ? "h-16 w-16" : "h-8 w-8";
  
  switch (main.toLowerCase()) {
    case "clear":
      return <Sun className={`${sizeClass} text-yellow-500`} />;
    case "rain":
    case "drizzle":
      return <CloudRain className={`${sizeClass} text-blue-500`} />;
    case "thunderstorm":
      return <CloudLightning className={`${sizeClass} text-purple-500`} />;
    case "clouds":
      return <Cloud className={`${sizeClass} text-gray-500`} />;
    default:
      return <Cloud className={`${sizeClass} text-gray-400`} />;
  }
}

function getFarmingAdvice(weather: WeatherData) {
  const { main, humidity } = weather.current;
  const advice: string[] = [];

  if (main.toLowerCase() === "rain" || main.toLowerCase() === "thunderstorm") {
    advice.push("Avoid spraying pesticides or fertilizers today - rain will wash them away");
    advice.push("Good day for transplanting seedlings");
    advice.push("Check drainage systems to prevent waterlogging");
  } else if (main.toLowerCase() === "clear" && weather.current.temp > 30) {
    advice.push("Water crops early morning or late evening to reduce evaporation");
    advice.push("Provide shade for sensitive crops and young livestock");
    advice.push("Ensure animals have access to clean water");
  } else if (humidity > 80) {
    advice.push("High humidity - watch for fungal diseases in crops");
    advice.push("Ensure good ventilation in poultry houses");
  }

  if (advice.length === 0) {
    advice.push("Good conditions for general farm activities");
    advice.push("Suitable for spraying and fertilizer application");
  }

  return advice;
}

export default function WeatherPage() {
  const { data: session } = useSession();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Greater Accra");

  async function fetchWeather(region: string) {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/weather?region=${encodeURIComponent(region)}`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      setError("Unable to load weather data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather(selectedRegion);
  }, [selectedRegion]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <p className="text-gray-600">{error || "Unable to load weather"}</p>
        <Button onClick={() => fetchWeather(selectedRegion)}>Try Again</Button>
      </div>
    );
  }

  const farmingAdvice = getFarmingAdvice(weather);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weather Forecast</h1>
          <p className="text-gray-600">
            Agricultural weather insights for your region
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-white text-gray-900"
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchWeather(selectedRegion)}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {weather.isMock && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          <strong>Demo Mode:</strong> Showing sample weather data. Add OPENWEATHER_API_KEY to .env for live data.
        </div>
      )}

      {/* Current Weather */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              {weather.location}, Ghana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {getWeatherIcon(weather.current.main, "lg")}
              <div>
                <div className="text-5xl font-bold text-gray-900">
                  {weather.current.temp}°C
                </div>
                <p className="text-gray-600 capitalize">
                  {weather.current.description}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-500">Feels Like</p>
                  <p className="font-medium">{weather.current.feelsLike}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Humidity</p>
                  <p className="font-medium">{weather.current.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Wind</p>
                  <p className="font-medium">{weather.current.windSpeed} km/h</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Farming Advice</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {farmingAdvice.map((advice, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-gray-700">{advice}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 5-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>5-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {weather.forecast.map((day, index) => (
              <div
                key={index}
                className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm font-medium text-gray-600">
                  {index === 0
                    ? "Today"
                    : new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                </p>
                <div className="my-3 flex justify-center">
                  {getWeatherIcon(day.main)}
                </div>
                <p className="text-xs text-gray-500 capitalize mb-2">
                  {day.description}
                </p>
                <div className="flex justify-center gap-2 text-sm">
                  <span className="font-medium">{day.tempMax}°</span>
                  <span className="text-gray-400">{day.tempMin}°</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Weather Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weather.forecast.some(
            (day) =>
              day.main.toLowerCase() === "thunderstorm" ||
              day.main.toLowerCase() === "rain"
          ) ? (
            <div className="space-y-3">
              {weather.forecast
                .filter(
                  (day) =>
                    day.main.toLowerCase() === "thunderstorm" ||
                    day.main.toLowerCase() === "rain"
                )
                .map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    {getWeatherIcon(day.main)}
                    <div>
                      <p className="font-medium text-yellow-800">
                        {day.main === "Thunderstorm"
                          ? "Thunderstorm Expected"
                          : "Rain Expected"}
                      </p>
                      <p className="text-sm text-yellow-700">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                        {" - "}
                        {day.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">No weather alerts for the next 5 days</p>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400 text-center">
        Last updated: {new Date(weather.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}
