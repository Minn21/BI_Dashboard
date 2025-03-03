'use client';
import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { api } from './api';
import toast from 'react-hot-toast';
import { LoadingCard } from './components';

interface BookingArrivals {
  current_month_arrivals: number;
  current_year_arrivals: number;
  percentage_current_month: number;
}

export function ArrivalStats() {
  const [arrivalData, setArrivalData] = useState<BookingArrivals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getBookingArrivals();
        setArrivalData(result);
      } catch (error) {
        toast.error('Failed to load arrival data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingCard />;
  return (
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="text-xl font-semibold text-gray-100">Booking Arrivals</h3>
            </div>
            <p className="text-sm text-gray-400">Current month arrivals: {arrivalData?.current_month_arrivals}</p>
          </div>
  
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Monthly</p>
              <p className="text-lg font-semibold text-gray-200">{arrivalData?.current_month_arrivals}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Yearly</p>
              <p className="text-lg font-semibold text-blue-400">{arrivalData?.current_year_arrivals}</p>
            </div>
          </div>
        </div>
  
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="mb-4">
            <h4 className="text-gray-300 mb-2">Monthly Performance</h4>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${arrivalData?.percentage_current_month || 0}%` }}
              />
            </div>
            <p className="text-gray-400 mt-2">{arrivalData?.percentage_current_month.toFixed(1)}% of yearly arrivals</p>
          </div>
        </div>
      </div>
    );
  }