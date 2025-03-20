'use client';
import React, { useState, useEffect } from 'react';
import { api } from './api';
import toast from 'react-hot-toast';
import { TrendingUp, ArrowUpRight, Info } from 'lucide-react';
import { ADRFullScreenModal } from './ADRFullScreenModal';

interface ADRData {
  adr: number;
  trend?: number;
  lastUpdated?: string;
}

export function ADRDisplay() {
  const [adrData, setADRData] = useState<ADRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getOccupancyAndADR();
        setADRData({ 
          adr: result.adr,
          lastUpdated: new Date().toLocaleDateString()
        });
      } catch (error) {
        toast.error('Failed to load ADR data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg animate-pulse">
        <div className="h-6 w-40 bg-gray-800 rounded mb-4" />
        <div className="space-y-4">
          <div className="h-4 w-32 bg-gray-800 rounded" />
          <div className="h-8 w-24 bg-gray-800 rounded" />
          <div className="h-3 w-48 bg-gray-800 rounded" />
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
        aria-label="View detailed ADR analysis"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
              Average Daily Rate
              <Info className="w-4 h-4 text-gray-400 hover:text-gray-300" />
            </h3>
            {adrData?.lastUpdated && (
              <p className="text-xs text-gray-400 mt-1">
                Updated: {adrData.lastUpdated}
              </p>
            )}
          </div>
          <span className="text-gray-400 hover:text-gray-300 p-2 rounded-lg bg-gray-800">
            <ArrowUpRight className="w-5 h-5" />
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Current ADR</p>
                <p className="text-2xl font-bold text-green-400">
                  ${adrData?.adr?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {adrData?.trend && (
            <div className="flex items-center gap-2 text-sm px-4 py-2 bg-gray-800 rounded-lg">
              <span className={`${adrData.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {adrData.trend > 0 ? '+' : ''}{adrData.trend}%
              </span>
              <span className="text-gray-400">vs previous period</span>
            </div>
          )}
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