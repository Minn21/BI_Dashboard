'use client';
import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

// Types and Interfaces
interface LayoutProps {
  children: ReactNode;
}
interface MetricsCardProps {
  title: string;
  value: string | number;
  percentage?: number;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
}
// Loading Component
// In LoadingCard component, change bg-black to match dark theme
export function LoadingCard() {
  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg"> {/* Changed from bg-black */}
      <div className="h-5 w-24 bg-gray-700 rounded animate-pulse mb-2" />
      <div className="h-7 w-36 bg-gray-700 rounded animate-pulse" />
    </div>
  );
}

// In MetricsCard component, fix text alignment
export function MetricsCard({ title, value, percentage, trend, icon }: MetricsCardProps) {
  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-gray-800">
              {icon}
            </div>
          )}
          <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        </div>
        {percentage && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{percentage}%</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="text-3xl font-bold text-gray-100">{value}</div>
        {percentage && (
          <div className="w-full bg-gray-800 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all duration-500 ${trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(Math.abs(percentage), 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Alert Button Component
export function AlertButton() {
  const handleClick = () => {
    toast.error('High cancellation rate detected!');
  };

  return (
    <button
      onClick={handleClick}
      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
    >
      Show Alert
    </button>
  );
}

const components = {
  LoadingCard,
  MetricsCard,
  AlertButton,
};

export default components;