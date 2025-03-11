import React, { useState, useEffect } from 'react';
import { Sun, Moon, CloudRain, Cloud, CloudSnow, CloudLightning, Wind } from 'lucide-react';
import toast from 'react-hot-toast';

export function WeatherWidget() {
    const [weatherData, setWeatherData] = useState<{
        temperature: number;
        condition: string;
        isDay: boolean;
        city: string;
        humidity: number;
        windSpeed: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    // Replace with your OpenWeatherMap API key
    const apiKey = '907f56534ede1e46b4c3a0830f7747b2';
    const city = 'Bangkok'; // Replace with the desired city
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const getWeatherIcon = (condition: string, isDay: boolean) => {
        const lowerCondition = condition.toLowerCase();

        if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
            return <CloudRain className="w-6 h-6 text-blue-300" />;
        } else if (lowerCondition.includes('cloud')) {
            return <Cloud className="w-6 h-6 text-gray-300" />;
        } else if (lowerCondition.includes('snow')) {
            return <CloudSnow className="w-6 h-6 text-white" />;
        } else if (lowerCondition.includes('thunder') || lowerCondition.includes('lightning')) {
            return <CloudLightning className="w-6 h-6 text-yellow-400" />;
        } else if (lowerCondition.includes('wind') || lowerCondition.includes('breeze')) {
            return <Wind className="w-6 h-6 text-gray-200" />;
        }

        return isDay ? (
            <Sun className="w-6 h-6 text-yellow-300 animate-pulse" />
        ) : (
            <Moon className="w-6 h-6 text-gray-200 animate-pulse" />
        );
    };

    const fetchWeatherData = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }
            const data = await response.json();

            const temperature = Math.round(data.main.temp);
            const condition = data.weather[0].description;
            const isDay = data.weather[0].icon.includes('d');
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;

            setWeatherData({
                temperature,
                condition,
                isDay,
                city: data.name,
                humidity,
                windSpeed
            });
        } catch (error) {
            toast.error('Failed to fetch weather data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeatherData();
        const interval = setInterval(fetchWeatherData, 300000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-blue-600/80 to-purple-700/80 p-2 rounded-xl shadow-md flex items-center justify-center w-24 h-14">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-6 w-6 bg-blue-300/50 rounded-full mb-1"></div>
                    <div className="h-4 w-12 bg-blue-300/50 rounded"></div>
                </div>
            </div>
        );
    }

    if (!weatherData) {
        return (
            <div className="bg-gradient-to-br from-blue-600/80 to-purple-700/80 p-2 rounded-xl shadow-md w-24 h-14 flex items-center justify-center">
                <div className="text-white text-xs">--°C</div>
            </div>
        );
    }

    const getTimeBasedGradient = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 10) return "from-orange-300/80 to-blue-400/80";
        else if (hour >= 10 && hour < 17) return "from-blue-300/80 to-blue-500/80";
        else if (hour >= 17 && hour < 20) return "from-orange-400/80 to-purple-600/80";
        else return "from-blue-800/80 to-purple-800/80";
    };

    return (
        <div className={`bg-gradient-to-br ${getTimeBasedGradient()} p-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-gray-700/30`}>
            <div className="flex items-center gap-2">
                {getWeatherIcon(weatherData.condition, weatherData.isDay)}
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-xl font-bold text-white">
                            {weatherData.temperature}°
                        </h3>
                        <span className="text-xs text-white/80">C</span>
                    </div>
                    <span className="text-xs text-white/90">{weatherData.city}</span>
                </div>
            </div>
        </div>
    );
}