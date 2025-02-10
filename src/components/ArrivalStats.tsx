import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine, TooltipProps } from 'recharts';
import { format } from 'date-fns';
import { Users } from 'lucide-react';

interface ArrivalData {
  date: string;
  arrivals: number;
}

const data: ArrivalData[] = [
  { date: '2023-10-01', arrivals: 24 },
  { date: '2023-10-02', arrivals: 30 },
  { date: '2023-10-03', arrivals: 18 },
  { date: '2023-10-04', arrivals: 42 },
  { date: '2023-10-05', arrivals: 36 },
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <p className="font-semibold text-gray-200">{format(new Date(label), 'MMM dd')}</p>
        <p className="text-sm text-gray-400 mt-1">
          <span className="font-medium text-blue-400">{payload[0].value}</span> arrivals
        </p>
      </div>
    );
  }
  return null;
};

export default function ArrivalStats() {
  const averageArrivals = Math.round(data.reduce((acc, curr) => acc + curr.arrivals, 0) / data.length);
  
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