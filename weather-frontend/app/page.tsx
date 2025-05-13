'use client';

import { useEffect, useState } from 'react';

type WeatherData = {
  city: string;
  temperature: number;
  description: string;
  wind_speed: number;
  humidity: number;
  icon: string;
  date: string;
  unit: string;
};

type ForecastData = {
  date: string;
  temperature: number;
  description: string;
  icon: string;
}[];

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Nairobi');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (cityName: string, unitType: 'metric' | 'imperial') => {
    setLoading(true);
    setError(null);
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`http://127.0.0.1:8080/api/weather/current?city=${encodeURIComponent(cityName)}&unit=${unitType}`),
        fetch(`http://127.0.0.1:8080/api/weather/forecast?city=${encodeURIComponent(cityName)}&unit=${unitType}`)
      ]);

      if (!weatherRes.ok) throw new Error('Weather data unavailable');
      if (!forecastRes.ok) throw new Error('Forecast data unavailable');

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();

      setWeather(weatherData);
      setForecast(forecastData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city, unit);
    }
  };

  const toggleUnit = () => {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);
    if (city.trim()) {
      fetchWeather(city, newUnit);
    }
  };

  const getWeatherIcon = (description: string) => {
    switch (description.toLowerCase()) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'partly cloudy': return '⛅';
      case 'scattered clouds': return '⛅';
      default: return '🌈';
    }
  };

  useEffect(() => {
    fetchWeather(city, unit);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header with Search and Unit Toggle */}
        <div className="p-6 bg-gradient-to-r from-yellow-400 to-yellow-500 flex justify-between items-center">
          <form onSubmit={handleSearch} className="flex-1 mr-4">
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search city..."
                className="flex-1 px-3 py-1.5 text-sm bg-white text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-sm"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-white text-yellow-800 font-medium rounded-full hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
              >
                Go
              </button>
            </div>
          </form>
          <div className="flex gap-2">
            <button
              onClick={() => toggleUnit()}
              className={`px-2 py-1 rounded-full ${unit === 'metric' ? 'bg-yellow-200' : 'bg-white'} text-yellow-800`}
            >
              °C
            </button>
            <button
              onClick={() => toggleUnit()}
              className={`px-3 py-1 rounded-full ${unit === 'imperial' ? 'bg-yellow-200' : 'bg-white'} text-yellow-800`}
            >
              °F
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600 p-6">
            <p>{error}</p>
          </div>
        ) : weather && forecast ? (
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Section: Current Weather */}
              <div className="w-full md:w-1/2 text-center">
                <div className="mb-4">
                  <span className="text-5xl">{getWeatherIcon(weather.description)}</span>
                </div>
                <div className="mb-4">
                  <p className="text-4xl font-bold text-gray-800">{Math.round(weather.temperature)}°</p>
                </div>
                <div className="mb-4">
                  <p className="text-xl text-gray-600 capitalize">{weather.description}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-2">
                    {new Date(weather.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <h2 className="text-2xl font-semibold text-gray-800">{weather.city}</h2>
                </div>
              </div>

              {/* Right Section: Forecast and Details */}
              <div className="w-full md:w-1/2">
                {/* 3-Day Forecast */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">3-Day Forecast</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {forecast.map((day, index) => (
                      <div key={index} className="bg-yellow-50 rounded-lg p-3 text-center shadow-sm">
                        <p className="font-medium text-gray-700">
                          {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </p>
                        <span className="text-2xl">{getWeatherIcon(day.description)}</span>
                        <p className="text-sm font-semibold text-gray-800 mt-1">
                          {Math.round(day.temperature)}°
                        </p>
                        <p className="text-xs text-gray-600 capitalize">{day.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wind Status and Humidity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 shadow-inner text-center">
                    <p className="text-gray-500 text-sm">Wind Status</p>
                    <p className="text-lg font-semibold text-gray-800">{weather.wind_speed} km/h</p>
                    <p className="text-xs text-gray-500">WSW</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 shadow-inner text-center">
                    <p className="text-gray-500 text-sm">Humidity</p>
                    <p className="text-lg font-semibold text-gray-800">{weather.humidity}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${weather.humidity}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}