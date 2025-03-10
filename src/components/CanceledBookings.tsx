'use client';
import React, { useState, useEffect } from 'react';
import { api } from './api';
import toast from 'react-hot-toast';
import { LoadingCard } from './components';
import { CanceledBookingsFullScreenModal } from './CanceledBookingsFullScreenModal';

interface CanceledBookings {
  canceled_percentage: number;
  canceled_bookings: number;
}

export function CanceledBookings() {
  const [cancelData, setCancelData] = useState<CanceledBookings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getCanceledBookings();
        setCancelData(result);
      } catch (error) {
        toast.error('Failed to load cancellation data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingCard />;

  const chartData = {
    current: [
      { name: 'Confirmed', value: 100 - (cancelData?.canceled_percentage || 0) },
      { name: 'Canceled', value: cancelData?.canceled_percentage || 0 },
    ],
    historical: [], // Empty for now; update if historical data is added
  };

  const getWarningLevel = (percentage: number) => {
    if (percentage > 15) return 'text-red-500';
    if (percentage > 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <>
      <div
        className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => setIsFullScreen(true)}
      >
        <h3 className="text-xl font-semibold text-gray-100 mb-6">Cancellation Status</h3>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex flex-col items-center mb-4">
            <span className={`text-3xl font-bold ${getWarningLevel(cancelData?.canceled_percentage || 0)}`}>
              {cancelData?.canceled_percentage.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-400">Cancellation Rate</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div
              className={`h-2 rounded-full ${getWarningLevel(cancelData?.canceled_percentage || 0)}`}
              style={{ width: `${cancelData?.canceled_percentage || 0}%` }}
            />
          </div>
          <div className="text-center">
            <span className="text-gray-400">
              {cancelData?.canceled_bookings} bookings canceled
            </span>
          </div>
        </div>
      </div>

      <CanceledBookingsFullScreenModal
        isOpen={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        data={chartData}
        title="Booking Cancellation Analysis"
      />
    </>
  );
}