'use client';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from './api';
import toast from 'react-hot-toast';

interface BookingSourceData {
  source: string;
  count: number;
  revenue: number;
  averageRate: number;
}

export function BookingChannelAnalysis() {
  const [bookingData, setBookingData] = useState<BookingSourceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'count' | 'revenue' | 'averageRate'>('count');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookings = await api.getBookings();
        
        // Process bookings to get channel statistics
        const channelMap = new Map<string, { count: number; revenue: number }>();
        
        bookings.forEach(booking => {
          const source = booking.booking_source;
          const revenue = booking.total_price;
          
          if (!channelMap.has(source)) {
            channelMap.set(source, { count: 0, revenue: 0 });
          }
          
          const current = channelMap.get(source)!;
          channelMap.set(source, {
            count: current.count + 1,
            revenue: current.revenue + revenue
          });
        });
        
        // Convert map to array and calculate average rates
        const channelData: BookingSourceData[] = Array.from(channelMap.entries()).map(([source, data]) => ({
          source,
          count: data.count,
          revenue: data.revenue,
          averageRate: data.revenue / data.count
        }));
        
        // Sort by count (default view)
        channelData.sort((a, b) => b.count - a.count);
        
        setBookingData(channelData);
      } catch (error) {
        toast.error('Failed to load booking channel data');
        console.error('Error fetching booking data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewChange = (mode: 'count' | 'revenue' | 'averageRate') => {
    setViewMode(mode);
    
    // Sort data based on selected view mode
    const sortedData = [...bookingData].sort((a, b) => {
      if (mode === 'count') return b.count - a.count;
      if (mode === 'revenue') return b.revenue - a.revenue;
      return b.averageRate - a.averageRate;
    });
    
    setBookingData(sortedData);
  };

  const getBarFill = () => {
    switch (viewMode) {
      case 'count': return '#3B82F6'; // Blue
      case 'revenue': return '#10B981'; // Green
      case 'averageRate': return '#8B5CF6'; // Purple
      default: return '#3B82F6';
    }
  };

  const formatYAxisTick = (value: number) => {
    if (viewMode === 'revenue' || viewMode === 'averageRate') {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  const getTooltipFormatter = (value: number, name: string) => {
    if (name === 'revenue' || name === 'averageRate') {
      return [`$${value.toLocaleString()}`, name === 'revenue' ? 'Total Revenue' : 'Average Rate'];
    }
    return [value.toLocaleString(), 'Bookings'];
  };

  if (loading) {
    return (
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-800 rounded" />
        <div className="h-64 bg-gray-800 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-100">Booking Channel Analysis</h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewChange('count')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'count' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => handleViewChange('revenue')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'revenue' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => handleViewChange('averageRate')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'averageRate' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Avg. Rate
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={bookingData}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="source" 
            angle={-45} 
            textAnchor="end" 
            height={70} 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
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
          <Bar 
            dataKey={viewMode} 
            name={viewMode === 'count' ? 'Bookings' : viewMode === 'revenue' ? 'Revenue' : 'Average Rate'} 
            fill={getBarFill()} 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm mb-1">Total Bookings</p>
          <p className="text-xl font-semibold text-gray-100">
            {bookingData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
          <p className="text-xl font-semibold text-gray-100">
            ${bookingData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm mb-1">Overall Average Rate</p>
          <p className="text-xl font-semibold text-gray-100">
            ${(bookingData.reduce((sum, item) => sum + item.revenue, 0) / 
               bookingData.reduce((sum, item) => sum + item.count, 0)).toLocaleString(undefined, {maximumFractionDigits: 2})}
          </p>
        </div>
      </div>
    </div>
  );
}
