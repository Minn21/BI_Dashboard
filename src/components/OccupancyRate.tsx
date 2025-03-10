'use client';
import React, { useState, useEffect } from 'react';
import { api } from './api';
import toast from 'react-hot-toast';
import { LoadingCard } from './components';
import { OccupancyRateFullScreenModal } from './OccupancyRateFullScreenModal';

interface OccupancyADR {
  occupancy_rate: number;
  adr: number;
}

export function OccupancyRate() {
  const [occupancyData, setOccupancyData] = useState<OccupancyADR | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getOccupancyAndADR();
        setOccupancyData(result);
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
        className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => setIsFullScreen(true)}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-100 mb-4 px-4">Occupancy & ADR</h3>
        </div>
        <div className="grid gap-6">
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-blue-500">
                {occupancyData?.occupancy_rate}%
              </span>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-500">
                  ${occupancyData?.adr}
                </div>
              </div>
            </div>
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