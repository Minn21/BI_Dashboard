// WeatherWidget.tsx
import React, { useState, useEffect } from 'react';
import { Sun, Moon, RefreshCw, CloudRain, Cloud, CloudSnow, CloudLightning, Wind } from 'lucide-react';
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
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`; // Use metric for Celsius

    const getWeatherIcon = (condition: string, isDay: boolean) => {
        const lowerCondition = condition.toLowerCase();
        
        if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
            return <CloudRain className="w-8 h-8 md:w-10 md:h-10 text-blue-300" />;
        } else if (lowerCondition.includes('cloud')) {
            return <Cloud className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />;
        } else if (lowerCondition.includes('snow')) {
            return <CloudSnow className="w-8 h-8 md:w-10 md:h-10 text-white" />;
        } else if (lowerCondition.includes('thunder') || lowerCondition.includes('lightning')) {
            return <CloudLightning className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />;
        } else if (lowerCondition.includes('wind') || lowerCondition.includes('breeze')) {
            return <Wind className="w-8 h-8 md:w-10 md:h-10 text-gray-200" />;
        }
        
        return isDay ? (
            <Sun className="w-8 h-8 md:w-10 md:h-10 text-yellow-300 animate-pulse" />
        ) : (
            <Moon className="w-8 h-8 md:w-10 md:h-10 text-gray-200 animate-pulse" />
        );
    };

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
        // Fetch weather data immediately when the component mounts
        fetchWeatherData();

        // Set up a polling interval to fetch weather data every 5 minutes (300,000 milliseconds)
        const interval = setInterval(fetchWeatherData, 100000); // 5 minutes

        // Clean up the interval when the component unmounts
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setLoading(true);
        fetchWeatherData();
        toast.success('Weather data refreshed!');
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-3 md:p-4 rounded-xl shadow-lg flex items-center justify-center w-full max-w-xs transition-all duration-300">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-10 w-10 bg-blue-300 opacity-50 rounded-full mb-2"></div>
                    <div className="h-6 w-24 bg-blue-300 opacity-50 rounded mb-1"></div>
                    <div className="h-4 w-16 bg-blue-300 opacity-50 rounded"></div>
                </div>
            </div>
        );
    }

    if (!weatherData) {
        return (
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-3 md:p-4 rounded-xl shadow-lg w-full max-w-xs transition-all duration-300">
                <div className="flex items-center justify-between">
                    <div className="text-white">
                        <h3 className="text-lg md:text-xl font-bold">--°C</h3>
                        <p className="text-xs md:text-sm">Weather unavailable</p>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate time-based gradient (morning, day, evening, night)
    const getTimeBasedGradient = () => {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 10) { // Morning
            return "from-orange-400 to-blue-500";
        } else if (hour >= 10 && hour < 17) { // Day
            return "from-blue-400 to-blue-600";
        } else if (hour >= 17 && hour < 20) { // Evening
            return "from-orange-500 to-purple-700";
        } else { // Night
            return "from-blue-900 to-purple-900";
        }
    };

    return (
        <div className={`bg-gradient-to-br ${getTimeBasedGradient()} p-3 md:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-xs`}>
            <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-medium text-white opacity-90">{weatherData.city}</span>
                    
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {getWeatherIcon(weatherData.condition, weatherData.isDay)}
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white">
                                {weatherData.temperature}°C
                            </h3>
                            <p className="text-xs md:text-sm capitalize text-white opacity-90">
                                {weatherData.condition}
                            </p>
                        </div>
                    </div>
                </div>
                
                
            </div>
        </div>
    );
}