'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { api } from './api';

type ForecastPeriod = 'month' | 'quarter';

interface ForecastData {
  date: string;
  actual: number | null;
  forecast: number | null;
  potentialLow: number | null;
  potentialHigh: number | null;
}

export const RevenueForecast: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>('month');
  const [growthAreas, setGrowthAreas] = useState<{ name: string; potential: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch historical financial data
        const historicalData = await api.getHistoricalData();
        const totalIncome = await api.getTotalIncome();
        
        // Process data for the chart
        const processedData = processHistoricalData(historicalData);
        setHistoricalData(processedData);
        
        // Analyze potential growth areas
        if (totalIncome.revenue_sources) {
          const growthAreas = analyzeGrowthAreas(historicalData, totalIncome.revenue_sources);
          setGrowthAreas(growthAreas);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch forecast data', error);
        setError('Failed to load revenue forecast data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process historical data to format needed for charting
  const processHistoricalData = (historicalData: any[]): any[] => {
    if (!historicalData || historicalData.length === 0) return [];

    return historicalData.map(monthly => ({
      date: `${monthly.month}/${monthly.year}`,
      actual: monthly.total_income.total_income_month,
      forecast: null,
      potentialLow: null,
      potentialHigh: null
    }));
  };

  // Analyze which areas have the most growth potential
  const analyzeGrowthAreas = (
    historicalData: any[], 
    revenueSources: { [key: string]: number }
  ): { name: string; potential: number }[] => {
    // Simple implementation - in real app would use trend analysis
    const sourceNames: {[key: string]: string} = {
      room: 'Room Bookings',
      food_beverage: 'Food & Beverage',
      spa: 'Spa Services',
      events: 'Events & Conferences',
      other: 'Other Services'
    };
    
    return Object.entries(revenueSources)
      .map(([key, value]) => ({
        name: sourceNames[key] || key,
        potential: value * (1 + Math.random() * 0.3) // Simplified growth projection
      }))
      .sort((a, b) => b.potential - a.potential)
      .slice(0, 3); // Top 3 potential growth areas
  };

  // Generate forecast data based on historical trends
  const forecastData = useMemo(() => {
    if (historicalData.length < 3) return [];
    
    // Copy historical data
    const allData = [...historicalData];
    
    // Calculate average growth rate from the last few months
    const recentMonths = historicalData.slice(-6);
    let growthRates: number[] = [];
    
    for (let i = 1; i < recentMonths.length; i++) {
      const prev = recentMonths[i-1].actual;
      const current = recentMonths[i].actual;
      if (prev > 0) {
        growthRates.push((current - prev) / prev);
      }
    }
    
    // Calculate average growth rate, with fallback
    const avgGrowthRate = growthRates.length > 0 
      ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
      : 0.05; // Default 5% growth if we can't calculate
    
    // Variance for high/low estimates
    const variance = Math.max(0.02, Math.min(0.1, Math.abs(avgGrowthRate) * 2));
    
    // Last actual value
    const lastValue = historicalData[historicalData.length - 1].actual;
    
    // Generate forecast data
    const forecastMonths = forecastPeriod === 'month' ? 3 : 9;
    const lastDate = historicalData[historicalData.length - 1].date;
    const [lastMonth, lastYear] = lastDate.split('/').map(Number);
    
    for (let i = 1; i <= forecastMonths; i++) {
      let forecastMonth = lastMonth + i;
      let forecastYear = lastYear;
      
      // Handle year rollover
      if (forecastMonth > 12) {
        forecastMonth -= 12;
        forecastYear += 1;
      }
      
      const forecastValue = lastValue * Math.pow(1 + avgGrowthRate, i);
      const lowEstimate = forecastValue * (1 - variance);
      const highEstimate = forecastValue * (1 + variance);
      
      allData.push({
        date: `${forecastMonth}/${forecastYear}`,
        actual: null,
        forecast: Math.round(forecastValue),
        potentialLow: Math.round(lowEstimate),
        potentialHigh: Math.round(highEstimate)
      });
    }
    
    return allData;
  }, [historicalData, forecastPeriod]);

  // Format currency values
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-gray-800 p-3 rounded shadow border border-gray-700 text-sm">
          <p className="font-medium text-gray-200">{label}</p>
          {data.actual !== null && (
            <p className="text-blue-400">Actual: {formatCurrency(data.actual)}</p>
          )}
          {data.forecast !== null && (
            <p className="text-purple-400">Forecast: {formatCurrency(data.forecast)}</p>
          )}
          {data.potentialLow !== null && data.potentialHigh !== null && (
            <p className="text-gray-400">
              Range: {formatCurrency(data.potentialLow)} - {formatCurrency(data.potentialHigh)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/30 h-80 flex items-center justify-center">
        <div className="text-gray-400">Loading revenue forecast data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/30">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Revenue Forecast</h3>
        <div className="text-red-400 p-4 rounded bg-red-900/20 border border-red-800/30">
          {error}
        </div>
      </div>
    );
  }

  // Find where actual data ends and forecast begins
  const forecastStartIndex = forecastData.findIndex(item => item.forecast !== null);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/30">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-100">Revenue Forecast</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Forecast period:</span>
          <label htmlFor="forecastPeriod" className="sr-only">Forecast period</label>
          <select
            id="forecastPeriod"
            value={forecastPeriod}
            onChange={(e) => setForecastPeriod(e.target.value as ForecastPeriod)}
            className="bg-gray-700 text-gray-200 text-sm rounded-md border border-gray-600 px-2 py-1"
          >
            <option value="month">3 Months</option>
            <option value="quarter">3 Quarters</option>
          </select>
        </div>
      </div>

      <div className="h-64 sm:h-72 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={forecastData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#9CA3AF' }} 
              stroke="#4B5563" 
            />
            <YAxis 
              tick={{ fill: '#9CA3AF' }} 
              stroke="#4B5563"
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Actual revenue line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 1 }}
              name="Actual Revenue"
              connectNulls
            />
            
            {/* Forecast revenue line */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#8B5CF6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, strokeWidth: 1 }}
              name="Forecasted Revenue"
              connectNulls
            />
            
            {/* Potential range area */}
            <Line
              type="monotone"
              dataKey="potentialHigh"
              stroke="#A78BFA"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name="Upper Estimate"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="potentialLow"
              stroke="#A78BFA"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name="Lower Estimate"
              connectNulls
            />
            
            {/* Reference line where forecast begins */}
            {forecastStartIndex > 0 && (
              <ReferenceLine 
                x={forecastData[forecastStartIndex].date} 
                stroke="#6B7280" 
                strokeDasharray="3 3"
                label={{ 
                  value: "Forecast Start", 
                  position: "insideTop", 
                  fill: "#D1D5DB",
                  fontSize: 12
                }} 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Growth areas section */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Potential Growth Areas</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {growthAreas.map((area, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30">
              <div className="text-sm text-gray-300">{area.name}</div>
              <div className="flex items-end gap-2">
                <span className="text-lg font-semibold text-gray-100">
                  {formatCurrency(area.potential)}
                </span>
                <span className="text-xs text-green-400">
                  +{Math.round((area.potential / (area.potential * 0.7) - 1) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};