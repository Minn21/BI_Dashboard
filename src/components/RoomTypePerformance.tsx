'use client';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from './api';
import toast from 'react-hot-toast';

interface RoomTypeData {
  roomType: string;
  bookings: number;
  revenue: number;
  occupancy: number;
  averageRate: number;
  averageStay: number;
}

export function RoomTypePerformance() {
  const [roomData, setRoomData] = useState<RoomTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<'occupancy' | 'revenue' | 'averageRate' | 'averageStay'>('occupancy');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get unit bookings data
        const unitBookings = await api.getFrequentUnits();
        
        // Process data by room type
        const roomTypeMap = new Map<string, {
          bookings: number;
          revenue: number;
          occupancy: number;
          averageRate: number;
          averageStay: number;
          count: number; // For calculating averages
        }>();
        
        unitBookings.forEach(unit => {
          const roomType = unit.room_type || 'Unknown';
          
          if (!roomTypeMap.has(roomType)) {
            roomTypeMap.set(roomType, {
              bookings: 0,
              revenue: 0,
              occupancy: 0,
              averageRate: 0,
              averageStay: 0,
              count: 0
            });
          }
          
          const current = roomTypeMap.get(roomType)!;
          roomTypeMap.set(roomType, {
            bookings: current.bookings + unit.booking_count,
            revenue: current.revenue + (unit.total_revenue || 0),
            occupancy: current.occupancy + (unit.occupancy_percentage || 0),
            averageRate: current.averageRate + (unit.average_rate || 0),
            averageStay: current.averageStay + (unit.average_stay || 0),
            count: current.count + 1
          });
        });
        
        // Convert map to array and calculate averages
        const roomTypeData: RoomTypeData[] = Array.from(roomTypeMap.entries()).map(([roomType, data]) => ({
          roomType,
          bookings: data.bookings,
          revenue: data.revenue,
          occupancy: data.count > 0 ? data.occupancy / data.count : 0,
          averageRate: data.count > 0 ? data.averageRate / data.count : 0,
          averageStay: data.count > 0 ? data.averageStay / data.count : 0
        }));
        
        // Sort by occupancy (default view)
        roomTypeData.sort((a, b) => b.occupancy - a.occupancy);
        
        setRoomData(roomTypeData);
      } catch (error) {
        toast.error('Failed to load room type performance data');
        console.error('Error fetching room data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMetricChange = (newMetric: 'occupancy' | 'revenue' | 'averageRate' | 'averageStay') => {
    setMetric(newMetric);
    
    // Sort data based on selected metric
    const sortedData = [...roomData].sort((a, b) => {
      if (newMetric === 'occupancy') return b.occupancy - a.occupancy;
      if (newMetric === 'revenue') return b.revenue - a.revenue;
      if (newMetric === 'averageRate') return b.averageRate - a.averageRate;
      return b.averageStay - a.averageStay;
    });
    
    setRoomData(sortedData);
  };

  const getMetricTitle = () => {
    switch (metric) {
      case 'occupancy': return 'Occupancy Rate';
      case 'revenue': return 'Total Revenue';
      case 'averageRate': return 'Average Daily Rate';
      case 'averageStay': return 'Average Length of Stay';
    }
  };

  const getBarFill = () => {
    switch (metric) {
      case 'occupancy': return '#3B82F6'; // Blue
      case 'revenue': return '#10B981'; // Green
      case 'averageRate': return '#8B5CF6'; // Purple
      case 'averageStay': return '#F59E0B'; // Yellow
      default: return '#3B82F6';
    }
  };

  const formatYAxisTick = (value: number) => {
    if (metric === 'revenue' || metric === 'averageRate') {
      return `$${value.toLocaleString()}`;
    } else if (metric === 'occupancy') {
      return `${value}%`;
    } else if (metric === 'averageStay') {
      return `${value.toFixed(1)} days`;
    }
    return value.toLocaleString();
  };

  const getTooltipFormatter = (value: number, name: string) => {
    if (name === 'revenue' || name === 'averageRate') {
      return [`$${value.toLocaleString()}`, name === 'revenue' ? 'Total Revenue' : 'Average Rate'];
    } else if (name === 'occupancy') {
      return [`${value.toFixed(1)}%`, 'Occupancy Rate'];
    } else if (name === 'averageStay') {
      return [`${value.toFixed(1)} days`, 'Average Stay'];
    }
    return [value.toLocaleString(), name];
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
        <h3 className="text-xl font-semibold text-gray-100">Room Type Performance</h3>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleMetricChange('occupancy')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              metric === 'occupancy' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Occupancy
          </button>
          <button
            onClick={() => handleMetricChange('revenue')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              metric === 'revenue' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => handleMetricChange('averageRate')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              metric === 'averageRate' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ADR
          </button>
          <button
            onClick={() => handleMetricChange('averageStay')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              metric === 'averageStay' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Stay Length
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={roomData}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="roomType" 
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
            dataKey={metric} 
            name={getMetricTitle()} 
            fill={getBarFill()} 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Room Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bookings</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Occupancy</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ADR</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg. Stay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {roomData.map((room, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}>
                <td className="px-4 py-3 text-sm text-gray-300">{room.roomType}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{room.bookings}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{room.occupancy.toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm text-gray-300">${room.averageRate.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                <td className="px-4 py-3 text-sm text-gray-300">${room.revenue.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{room.averageStay.toFixed(1)} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
