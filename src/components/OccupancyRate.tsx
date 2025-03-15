'use client';
import React, { useState, useEffect } from 'react';
import { api } from './api';
import toast from 'react-hot-toast';
import { LoadingCard } from './components';
import { OccupancyRateFullScreenModal } from './OccupancyRateFullScreenModal';
import { Percent } from 'lucide-react';

interface OccupancyData {
  occupancy_rate: number;
}

export function OccupancyRate() {
  const [occupancyData, setOccupancyData] = useState<OccupancyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getOccupancyAndADR();
        setOccupancyData({ occupancy_rate: result.occupancy_rate });
      } catch (error) {
        toast.error('Failed to load occupancy data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingCard />;

  const chartData = {
    current: [
      { name: 'Occupied', value: occupancyData?.occupancy_rate || 0 },
      { name: 'Available', value: 100 - (occupancyData?.occupancy_rate || 0) },
    ],
    historical: [], // Empty for now; update if historical data is added
  };

  return (
    <>
      <div
        className="bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => setIsFullScreen(true)}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 px-2 sm:px-4">Room Occupancy</h3>
        </div>
        <div className="p-3 sm:p-4 rounded-lg bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Percent className="mr-2 text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm text-gray-400">Current Occupancy</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-blue-500">
              {occupancyData?.occupancy_rate}%
            </span>
          </div>
        </div>
      </div>

      <OccupancyRateFullScreenModal
        isOpen={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        data={chartData}
        title="Room Occupancy Analysis"
      />
    </>
  );
}