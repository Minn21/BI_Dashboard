'use client';
import React, { useState, useEffect } from 'react';
import { Users, Home } from 'lucide-react';
import { api } from './api';
import toast from 'react-hot-toast';
import { LoadingCard } from './components';

interface TodayStatus {
  today_arrivals: number;
  today_departures: number;
}

// TodayStatus Component with real data
export function TodayStatus() {
    const [statusData, setStatusData] = useState<TodayStatus | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const result = await api.getTodayStatus();
          setStatusData(result);
        } catch (error) {
          toast.error('Failed to load today\'s status');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    if (loading) return <LoadingCard />;
  
    return (
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-semibold text-gray-100 mb-6">Today's Movement</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-blue-500/20 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-gray-100">{statusData?.today_arrivals}</span>
              <span className="text-sm text-gray-400">Arrivals</span>
            </div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-green-500/20 mb-2">
                <Home className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-2xl font-bold text-gray-100">{statusData?.today_departures}</span>
              <span className="text-sm text-gray-400">Departures</span>
            </div>
          </div>
        </div>
      </div>
    );
  }