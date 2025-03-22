'use client';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { api } from './api';
import toast from 'react-hot-toast';

interface RevenueSourcesData {
  room: number;
  food_beverage: number;
  spa: number;
  events: number;
  other: number;
}

export function RevenueSourceBreakdown() {
  const [revenueData, setRevenueData] = useState<RevenueSourcesData | null>(null);
  const [chartData, setChartData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const incomeData = await api.getTotalIncome();
        
        if (incomeData.revenue_sources) {
          setRevenueData(incomeData.revenue_sources);
          
          const total = Object.values(incomeData.revenue_sources).reduce((sum, val) => sum + val, 0);
          setTotalRevenue(total);
          
          const formattedData = [
            { name: 'Room Revenue', value: incomeData.revenue_sources.room, color: '#3B82F6' },
            { name: 'F&B', value: incomeData.revenue_sources.food_beverage, color: '#10B981' },
            { name: 'Spa', value: incomeData.revenue_sources.spa, color: '#F59E0B' },
            { name: 'Events', value: incomeData.revenue_sources.events, color: '#EF4444' },
            { name: 'Other', value: incomeData.revenue_sources.other, color: '#8B5CF6' }
          ];
          
          setChartData(formattedData);
        }
      } catch (error) {
        toast.error('Failed to load revenue source data');
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-800 rounded" />
        <div className="h-64 bg-gray-800 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-100">Revenue Source Breakdown</h3>
        <span className="text-sm bg-gray-800 px-3 py-1 rounded-full text-gray-300">
          ${totalRevenue.toLocaleString()} total
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={2}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col justify-center">
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-gray-200 font-medium">${item.value.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">
                    {totalRevenue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
