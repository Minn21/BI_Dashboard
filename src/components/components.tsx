'use client';
import React, { ReactNode, Fragment, useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Home, DollarSign, Users, Calendar, Gift, Bell, Star, Coffee, Sun, Moon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { Menu, Transition } from '@headlessui/react';
import { FullScreenChartModal } from './FullScreenChartModal';
import { format } from 'date-fns';
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

interface Insight {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}

interface ArrivalData {
  date: string;
  arrivals: number;
}

interface OccupancyADR {
  occupancy_rate: number;
  adr: number;
}

interface BookingArrivals {
  current_month_arrivals: number;
  current_year_arrivals: number;
  percentage_current_month: number;
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

// KeyInsights Component with real data
export function KeyInsights() {
  const [mostBookedUnit, setMostBookedUnit] = useState<UnitBooking | null>(null);
  const [income, setIncome] = useState<TotalIncome | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitData, incomeData] = await Promise.all([
          api.getMostBookedUnit(),
          api.getTotalIncome()
        ]);
        setMostBookedUnit(unitData);
        setIncome(incomeData);
      } catch (error) {
        toast.error('Failed to load insights data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingCard />;

  const insights = [
    {
      title: 'Most Booked Room',
      value: mostBookedUnit?.unit_id || 'N/A',
      icon: <Home className="w-5 h-5 text-blue-500" />,
      trend: `${mostBookedUnit?.booking_count || 0} bookings`
    },
    {
      title: 'Monthly Revenue',
      value: `$${income?.total_income_month.toLocaleString() || 0}`,
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
      trend: '+8% this month'
    },
    {
      title: 'Yearly Revenue',
      value: `$${income?.total_income_year.toLocaleString() || 0}`,
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      trend: 'Year to date'
    },
  ];

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-gray-100 mb-6">Key Insights</h3>
      <div className="grid gap-6">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-700/50">
                  {insight.icon}
                </div>
                <div>
                  <span className="text-sm text-gray-400 block mb-1">
                    {insight.title}
                  </span>
                  <span className="text-lg font-semibold text-gray-100">
                    {insight.value}
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-400">
                {insight.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Updated Member vs General Chart Component
export function MemberVsGeneralChart() {
  const [rawData, setRawData] = useState<MemberVsGeneralData | null>(null);
  const [chartData, setChartData] = useState<{ name: string; value: number; }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getMemberVsGeneral();
        setRawData(result);
        setChartData([
          { name: 'Members', value: result.member_arrivals },
          { name: 'General Guests', value: result.general_arrivals }
        ]);
      } catch {
        toast.error('Failed to load member data');
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

  const COLORS = ['#3B82F6', '#10B981'];

  return (
    <>
      <div
        className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => setIsFullScreen(true)}
      >
        <h3 className="text-xl font-semibold text-gray-100 mb-4 px-4">
          Member vs. General Guests
        </h3>
        <div className="text-center mb-4">
          <div className="flex justify-center gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[0] }}></div>
              <span className="text-gray-300">Members: {chartData[0]?.value || 0}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[1] }}></div>
              <span className="text-gray-300">Guests: {chartData[1]?.value || 0}</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50}
              paddingAngle={5}
              stroke="none"
            >
              {chartData.map((_, index) => (
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
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {isFullScreen && (
        <FullScreenChartModal
          isOpen={isFullScreen}
          onClose={() => setIsFullScreen(false)}
          chartType="memberVsGeneral"
          data={chartData}
          title="Member vs. General Guests Analysis"
        />
      )}
    </>
  );
}

// Updated OccupancyRate Component
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

  const chartData = [
    { name: 'Occupied', value: occupancyData?.occupancy_rate || 0 },
    { name: 'Available', value: 100 - (occupancyData?.occupancy_rate || 0) }
  ];

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

      {isFullScreen && (
        <FullScreenChartModal
          isOpen={isFullScreen}
          onClose={() => setIsFullScreen(false)}
          chartType="occupancy"
          data={chartData}
          title="Room Occupancy Analysis"
        />
      )}
    </>
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

// Search Bar Component
export function SearchBar() {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search guests..."
        className="w-full p-2 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
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

// ArrivalStats Component with real data
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


// New Coffee Break Timer Component
export function CoffeeBreakTimer() {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      toast.success('Coffee break is over!');
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleClick = () => {
    if (timeLeft === 0) {
      setTimeLeft(300);
    }
    setIsRunning(!isRunning);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Coffee className="w-6 h-6 text-brown-400" />
        <h3 className="text-xl font-semibold text-gray-100">Coffee Break Timer</h3>
      </div>
      <div className="text-3xl font-bold text-gray-100 mb-4">
        {`${minutes}:${seconds.toString().padStart(2, '0')}`}
      </div>
      <button
        onClick={handleClick}
        className={`w-full py-2 rounded-lg ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
      >
        {isRunning ? 'Pause Break' : timeLeft === 0 ? 'Start New Break' : 'Start Break'}
      </button>
    </div>
  );
}

// Filter Dropdown Component
export function FilterDropdown() {
  const filters = ['All', 'Members', 'General Guests', 'Canceled'];
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="bg-gray p-2 rounded-lg shadow-sm border border-gray-200">
        Filter by
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
          {filters.map((filter) => (
            <Menu.Item key={filter}>
              {({ active }) => (
                <button
                  className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-black-700`}
                >
                  {filter}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
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

// Updated CanceledBookings Component
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

  const chartData = [
    { name: 'Confirmed', value: 100 - (cancelData?.canceled_percentage || 0) },
    { name: 'Canceled', value: cancelData?.canceled_percentage || 0 }
  ];

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

      {isFullScreen && (
        <FullScreenChartModal
          isOpen={isFullScreen}
          onClose={() => setIsFullScreen(false)}
          chartType="canceledBookings"
          data={chartData}
          title="Booking Cancellation Analysis"
        />
      )}
    </>
  );
}

const components = {
  DashboardLayout,
  LoadingCard,
  MetricsCard,
  KeyInsights,
  MemberVsGeneralChart,
  AgeGroupSegmentation,
  OccupancyRate,
  ProgressBar,
  SearchBar,
  AlertButton,
  ArrivalStats,
  //BirthdayList,
  FilterDropdown,
  TodayStatus,
  CoffeeBreakTimer,
  CanceledBookings
};

export default components;