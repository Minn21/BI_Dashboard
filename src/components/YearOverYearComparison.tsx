'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from './api';
import toast from 'react-hot-toast';

interface YoyData {
  occupancy: Array<{ year: number; value: number }>;
  revenue: Array<{ year: number; value: number }>;
  adr: Array<{ year: number; value: number }>;
}

interface MonthlyData {
  month: string;
  [key: string]: any; // For dynamic year keys
}

export function YearOverYearComparison() {
  const [rawData, setRawData] = useState<YoyData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<'occupancy' | 'revenue' | 'adr'>('occupancy');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const colorMap: Record<string, string> = {
    'Current Year': '#3B82F6', // Blue
    'Previous Year': '#10B981', // Green
    '2 Years Ago': '#F59E0B', // Yellow
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get YoY comparison data
        const yoyData = await api.getYearOverYearComparison();
        setRawData(yoyData);
        
        // Get historical data for monthly breakdown
        const historicalData = await api.getHistoricalData();
        
        // Process historical data into monthly format for the selected metric
        processHistoricalData(historicalData, metric);
      } catch (error) {
        toast.error('Failed to load year-over-year comparison data');
        console.error('Error fetching YoY data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // When metric changes, reprocess the historical data if available
    if (rawData) {
      api.getHistoricalData().then(historicalData => {
        processHistoricalData(historicalData, metric);
      });
    }
  }, [metric, rawData]);

  const processHistoricalData = (historicalData: any[], selectedMetric: 'occupancy' | 'revenue' | 'adr') => {
    // Group data by month
    const monthlyMap = new Map<number, Record<number, number>>();
    
    historicalData.forEach(item => {
      const month = item.month - 1; // 0-based month index
      const year = item.year;
      
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {});
      }
      
      let value: number;
      if (selectedMetric === 'occupancy') {
        value = item.occupancy_and_adr.occupancy_rate;
      } else if (selectedMetric === 'revenue') {
        value = item.total_income.total_income_month;
      } else {
        value = item.occupancy_and_adr.adr;
      }
      
      const monthData = monthlyMap.get(month)!;
      monthData[year] = value;
    });
    
    // Convert map to array format for charts
    const formattedData: MonthlyData[] = [];
    
    // Get unique years from the data
    const years = new Set<number>();
    monthlyMap.forEach(monthData => {
      Object.keys(monthData).forEach(year => years.add(parseInt(year)));
    });
    
    // Sort years in descending order
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    
    // Create labels for the years (Current Year, Previous Year, etc.)
    const yearLabels: Record<number, string> = {};
    sortedYears.forEach((year, index) => {
      if (index === 0) yearLabels[year] = 'Current Year';
      else if (index === 1) yearLabels[year] = 'Previous Year';
      else yearLabels[year] = `${index} Years Ago`;
    });
    
    // Create the formatted data array
    monthlyMap.forEach((yearData, month) => {
      const entry: MonthlyData = { month: monthNames[month] };
      
      sortedYears.forEach(year => {
        if (yearData[year] !== undefined) {
          entry[yearLabels[year]] = yearData[year];
        } else {
          entry[yearLabels[year]] = null; // No data for this month/year
        }
      });
      
      formattedData.push(entry);
    });
    
    // Sort by month order
    formattedData.sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month));
    
    setMonthlyData(formattedData);
  };

  const getMetricTitle = () => {
    switch (metric) {
      case 'occupancy': return 'Occupancy Rate';
      case 'revenue': return 'Monthly Revenue';
      case 'adr': return 'Average Daily Rate';
    }
  };

  const formatYAxisTick = (value: number) => {
    if (metric === 'revenue' || metric === 'adr') {
      return `$${value.toLocaleString()}`;
    } else if (metric === 'occupancy') {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  const getTooltipFormatter = (value: any) => {
    if (metric === 'revenue' || metric === 'adr') {
      return [`$${Number(value).toLocaleString()}`, ''];
    } else if (metric === 'occupancy') {
      return [`${value}%`, ''];
    }
    return [value, ''];
  };

  const getYearSummary = () => {
    if (!rawData) return null;
    
    const data = rawData[metric];
    const years = data.map(item => item.year).sort((a, b) => b - a);
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {years.slice(0, 3).map((year, index) => {
          const yearData = data.find(item => item.year === year);
          if (!yearData) return null;
          
          let label = 'Current Year';
          if (index === 1) label = 'Previous Year';
          else if (index === 2) label = '2 Years Ago';
          
          let formattedValue = yearData.value.toLocaleString();
          if (metric === 'revenue' || metric === 'adr') {
            formattedValue = `$${formattedValue}`;
          } else if (metric === 'occupancy') {
            formattedValue = `${formattedValue}%`;
          }
          
          // Calculate year-over-year change if not the oldest year
          let changeElement = null;
          if (index < years.length - 1) {
            const prevYearData = data.find(item => item.year === years[index + 1]);
            if (prevYearData) {
              const change = ((yearData.value - prevYearData.value) / prevYearData.value) * 100;
              const isPositive = change > 0;
              
              changeElement = (
                <span className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                </span>
              );
            }
          }
          
          return (
            <div key={year} className="bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">{label} ({year})</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-semibold text-gray-100">{formattedValue}</p>
                {changeElement}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-800 rounded" />
        <div className="h-64 bg-gray-800 rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-gray-800 rounded" />
          <div className="h-20 bg-gray-800 rounded" />
          <div className="h-20 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-100">Year-over-Year {getMetricTitle()}</h3>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setMetric('occupancy')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                metric === 'occupancy' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Occupancy
            </button>
            <button
              onClick={() => setMetric('revenue')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                metric === 'revenue' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setMetric('adr')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                metric === 'adr' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ADR
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                chartType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        {chartType === 'line' ? (
          <LineChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
            <YAxis 
              tickFormatter={formatYAxisTick}
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip 
              formatter={getTooltipFormatter}
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
              itemStyle={{ color: '#E5E7EB' }}
            />
            <Legend wrapperStyle={{ color: '#E5E7EB' }} />
            
            {Object.keys(monthlyData[0] || {})
              .filter(key => key !== 'month')
              .map((year, index) => (
                <Line
                  key={year}
                  type="monotone"
                  dataKey={year}
                  name={year}
                  stroke={colorMap[year] || `hsl(${index * 40}, 70%, 50%)`}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
          </LineChart>
        ) : (
          <BarChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
            <YAxis 
              tickFormatter={formatYAxisTick}
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip 
              formatter={getTooltipFormatter}
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
              itemStyle={{ color: '#E5E7EB' }}
            />
            <Legend wrapperStyle={{ color: '#E5E7EB' }} />
            
            {Object.keys(monthlyData[0] || {})
              .filter(key => key !== 'month')
              .map((year, index) => (
                <Bar
                  key={year}
                  dataKey={year}
                  name={year}
                  fill={colorMap[year] || `hsl(${index * 40}, 70%, 50%)`}
                  radius={[4, 4, 0, 0]}
                />
              ))}
          </BarChart>
        )}
      </ResponsiveContainer>

      {getYearSummary()}
    </div>
  );
}
