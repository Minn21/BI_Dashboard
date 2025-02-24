'using client';
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

interface GuestBirthday {
    name: string;
    birthday: string;
}

interface ArrivalData {
    date: string;
    arrivals: number;
}

interface OccupancyADR {
    occupancy_rate: number;
    adr: number;
}

// Layout Component
export function DashboardLayout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Hotel Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
        </div>
    );
}

// Loading Component
export function LoadingCard() {
    return (
        <div className="bg-black p-6 rounded-xl shadow-lg">
            <div className="h-5 w-24 bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-7 w-36 bg-gray-700 rounded animate-pulse" />
        </div>
    );
}

// Metrics Card Component
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
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
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
                            className={`h-1 rounded-full transition-all duration-500 ${trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${Math.min(Math.abs(percentage), 100)}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// Key Insights Component
export function KeyInsights() {
    const insights: Insight[] = [
        {
            title: 'Most Booked Room',
            value: 'Suite 301',
            icon: <Home className="w-5 h-5 text-blue-500" />,
            trend: '+15% bookings'
        },
        {
            title: 'Highest Revenue',
            value: '$5,000',
            icon: <DollarSign className="w-5 h-5 text-green-500" />,
            trend: '+8% this month'
        },
        {
            title: 'Lowest Occupancy',
            value: 'Deluxe 102',
            icon: <TrendingUp className="w-5 h-5 text-red-500" />,
            trend: '-5% occupancy'
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
                            {insight.trend && (
                                <span className={`text-sm ${insight.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {insight.trend}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MemberVsGeneralChart() {
    const [data, setData] = useState<{ name: string; value: number; }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await api.getMemberVsGeneral();
                setData([
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

    if (loading) return <LoadingCard />;

    const COLORS = ['#3B82F6', '#10B981'];

    // Function to handle Gemini analysis
    const handleAnalyzeWithGemini = () => {
        toast.success('Analyzing with Gemini...');
        // Add your Gemini analysis logic here
    };

    return (
        <>
            <div
                className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => setIsFullScreen(true)}
            >
                <h3 className="text-xl font-semibold text-gray-100 mb-4">
                    Member vs. General Guests
                </h3>
                <div className="text-center mb-4">
                    <div className="flex justify-center gap-6">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[0] }}></div>
                            <span className="text-gray-300">Members: {data[0].value}%</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[1] }}></div>
                            <span className="text-gray-300">Guests: {data[1].value}%</span>
                        </div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={50}
                            paddingAngle={5}
                            stroke="none"
                        >
                            {data.map((_, index) => (
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
                    data={data}
                    onClose={() => setIsFullScreen(false)}
                    onAnalyzeWithGemini={handleAnalyzeWithGemini} // Pass the Gemini analysis function
                />
            )}
        </>
    );
}

// Update OccupancyRate to use real data
export function OccupancyRate() {
    const [occupancyData, setOccupancyData] = useState<OccupancyADR | null>(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-100">Occupancy & ADR</h3>
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

// Arrival Stats Component
export function ArrivalStats() {
    const data: ArrivalData[] = [
        { date: '2023-10-01', arrivals: 24 },
        { date: '2023-10-02', arrivals: 30 },
        { date: '2023-10-03', arrivals: 18 },
        { date: '2023-10-04', arrivals: 42 },
        { date: '2023-10-05', arrivals: 36 },
    ];

    const averageArrivals = Math.round(data.reduce((acc, curr) => acc + curr.arrivals, 0) / data.length);

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                    <p className="font-semibold text-gray-200">{label ? format(new Date(label), 'MMM dd') : 'N/A'}</p>
                    <p className="text-sm text-gray-400 mt-1">
                        <span className="font-medium text-blue-400">{payload[0].value}</span> arrivals
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-2">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <h3 className="text-xl font-semibold text-gray-100">Booking Arrivals</h3>
                    </div>
                    <p className="text-sm text-gray-400">Daily arrivals for the current month</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Average</p>
                        <p className="text-lg font-semibold text-gray-200">{averageArrivals}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Target</p>
                        <p className="text-lg font-semibold text-red-400">30</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                            stroke="#9CA3AF"
                            tick={{ fill: '#9CA3AF' }}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            tick={{ fill: '#9CA3AF' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            formatter={(value) => <span className="text-gray-400">{value}</span>}
                        />
                        <ReferenceLine
                            y={30}
                            stroke="#EF4444"
                            strokeDasharray="4 4"
                            label={{ value: "Target", fill: "#EF4444", position: "right" }}
                        />
                        <Bar
                            dataKey="arrivals"
                            name="Daily Arrivals"
                            radius={[4, 4, 0, 0]}
                            fill="#3B82F6"
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// Update BirthdayList to use real data
export function BirthdayList() {
    const [birthdays, setBirthdays] = useState<GuestBirthday[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await api.getGuestBirthdays();
                setBirthdays(result);
            } catch (error) {
                toast.error('Failed to load birthday data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <LoadingCard />;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Your existing JSX with the new data */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-700">
                            <th className="pb-3 font-medium">Guest</th>
                            <th className="pb-3 font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {birthdays.map((guest, index) => (
                            <tr key={index} className="border-b border-gray-800">
                                <td className="py-4">
                                    <span className="text-gray-100">{guest.name}</span>
                                </td>
                                <td className="py-4">
                                    <span className="text-gray-300">
                                        {formatDate(guest.birthday)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// New Notification Bell Component
export function NotificationBell() {
    const [count, setCount] = useState(3);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        setIsAnimating(true);
        toast.success('Notifications cleared!');
        setCount(0);
        setTimeout(() => setIsAnimating(false), 500);
    };

    return (
        <button
            onClick={handleClick}
            className="relative p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
            <Bell className={`w-6 h-6 text-gray-300 ${isAnimating ? 'animate-shake' : ''}`} />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                    {count}
                </span>
            )}
        </button>
    );
}

// New Guest Satisfaction Component
export function GuestSatisfaction() {
    const [rating, setRating] = useState(4.5);
    const maxStars = 5;

    return (
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Guest Satisfaction</h3>
            <div className="flex items-center gap-2 mb-4">
                {[...Array(maxStars)].map((_, index) => (
                    <Star
                        key={index}
                        className={`w-8 h-8 cursor-pointer transition-colors ${index < rating ? 'text-yellow-400 animate-pulse' : 'text-gray-600'
                            }`}
                        onClick={() => setRating(index + 1)}
                    />
                ))}
            </div>
            <p className="text-gray-400">{rating.toFixed(1)} out of 5</p>
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
                className={`w-full py-2 rounded-lg ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    } text-white transition-colors`}
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
                                    className={`${active ? 'bg-gray-100' : ''
                                        } block w-full text-left px-4 py-2 text-sm text-black-700`}
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

const components = {
    DashboardLayout,
    LoadingCard,
    MetricsCard,
    KeyInsights,
    MemberVsGeneralChart,
    OccupancyRate,
    ProgressBar,
    SearchBar,
    AlertButton,
    ArrivalStats,
    BirthdayList,
    FilterDropdown,
    NotificationBell,
    GuestSatisfaction,
    CoffeeBreakTimer,
    FullScreenChartModal, 
};

export default components;