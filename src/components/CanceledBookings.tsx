'use client';
import React, { useState, useEffect } from 'react';
import { api } from './api';
import toast from 'react-hot-toast';
import { AlertTriangle, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { CanceledBookingsFullScreenModal } from './CanceledBookingsFullScreenModal';

interface CanceledBookings {
  canceled_percentage: number;
  canceled_bookings: number;
  previous_period?: number;
  last_updated?: string;
}

export function CanceledBookings() {
  const [cancelData, setCancelData] = useState<CanceledBookings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getCanceledBookings();
        setCancelData({
          ...result,
          last_updated: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
      } catch (error) {
        toast.error('Failed to load cancellation data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getWarningLevel = (percentage: number) => {
    if (percentage > 15) return 'bg-red-500/20 text-red-400';
    if (percentage > 10) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-green-500/20 text-green-400';
  };

  if (loading) {
    return (
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg animate-pulse">
        <div className="h-6 w-40 bg-gray-800 rounded mb-4" />
        <div className="space-y-4">
          <div className="h-8 w-24 bg-gray-800 rounded mx-auto" />
          <div className="h-3 w-48 bg-gray-800 rounded mx-auto" />
          <div className="h-2 bg-gray-800 rounded-full" />
          <div className="h-4 w-32 bg-gray-800 rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-gray-700 relative"
        onClick={() => setIsFullScreen(true)}
        role="button"
        aria-label="View cancellation details"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Cancellation Status
            </h3>
            {cancelData?.last_updated && (
              <p className="text-xs text-gray-400 mt-1">
                Updated: {cancelData.last_updated}
              </p>
            )}
          </div>
          <span className="text-gray-400 hover:text-gray-300 p-2 rounded-lg bg-gray-800">
            <ArrowUpRight className="w-5 h-5" />
          </span>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${getWarningLevel(cancelData?.canceled_percentage || 0)}`}>
              <span className="text-3xl font-bold">
                {cancelData?.canceled_percentage.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Cancellation Rate</p>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-gray-800 rounded-full h-3 relative overflow-hidden">
              <div 
                className="absolute h-3 bg-gradient-to-r from-red-500 to-red-400" 
                style={{ width: `${cancelData?.canceled_percentage || 0}%` }}
              />
              <div 
                className="absolute h-3 bg-gradient-to-r from-green-500 to-green-400" 
                style={{ width: `${100 - (cancelData?.canceled_percentage || 0)}%`, right: 0 }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-400">
                Confirmed: {100 - (cancelData?.canceled_percentage || 0)}%
              </span>
              <span className="text-red-400">
                Canceled: {cancelData?.canceled_percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-red-400">
                {cancelData?.canceled_bookings}
              </p>
              <p className="text-xs text-gray-400">Total Cancellations</p>
            </div>
            {cancelData?.previous_period && (
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-1">
                  {cancelData.canceled_percentage > cancelData.previous_period ? (
                    <TrendingUp className="w-4 h-4 text-red-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-400" />
                  )}
                  <p className="text-sm font-semibold">
                    {Math.abs(cancelData.canceled_percentage - cancelData.previous_period).toFixed(1)}%
                  </p>
                </div>
                <p className="text-xs text-gray-400">vs Previous Period</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CanceledBookingsFullScreenModal
        isOpen={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        data={{
          current: [
            { name: 'Confirmed', value: 100 - (cancelData?.canceled_percentage || 0) },
            { name: 'Canceled', value: cancelData?.canceled_percentage || 0 },
          ],
          historical: []
        }}
        title="Booking Cancellation Analysis"
      />
    </>
  );
}