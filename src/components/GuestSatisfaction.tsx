import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Star, TrendingUp, TrendingDown, Award, BarChart3, UserCheck, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

interface HistoricalRating {
  date: string;
  value: number;
}

interface Review {
  user: string;
  date: string;
  rating: number;
  comment: string;
  verified: boolean;
}

export function GuestSatisfaction() {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'details'>('overview');
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  // Data states
  const [rating, setRating] = useState(4.3);
  const [ratingHistory, setRatingHistory] = useState<HistoricalRating[]>([]);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown[]>([]);
  const [metrics, setMetrics] = useState<SatisfactionMetric[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Memoized trend calculation
  const trend = useMemo(() => {
    if (ratingHistory.length < 2) return { direction: 'stable', value: 0 };
    
    const last = ratingHistory[ratingHistory.length - 1].value;
    const prev = ratingHistory[ratingHistory.length - 2].value;
    const diff = last - prev;
    const percent = (diff / prev) * 100;

    return {
      direction: diff > 0.05 ? 'up' : diff < -0.05 ? 'down' : 'stable',
      value: +percent.toFixed(1)
    };
  }, [ratingHistory]);

  // Generate initial data
  useEffect(() => {
    // Initialize with mock data
    const initialHistory = Array.from({ length: 6 }, (_, i) => ({
      date: `2023-0${i + 1}`,
      value: +(4 + Math.random() * 0.5).toFixed(1)
    }));
    
    const initialBreakdown = [5,4,3,2,1].map(stars => ({
      stars,
      percentage: Math.floor(Math.random() * (50 - 5 * stars) + 10),
      count: Math.floor(Math.random() * 500 + 50)
    })).sort((a,b) => b.stars - a.stars);

    setRatingHistory(initialHistory);
    setRatingBreakdown(initialBreakdown);
    
    setMetrics([
      { name: 'Service', value: 4.5, trend: 'up', percentChange: 5.2 },
      { name: 'Cleanliness', value: 4.7, trend: 'up', percentChange: 2.1 },
      { name: 'Amenities', value: 4.0, trend: 'down', percentChange: 1.8 },
      { name: 'Value', value: 3.9, trend: 'stable', percentChange: 0.3 },
    ]);

    setReviews([
      { user: 'John D.', date: '3 days ago', rating: 5, verified: true,
        comment: 'Exceptional service and beautiful accommodations. The staff went above and beyond!' },
      { user: 'Sarah M.', date: '1 week ago', rating: 4, verified: true,
        comment: 'Great location and comfortable rooms. Breakfast was amazing!' },
      { user: 'Michael T.', date: '2 weeks ago', rating: 3, verified: true,
        comment: 'Room cleanliness could be improved. Staff was friendly but seemed understaffed.' },
    ]);
  }, []);

  const handleStarInteraction = useCallback((index: number) => {
    const newRating = index + 1;
    setRating(newRating);
    
    setRatingBreakdown(prev => prev.map(item => 
      item.stars === newRating 
        ? { ...item, count: item.count + 1 } 
        : item
    ));
  }, []);

  const renderStar = useCallback((index: number) => {
    const displayRating = isHovering ? hoverRating : rating;
    const filled = index < Math.floor(displayRating);
    const partial = index === Math.floor(displayRating) && displayRating % 1 > 0;

    return (
      <button
        key={index}
        className="relative group transition-transform duration-150 hover:scale-110"
        onMouseEnter={() => {
          setIsHovering(true);
          setHoverRating(index + 1);
        }}
        onMouseLeave={() => {
          setIsHovering(false);
          setHoverRating(0);
        }}
        onClick={() => handleStarInteraction(index)}
        aria-label={`Rate ${index + 1} stars`}
      >
        <Star
          className={`w-8 h-8 stroke-1 ${
            filled ? 'text-yellow-400 fill-yellow-400' : 
            partial ? 'text-yellow-400 fill-yellow-400/50' : 
            'text-gray-600 fill-transparent'
          }`}
        />
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Star className="w-8 h-8 text-yellow-200/30 fill-transparent" />
        </span>
      </button>
    );
  }, [isHovering, hoverRating, rating, handleStarInteraction]);

  const TabButton: React.FC<{
    tab: typeof activeTab;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ tab, icon, children }) => (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === tab 
          ? 'bg-gray-700/50 text-blue-400' 
          : 'text-gray-400 hover:bg-gray-700/30'
      }`}
      onClick={() => setActiveTab(tab)}
    >
      {icon}
      <span className="text-sm font-medium">{children}</span>
    </button>
  );

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-700/30 transition-all hover:shadow-2xl">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <TabButton tab="overview" icon={<Award className="w-5 h-5" />}>
          Overview
        </TabButton>
        <TabButton tab="trends" icon={<BarChart3 className="w-5 h-5" />}>
          Trends
        </TabButton>
        <TabButton tab="details" icon={<UserCheck className="w-5 h-5" />}>
          Details
        </TabButton>
      </div>

      {/* Content Sections */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-100">Guest Satisfaction</h2>
            <div className="flex items-center gap-2 bg-gray-900/30 px-4 py-2 rounded-xl">
              <span className="text-3xl font-bold text-gray-100">{rating.toFixed(1)}</span>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400">Current Rating</span>
                <div className="flex items-center gap-1">
                  {trend.direction === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-xs ${trend.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.abs(trend.value)}% {trend.direction}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => renderStar(i))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {metrics.map(metric => (
              <div key={metric.name} className="bg-gray-900/30 p-4 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">{metric.name}</h3>
                    <span className="text-2xl font-bold text-gray-100">
                      {metric.value.toFixed(1)}
                    </span>
                  </div>
                  <div className={`p-2 rounded-lg ${
                    metric.trend === 'up' ? 'bg-green-500/20' :
                    metric.trend === 'down' ? 'bg-red-500/20' : 'bg-gray-700/30'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    ) : (
                      <div className="w-5 h-5 bg-gray-400 rounded-full" />
                    )}
                  </div>
                </div>
                <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${(metric.value / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingHistory}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#94a3b8' }}
                  tickLine={{ stroke: '#475569' }}
                />
                <YAxis
                  domain={[3.5, 5]}
                  tick={{ fill: '#94a3b8' }}
                  tickLine={{ stroke: '#475569' }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ fill: '#1e3a8a', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/30 p-4 rounded-xl">
              <h3 className="text-gray-400 text-sm mb-2">Historical Performance</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Start</span>
                  <span className="text-gray-200">{ratingHistory[0]?.value.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current</span>
                  <span className="text-gray-200">{rating.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Change</span>
                  <span className={`${trend.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {trend.value.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/30 p-4 rounded-xl">
              <h3 className="text-gray-400 text-sm mb-2">Rating Distribution</h3>
              <div className="space-y-2">
                {ratingBreakdown.map(({ stars, percentage }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <div className="w-8 text-gray-400">{stars}★</div>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-gray-300">{percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          <div className="grid gap-4">
            {reviews.map((review, index) => (
              <div key={index} className="bg-gray-900/30 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-200">{review.user}</span>
                      {review.verified && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 fill-transparent'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900/30 p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Response Rate</h3>
                <span className="text-2xl font-bold text-gray-200">87%</span>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Avg. Response Time</h3>
                <span className="text-2xl font-bold text-gray-200">12h</span>
              </div>
              <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
                View All Reviews →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}