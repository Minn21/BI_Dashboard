'use client';
import React, { useState, useEffect } from 'react';
import { api } from './api';
import toast from 'react-hot-toast';
import { LoadingCard } from './components';
import { TrendingUp } from 'lucide-react';
import  {ADRFullScreenModal}  from './ADRFullScreenModal';

interface ADRData {
  adr: number;
}

export function ADRDisplay() {
  const [adrData, setADRData] = useState<ADRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getOccupancyAndADR();
        setADRData({ adr: result.adr });
      } catch (error) {
        toast.error('Failed to load ADR data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingCard />;

  return (
    <>
      <div
        className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => setIsFullScreen(true)}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-100 mb-4 px-4">Average Daily Rate</h3>
        </div>
        <div className="p-4 rounded-lg bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <TrendingUp className="mr-2 text-green-500" size={24} />
              <span className="text-sm text-gray-400">Current ADR</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-500">
                ${adrData?.adr}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFullScreen && (
        <ADRFullScreenModal
          isOpen={isFullScreen}
          onClose={() => setIsFullScreen(false)}
          adr={adrData?.adr || 0}
        />
      )}
    </>
  );
}