import React from 'react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', rate: 75 },
  { day: 'Tue', rate: 82 },
  { day: 'Wed', rate: 78 },
  { day: 'Thu', rate: 85 },
  { day: 'Fri', rate: 90 },
  { day: 'Sat', rate: 88 },
  { day: 'Sun', rate: 72 },
];

export default function OccupancyRate() {
  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-100">Occupancy & ADR</h3>
        <span className="text-sm text-green-400">+12% vs last week</span>
      </div>

      <div className="grid gap-6">
        <div className="p-4 rounded-lg bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-gray-400">Occupancy Rate</span>
            </div>
            <span className="text-2xl font-bold text-blue-500">78%</span>
          </div>
          
          <div className="h-16 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <Bar dataKey="rate" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-gray-400">Average Daily Rate</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-500">$150</div>
              <div className="text-sm text-green-400">+5% from last month</div>
            </div>
          </div>
          
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: '75%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}