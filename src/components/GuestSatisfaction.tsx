import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown, Award, BarChart3, UserCheck, Calendar } from 'lucide-react';

// Define interfaces for our data types
interface RatingBreakdown {
    stars: number;
    percentage: number;
    count: number;
}

interface SatisfactionMetric {
    name: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
    percentChange: number;
}

export function GuestSatisfaction() {
    // Current overall rating state
    const [rating, setRating] = useState(4.3);
    const [isHovering, setIsHovering] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'details'>('overview');

    // Historical ratings data for trend analysis
    const [ratingHistory, setRatingHistory] = useState([
        { date: '2023-01', value: 4.1 },
        { date: '2023-02', value: 4.0 },
        { date: '2023-03', value: 4.2 },
        { date: '2023-04', value: 4.3 },
        { date: '2023-05', value: 4.1 },
        { date: '2023-06', value: 4.4 },
    ]);

    // Detailed breakdown of ratings
    const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown[]>([
        { stars: 5, percentage: 52, count: 520 },
        { stars: 4, percentage: 30, count: 300 },
        { stars: 3, percentage: 12, count: 120 },
        { stars: 2, percentage: 4, count: 40 },
        { stars: 1, percentage: 2, count: 20 },
    ]);

    // Key satisfaction metrics
    const [metrics, setMetrics] = useState<SatisfactionMetric[]>([
        { name: 'Service', value: 4.5, trend: 'up', percentChange: 5.2 },
        { name: 'Cleanliness', value: 4.7, trend: 'up', percentChange: 2.1 },
        { name: 'Amenities', value: 4.0, trend: 'down', percentChange: 1.8 },
        { name: 'Value', value: 3.9, trend: 'stable', percentChange: 0.3 },
    ]);

    // Animation frame state for the pulsing effect
    const [pulseState, setPulseState] = useState(0);

    // Simulate loading new data periodically
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly adjust metrics slightly for demo purposes
            setMetrics(prevMetrics =>
                prevMetrics.map(metric => {
                    const changeDirections = ['up', 'down', 'stable'] as const;
                    const randomTrend = changeDirections[Math.floor(Math.random() * 3)];
                    const randomChange = +(Math.random() * 2).toFixed(1);

                    return {
                        ...metric,
                        trend: randomTrend,
                        percentChange: randomChange
                    };
                })
            );

            // Add a new historical data point occasionally
            if (Math.random() > 0.7) {
                const lastDate = new Date(ratingHistory[ratingHistory.length - 1].date + '-01');
                const nextMonth = new Date(lastDate);
                nextMonth.setMonth(nextMonth.getMonth() + 1);

                const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
                const randomValue = +(4 + Math.random() * 0.8).toFixed(1); // Random value between 4.0 and 4.8

                setRatingHistory(prev => [...prev, { date: nextMonthStr, value: randomValue }]);
            }
        }, 15000); // Update every 15 seconds

        return () => clearInterval(interval);
    }, [ratingHistory]);

    // Create pulsing animation for stars
    useEffect(() => {
        const animationInterval = setInterval(() => {
            setPulseState(prev => (prev + 1) % 100);
        }, 50);

        return () => clearInterval(animationInterval);
    }, []);

    const handleStarHover = (index: number) => {
        setIsHovering(true);
        setHoverRating(index + 1);
    };

    const handleStarLeave = () => {
        setIsHovering(false);
        setHoverRating(0);
    };

    const handleStarClick = (index: number) => {
        const newRating = index + 1;
        setRating(newRating);

        // Update the rating breakdown data
        const newBreakdown = [...ratingBreakdown];
        const targetIndex = ratingBreakdown.findIndex(item => item.stars === newRating);

        if (targetIndex !== -1) {
            newBreakdown[targetIndex] = {
                ...newBreakdown[targetIndex],
                count: newBreakdown[targetIndex].count + 1
            };

            // Recalculate percentages
            const totalCount = newBreakdown.reduce((sum, item) => sum + item.count, 0);
            const updatedBreakdown = newBreakdown.map(item => ({
                ...item,
                percentage: Math.round((item.count / totalCount) * 100)
            }));

            setRatingBreakdown(updatedBreakdown);
        }
    };

    // Calculate trend from history
    const calculateTrend = () => {
        if (ratingHistory.length < 2) return { direction: 'stable', value: 0 };

        const lastValue = ratingHistory[ratingHistory.length - 1].value;
        const previousValue = ratingHistory[ratingHistory.length - 2].value;
        const difference = lastValue - previousValue;
        const percentChange = (difference / previousValue) * 100;

        return {
            direction: difference > 0.05 ? 'up' : difference < -0.05 ? 'down' : 'stable',
            value: +percentChange.toFixed(1)
        };
    };

    const trend = calculateTrend();

    // Render the specific star based on rating and hover state
    const renderStar = (index: number) => {
        const displayRating = isHovering ? hoverRating : rating;
        const isActive = index < Math.floor(displayRating);
        const isHalf = index === Math.floor(displayRating) && displayRating % 1 > 0;

        // Calculate pulse intensity based on index and pulse state
        const shouldPulse = isActive && pulseState % (10 + index * 5) === 0;

        return (
            <div
                key={index}
                className="relative"
                onMouseEnter={() => handleStarHover(index)}
                onMouseLeave={handleStarLeave}
                onClick={() => handleStarClick(index)}
            >
                <Star
                    className={`w-8 h-8 cursor-pointer stroke-1 transition-all duration-300 ${isActive
                            ? `text-yellow-400 ${shouldPulse ? 'scale-110' : ''}`
                            : 'text-gray-600'
                        }`}
                    fill={isActive ? "#F6C02F" : isHalf ? "linear-gradient(to right, #F6C02F 50%, transparent 50%)" : "none"}
                />

                {/* Half star overlay */}
                {isHalf && (
                    <div className="absolute inset-0 overflow-hidden w-1/2 pointer-events-none">
                        <Star className="w-8 h-8 text-yellow-400" fill="#F6C02F" />
                    </div>
                )}
            </div>
        );
    };

    // Updated GuestSatisfaction component container
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-700/30 transition-all hover:shadow-2xl">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700/50 mb-4">
                <button
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'overview'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'trends'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                    onClick={() => setActiveTab('trends')}
                >
                    Trends
                </button>
                <button
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'details'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                    onClick={() => setActiveTab('details')}
                >
                    Details
                </button>
            </div>

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
                <>
                    {/* Header with title and current rating */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-100">Guest Satisfaction</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-100">{rating.toFixed(1)}</span>
                            {trend.direction === 'up' && (
                                <TrendingUp className="w-5 h-5 text-green-400" />
                            )}
                            {trend.direction === 'down' && (
                                <TrendingDown className="w-5 h-5 text-red-400" />
                            )}
                        </div>
                    </div>

                    {/* Star Rating Display */}
                    <div className="flex items-center gap-2 mb-6">
                        {[...Array(5)].map((_, index) => renderStar(index))}
                         {/*<span className="ml-3 text-gray-400 text-sm">
                            Based on {ratingBreakdown.reduce((sum, item) => sum + item.count, 0)} reviews
                        </span>*/}
                    </div>

                    {/* Updated Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {metrics.map((metric) => (
                            <div key={metric.name} className="bg-gray-900/30 p-3 rounded-xl">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-400 text-sm">{metric.name}</span>
                                    <div className="flex items-center gap-1">
                                        {metric.trend === 'up' && (
                                            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                                        )}
                                        {metric.trend === 'down' && (
                                            <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                                        )}
                                        <span
                                            className={`text-xs ${metric.trend === 'up'
                                                    ? 'text-green-400'
                                                    : metric.trend === 'down'
                                                        ? 'text-red-400'
                                                        : 'text-gray-400'
                                                }`}
                                        >
                                            <span className="text-xs font-medium">+{metric.percentChange}%</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-gray-100">
                                        {metric.value.toFixed(1)}
                                    </span>
                                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                            style={{ width: `${(metric.value / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Updated Achievements Section */}
                    <div className="bg-gray-900/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Award className="w-5 h-5 text-yellow-400" />
                            <h4 className="text-gray-200 font-medium">Recent Achievements</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded-full flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
                                Service Score +5%
                            </span>
                            <span className="bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded-full flex items-center">
                                <UserCheck className="w-3 h-3 mr-1 text-blue-400" />
                                95% Return Rate
                            </span>
                            <span className="bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded-full flex items-center">
                                <Award className="w-3 h-3 mr-1 text-yellow-400" />
                                Top 10% in Region
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* Trends Tab Content */}
            {activeTab === 'trends' && (
                <>
                    <h3 className="text-xl font-semibold text-gray-100 mb-4">Rating Trends</h3>

                    {/* Simple visual chart of historical ratings */}
                    <div className="relative h-40 mb-6">
                        {ratingHistory.map((point, index) => {
                            const x = (index / (ratingHistory.length - 1)) * 100;
                            // Scale the y-axis to show variations more clearly (from 3.5 to 5.0)
                            const y = 100 - ((point.value - 3.5) / 1.5) * 100;
                            const isLast = index === ratingHistory.length - 1;

                            return (
                                <React.Fragment key={point.date}>
                                    {/* Data point */}
                                    <div
                                        className={`absolute w-3 h-3 rounded-full ${isLast ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'
                                            }`}
                                        style={{
                                            left: `${x}%`,
                                            top: `${y}%`,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    />

                                    {/* Connecting line (except for first point) */}
                                    {index > 0 && (
                                        <div
                                            className="absolute h-px bg-gray-700"
                                            style={{
                                                left: `${(index - 1) / (ratingHistory.length - 1) * 100}%`,
                                                top: `${100 - ((ratingHistory[index - 1].value - 3.5) / 1.5) * 100}%`,
                                                width: `${(1 / (ratingHistory.length - 1)) * 100}%`,
                                                transform: `rotate(${Math.atan2(
                                                    (ratingHistory[index - 1].value - point.value) * 100 / 1.5,
                                                    (1 / (ratingHistory.length - 1)) * 100
                                                )}rad)`,
                                                transformOrigin: '0 50%'
                                            }}
                                        />
                                    )}

                                    {/* Month label (show every other month) */}
                                    {index % 2 === 0 && (
                                        <div
                                            className="absolute text-xs text-gray-500"
                                            style={{
                                                left: `${x}%`,
                                                top: '100%',
                                                transform: 'translateX(-50%)'
                                            }}
                                        >
                                            {point.date.split('-')[1]}
                                        </div>
                                    )}

                                    {/* Last point label */}
                                    {isLast && (
                                        <div
                                            className="absolute text-sm font-bold text-blue-400 bg-gray-900 px-1 rounded"
                                            style={{
                                                left: `${x + 2}%`,
                                                top: `${y}%`,
                                                transform: 'translateY(-50%)'
                                            }}
                                        >
                                            {point.value.toFixed(1)}
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}

                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                            <span>5.0</span>
                            <span>4.5</span>
                            <span>4.0</span>
                            <span>3.5</span>
                        </div>

                        {/* Y-axis grid lines */}
                        {[3.5, 4.0, 4.5, 5.0].map(value => {
                            const y = 100 - ((value - 3.5) / 1.5) * 100;
                            return (
                                <div
                                    key={value}
                                    className="absolute left-0 right-0 h-px bg-gray-800"
                                    style={{ top: `${y}%` }}
                                />
                            );
                        })}
                    </div>

                    {/* Trend Summary */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                            <h4 className="text-gray-200 font-medium">Trend Analysis</h4>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">
                            Overall satisfaction has {trend.direction === 'up' ? 'increased' : trend.direction === 'down' ? 'decreased' : 'remained stable'} by {Math.abs(trend.value)}% over the last period.
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${trend.direction === 'up' ? 'bg-green-500' : trend.direction === 'down' ? 'bg-red-500' : 'bg-gray-500'}`} />
                                <span className="text-xs text-gray-300">Overall Trend</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-300">Last 6 Months</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-700 pt-2">
                            <span>Starting: {ratingHistory[0].value.toFixed(1)}</span>
                            <span>Current: {rating.toFixed(1)}</span>
                            <span>Change: {(rating - ratingHistory[0].value).toFixed(1)}</span>
                        </div>
                    </div>
                </>
            )}

            {/* Details Tab Content */}
            {activeTab === 'details' && (
                <>
                    <h3 className="text-xl font-semibold text-gray-100 mb-4">Rating Breakdown</h3>

                    {/* Detailed breakdown of ratings by star level */}
                    {ratingBreakdown.map(item => (
                        <div key={item.stars} className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex items-center">
                                    {item.stars} <Star className="w-4 h-4 ml-1 text-yellow-400" fill={item.stars > 0 ? "#F6C02F" : "none"} />
                                </div>
                                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.stars > 3
                                                ? 'bg-green-500'
                                                : item.stars > 1
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                            }`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                                <div className="min-w-16 text-right">
                                    <span className="text-sm text-gray-300">{item.percentage}%</span>
                                    <span className="text-xs text-gray-500 ml-1">({item.count})</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Recent reviews */}
                    <h4 className="text-lg font-medium text-gray-200 mt-6 mb-3">Recent Reviews</h4>

                    <div className="space-y-4">
                        {/* Example reviews */}
                        <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-300">John D.</span>
                                        <span className="text-xs text-gray-500 ml-2">3 days ago</span>
                                    </div>
                                    <div className="flex mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className="w-4 h-4 text-yellow-400"
                                                fill={i < 5 ? "#F6C02F" : "none"}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                                    Verified Stay
                                </span>
                            </div>
                            <p className="text-sm text-gray-400">
                                "Exceptional service and beautiful accommodations. The staff went above and beyond to make our stay memorable. Will definitely return!"
                            </p>
                        </div>

                        <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-300">Sarah M.</span>
                                        <span className="text-xs text-gray-500 ml-2">1 week ago</span>
                                    </div>
                                    <div className="flex mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className="w-4 h-4 text-yellow-400"
                                                fill={i < 4 ? "#F6C02F" : "none"}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                                    Verified Stay
                                </span>
                            </div>
                            <p className="text-sm text-gray-400">
                                "Great location and comfortable rooms. The breakfast was amazing though I found the amenities to be slightly lacking compared to similar hotels in this price range."
                            </p>
                        </div>

                        <div className="bg-gray-800 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-300">Michael T.</span>
                                        <span className="text-xs text-gray-500 ml-2">2 weeks ago</span>
                                    </div>
                                    <div className="flex mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className="w-4 h-4 text-yellow-400"
                                                fill={i < 3 ? "#F6C02F" : "none"}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                                    Verified Stay
                                </span>
                            </div>
                            <p className="text-sm text-gray-400">
                                "Room cleanliness could be improved. Staff was friendly but seemed understaffed during peak hours. Location is convenient for business travelers."
                            </p>
                        </div>
                    </div>

                    {/* Response Rate Stats */}
                    <div className="bg-gray-800/50 mt-6 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Management Response</h4>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-2xl font-bold text-gray-200">87%</span>
                                <span className="text-xs text-gray-400 ml-1">response rate</span>
                            </div>
                            <div>
                                <span className="text-gray-300 text-sm font-medium">12hr</span>
                                <span className="text-xs text-gray-400 ml-1">avg. response time</span>
                            </div>
                            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                View All Reviews
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}