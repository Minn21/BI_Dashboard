import React from 'react';
import { TrendingUp, Home, DollarSign } from 'lucide-react';

interface Insight {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}

export default function KeyInsights() {
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
                <span className={`text-sm ${
                  insight.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'
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