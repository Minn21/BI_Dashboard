// WeatherWidget.tsx
import React, { useState, useEffect } from 'react';
import { Sun, Moon, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export function WeatherWidget() {
    const [weatherData, setWeatherData] = useState<{
        temperature: number;
        condition: string;
        isDay: boolean;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    // Replace with your OpenWeatherMap API key
    const apiKey = '907f56534ede1e46b4c3a0830f7747b2';
    const city = 'Bangkok'; // Replace with the desired city
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`; // Use metric for Celsius

    const fetchWeatherData = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }
            const data = await response.json();

            // Extract relevant weather information
            const temperature = Math.round(data.main.temp);
            const condition = data.weather[0].description;
            const isDay = data.weather[0].icon.includes('d'); // 'd' indicates day, 'n' indicates night

            setWeatherData({
                temperature,
                condition,
                isDay,
            });
        } catch (error) {
            toast.error('Failed to fetch weather data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch weather data immediately when the component mounts
        fetchWeatherData();

        // Set up a polling interval to fetch weather data every 5 minutes (300,000 milliseconds)
        const interval = setInterval(fetchWeatherData, 100000); // 5 minutes

        // Clean up the interval when the component unmounts
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="animate-pulse bg-gray-300 w-8 h-8 rounded-full" />
                    <div className="text-white">
                        <h3 className="text-2xl font-bold animate-pulse">--°C</h3>
                        <p className="text-sm animate-pulse">Loading weather...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!weatherData) {
        return (
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="text-white">
                        <h3 className="text-2xl font-bold">--°C</h3>
                        <p className="text-sm">Weather data unavailable</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-5 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {weatherData.isDay ? (
                        <Sun className="w-10 h-10 text-yellow-300 animate-spin-slow transition-transform transform hover:scale-110" />
                    ) : (
                        <Moon className="w-10 h-10 text-gray-200 animate-pulse transition-transform transform hover:scale-110" />
                    )}
                    <div className="text-white">
                        <h3 className="text-3xl font-bold transition-opacity duration-500 ease-in-out">
                            {weatherData.temperature}°C
                        </h3>
                        <p className="text-sm capitalize transition-opacity duration-500 ease-in-out">
                            {weatherData.condition}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}