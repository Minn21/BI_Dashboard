'use client';
import React, { ReactNode, Fragment, useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Home, DollarSign, Users, Calendar, Gift, Bell, Star, Coffee, Sun, Moon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { Menu, Transition } from '@headlessui/react';
import { FullScreenChartModal } from './FullScreenChartModal';
import { api } from './api';
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

interface UnitBooking {
  unit_id: string;
  booking_count: number;
}

interface TotalIncome {
  total_income_month: number;
  total_income_year: number;
}

interface TodayStatus {
  today_arrivals: number;
  today_departures: number;
}

interface AgeGroups {
  child: number;
  adult: number;
  middle_age: number;
  elder: number;
}

interface CanceledBookings {
  canceled_percentage: number;
  canceled_bookings: number;
}

interface MemberVsGeneralData {
  member_arrivals: number;
  general_arrivals: number;
}

// Update DashboardLayout grid spacing
export function DashboardLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8"> {/* Responsive padding */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8">
        Hotel Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {children}
      </div>
    </div>
  );
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

// Progress Bar Component
export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-500 h-2 rounded-full"
        style={{ width: `${value}%` }}
      ></div>
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

// Updated Age Group Segmentation Component
export function AgeGroupSegmentation() {
  const [ageData, setAgeData] = useState<AgeGroups | null>(null);
  const [chartData, setChartData] = useState<{ name: string; value: number; additionalContext?: string; }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getAgeGroups();
        setAgeData(result);
        setChartData([
          { name: 'Child', value: result.child, additionalContext: 'Ages 0-17' },
          { name: 'Adult', value: result.adult, additionalContext: 'Ages 18-35' },
          { name: 'Middle Age', value: result.middle_age, additionalContext: 'Ages 36-60' },
          { name: 'Elder', value: result.elder, additionalContext: 'Ages 61+' }
        ]);
      } catch (error) {
        toast.error('Failed to load age group data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="bg-black p-6 rounded-xl shadow-lg">
      <div className="h-5 w-24 bg-gray-700 rounded animate-pulse mb-2" />
      <div className="h-7 w-36 bg-gray-700 rounded animate-pulse" />
    </div>
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  const totalGuests = ageData ? ageData.child + ageData.adult + ageData.middle_age + ageData.elder : 0;

  return (
    <>
      <div
        className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => setIsFullScreen(true)}
      >
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Guest Age Groups</h3>
        <div className="text-center mb-4">
          <p className="text-gray-400">Total guests: {totalGuests}</p>
        </div>
        
        <div className="flex justify-center gap-4 mb-4 flex-wrap">
          {chartData.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span className="text-gray-300">{entry.name}: {entry.value}</span>
            </div>
          ))}
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              paddingAngle={3}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity duration-300"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem',
              }}
              itemStyle={{ color: '#E5E7EB' }}
              formatter={(value: number) => [`${value} guests (${((value / totalGuests) * 100).toFixed(1)}%)`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {isFullScreen && (
        <FullScreenChartModal
          isOpen={isFullScreen}
          onClose={() => setIsFullScreen(false)}
          chartType="ageGroups"
          data={chartData}
          title="Guest Age Demographics Analysis"
        />
      )}
    </>
  );
}

const components = {
  DashboardLayout,
  LoadingCard,
  MetricsCard,
  AgeGroupSegmentation,
  ProgressBar,
  AlertButton,
  TodayStatus,
};

export default components;