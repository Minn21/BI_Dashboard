'use client';
import React, { useState, useEffect } from 'react';
import { Users, Home, Clock } from 'lucide-react';
import { api } from './api';
import toast from 'react-hot-toast';
import { LoadingCard } from './components';

interface TodayStatus {
  today_arrivals: number;
  today_departures: number;
  arrival_hours?: { [hour: string]: number };
  departure_hours?: { [hour: string]: number };
}

// Helper function to get time slots for the heatmap
const getTimeSlots = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });
};

// Helper function to determine heat color based on value
const getHeatColor = (value: number, maxValue: number) => {
  if (value === 0) return 'bg-gray-800';
  
  const intensity = Math.min(Math.max((value / maxValue) * 100, 20), 100);
  
  if (value > 0) {
    // Blue gradient for arrivals
    return `bg-blue-${Math.round(intensity / 10) * 100}/70`;
  } else {
    // Green gradient for departures
    return `bg-green-${Math.round(intensity / 10) * 100}/70`;
  }
};

// Enhanced TodayStatus Component with hourly heatmap
export function TodayStatus() {
  const [statusData, setStatusData] = useState<TodayStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'arrivals' | 'departures'>('arrivals');
  const [maxHourlyValue, setMaxHourlyValue] = useState(0);
  const timeSlots = getTimeSlots();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getTodayStatus();
        setStatusData(result);
        
        // Find the maximum hourly value for scaling the heatmap
        const arrivalValues = result.arrival_hours ? Object.values(result.arrival_hours) : [];
        const departureValues = result.departure_hours ? Object.values(result.departure_hours) : [];
        const allValues = [...arrivalValues, ...departureValues];
        setMaxHourlyValue(Math.max(...allValues, 1)); // Ensure at least 1 to avoid division by zero
      } catch (error) {
        toast.error('Failed to load today\'s status');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingCard />;

  // Prepare data for heatmap
  const currentHours = activeTab === 'arrivals' 
    ? statusData?.arrival_hours || {} 
    : statusData?.departure_hours || {};

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">Today's Movement</h3>
      
      {/* Cards for total arrivals and departures */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
          className={`bg-gray-800/50 p-4 rounded-lg cursor-pointer transition-all ${activeTab === 'arrivals' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setActiveTab('arrivals')}
        >
          <div className="flex flex-col items-center">
            <div className="p-2 rounded-full bg-blue-500/20 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{statusData?.today_arrivals}</span>
            <span className="text-sm text-gray-400">Arrivals</span>
          </div>
        </div>
        <div 
          className={`bg-gray-800/50 p-4 rounded-lg cursor-pointer transition-all ${activeTab === 'departures' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => setActiveTab('departures')}
        >
          <div className="flex flex-col items-center">
            <div className="p-2 rounded-full bg-green-500/20 mb-2">
              <Home className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{statusData?.today_departures}</span>
            <span className="text-sm text-gray-400">Departures</span>
          </div>
        </div>
      </div>
      
      {/* Heatmap section */}
      <div className="mt-2">
        <div className="flex items-center mb-4">
          <Clock className="w-4 h-4 text-gray-400 mr-2" />
          <h4 className="text-sm font-medium text-gray-300">
            {activeTab === 'arrivals' ? 'Hourly Arrivals' : 'Hourly Departures'}
          </h4>
        </div>
        
        <div className="grid grid-cols-6 gap-1">
          {timeSlots.map((timeSlot, index) => {
            const hour = timeSlot.split(':')[0];
            const value = currentHours[hour] || 0;
            const colorClass = getHeatColor(value, maxHourlyValue);
            
            return (
              <div key={timeSlot} className="relative">
                <div 
                  className={`h-8 ${colorClass} rounded-md flex items-center justify-center transition-all duration-300`}
                  title={`${timeSlot}: ${value} ${activeTab}`}
                >
                  {value > 0 && <span className="text-xs font-medium text-white">{value}</span>}
                </div>
                {index % 6 === 0 && (
                  <span className="absolute -bottom-5 left-0 text-xs text-gray-500">
                    {timeSlot}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 flex justify-between">
          <span className="text-xs text-gray-500">12 AM</span>
          <span className="text-xs text-gray-500">6 AM</span>
          <span className="text-xs text-gray-500">12 PM</span>
          <span className="text-xs text-gray-500">6 PM</span>
          <span className="text-xs text-gray-500">12 AM</span>
        </div>
        
        <div className="mt-4 flex justify-center">
          <div className="flex items-center">
            <span className="text-xs text-gray-400 mr-2">Low</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-blue-300/30 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-400/40 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-500/50 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-600/60 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-700/70 rounded-sm"></div>
            </div>
            <span className="text-xs text-gray-400 ml-2">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}