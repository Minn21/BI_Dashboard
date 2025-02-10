'use client';
import React from 'react';
import { Users, Calendar, LogOut, AlertTriangle } from 'lucide-react';

// Import all components except those from shadcn
import ArrivalStats from '../components/ArrivalStats';
import MemberVsGeneralChart from '../components/MemberVsGeneralChart';
import OccupancyRate from '../components/OccupancyRate';
import BirthdayList from '../components/BirthdayList';
import KeyInsights from '../components/KeyInsight';

const Dashboard = () => {
  // Filter dropdown without HeadlessUI
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);
  const filters = ['All', 'Members', 'General Guests', 'Canceled'];

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
      setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-100 mb-4">
          Hotel Dashboard
        </h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Custom Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Filter by
            </button>
            {isFilterOpen && (
              <div className="absolute z-10 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search guests..."
              className="w-full px-4 py-2 bg-gray-800 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Today's Arrivals"
            value="24"
            trend="up"
            percentage={5}
            icon={<Users className="w-5 h-5 text-blue-500" />}
          />
          <MetricCard
            title="Today's Departures"
            value="18"
            trend="down"
            percentage={2}
            icon={<LogOut className="w-5 h-5 text-green-500" />}
          />
          <MetricCard
            title="Canceled Bookings"
            value="12"
            trend="down"
            percentage={8}
            icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          />
          <MetricCard
            title="Upcoming Events"
            value="5"
            trend="up"
            percentage={10}
            icon={<Calendar className="w-5 h-5 text-purple-500" />}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Full Width Charts */}
        <div className="lg:col-span-2">
          <ArrivalStats />
        </div>
        <div className="lg:col-span-1">
          <MemberVsGeneralChart />
        </div>
        
        {/* Three Column Section */}
        <div className="lg:col-span-1">
          <OccupancyRate />
        </div>
        <div className="lg:col-span-1">
          <KeyInsights />
        </div>
        <div className="lg:col-span-1">
          <BirthdayList />
        </div>
      </div>
    </div>
  );
};

// Internal MetricCard component
interface MetricCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down';
  percentage: number;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, percentage, icon }) => {
  const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';
  
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gray-700">
            {icon}
          </div>
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        </div>
        {percentage && (
          <span className={`text-sm ${trendColor}`}>
            {trend === 'up' ? '+' : '-'}{percentage}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-100">{value}</div>
      <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
        <div
          className={`h-1 rounded-full ${trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${percentage}0%` }}
        />
      </div>
    </div>
  );
};

export default Dashboard;