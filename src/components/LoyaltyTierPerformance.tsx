'use client';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from './api';
import toast from 'react-hot-toast';

interface LoyaltyTierData {
  tier: string;
  count: number;
  revenue: number;
  averageSpend: number;
  repeatVisits: number;
  stayLength: number;
}

export function LoyaltyTierPerformance() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyTierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<'count' | 'revenue' | 'averageSpend' | 'repeatVisits'>('revenue');
  const [viewType, setViewType] = useState<'bar' | 'pie'>('bar');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get member vs general data which includes loyalty breakdown
        const memberData = await api.getMemberVsGeneral();
        
        // Get bookings data to calculate additional metrics
        const bookings = await api.getBookings();
        
        // Process loyalty tier data
        const tierMap = new Map<string, {
          count: number;
          revenue: number;
          visits: number;
          stayLength: number;
          guests: Set<number>; // Track unique guests
        }>();
        
        // Initialize with tiers from member breakdown
        if (memberData.member_breakdown) {
          tierMap.set('Bronze', { 
            count: memberData.member_breakdown.bronze, 
            revenue: 0, 
            visits: 0, 
            stayLength: 0,
            guests: new Set()
          });
          tierMap.set('Silver', { 
            count: memberData.member_breakdown.silver, 
            revenue: 0, 
            visits: 0, 
            stayLength: 0,
            guests: new Set()
          });
          tierMap.set('Gold', { 
            count: memberData.member_breakdown.gold, 
            revenue: 0, 
            visits: 0, 
            stayLength: 0,
            guests: new Set()
          });
          tierMap.set('Platinum', { 
            count: memberData.member_breakdown.platinum, 
            revenue: 0, 
            visits: 0, 
            stayLength: 0,
            guests: new Set()
          });
        }
        
        // Add "General" (non-member) tier
        tierMap.set('General', { 
          count: memberData.general_arrivals, 
          revenue: 0, 
          visits: 0, 
          stayLength: 0,
          guests: new Set()
        });
        
        // Process bookings to calculate revenue and other metrics by tier
        bookings.forEach(booking => {
          // This is a simplified approach - in a real implementation, we would need
          // to know the loyalty tier of each guest from the booking data
          // For demonstration, we'll assign bookings randomly to tiers based on their guest_id
          
          const guestId = booking.guest_id;
          let tier = 'General';
          
          // Simplified logic to assign tiers based on guest_id
          // In a real implementation, this would come from the booking data
          const idMod = guestId % 10;
          if (idMod < 4) tier = 'General';
          else if (idMod < 6) tier = 'Bronze';
          else if (idMod < 8) tier = 'Silver';
          else if (idMod < 9) tier = 'Gold';
          else tier = 'Platinum';
          
          if (!tierMap.has(tier)) {
            tierMap.set(tier, { 
              count: 0, 
              revenue: 0, 
              visits: 0, 
              stayLength: 0,
              guests: new Set()
            });
          }
          
          const tierData = tierMap.get(tier)!;
          tierData.revenue += booking.total_price;
          tierData.visits += 1;
          tierData.stayLength += booking.nights;
          tierData.guests.add(guestId);
        });
        
        // Convert map to array and calculate averages
        const loyaltyTierData: LoyaltyTierData[] = Array.from(tierMap.entries()).map(([tier, data]) => ({
          tier,
          count: data.count,
          revenue: data.revenue,
          averageSpend: data.count > 0 ? data.revenue / data.count : 0,
          repeatVisits: data.guests.size > 0 ? data.visits / data.guests.size : 0,
          stayLength: data.visits > 0 ? data.stayLength / data.visits : 0
        }));
        
        // Sort by revenue (default view)
        loyaltyTierData.sort((a, b) => b.revenue - a.revenue);
        
        setLoyaltyData(loyaltyTierData);
      } catch (error) {
        toast.error('Failed to load loyalty tier data');
        console.error('Error fetching loyalty data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMetricChange = (newMetric: 'count' | 'revenue' | 'averageSpend' | 'repeatVisits') => {
    setMetric(newMetric);
    
    // Sort data based on selected metric
    const sortedData = [...loyaltyData].sort((a, b) => {
      if (newMetric === 'count') return b.count - a.count;
      if (newMetric === 'revenue') return b.revenue - a.revenue;
      if (newMetric === 'averageSpend') return b.averageSpend - a.averageSpend;
      return b.repeatVisits - a.repeatVisits;
    });
    
    setLoyaltyData(sortedData);
  };

  const getMetricTitle = () => {
    switch (metric) {
      case 'count': return 'Guest Count';
      case 'revenue': return 'Total Revenue';
      case 'averageSpend': return 'Average Spend per Guest';
      case 'repeatVisits': return 'Repeat Visit Rate';
    }
  };

  const formatYAxisTick = (value: number) => {
    if (metric === 'revenue' || metric === 'averageSpend') {
      return `$${value.toLocaleString()}`;
    } else if (metric === 'repeatVisits') {
      return `${value.toFixed(1)}x`;
    }
    return value.toLocaleString();
  };

  const getTooltipFormatter = (value: number, name: string) => {
    if (name === 'revenue' || name === 'averageSpend') {
      return [`$${value.toLocaleString()}`, name === 'revenue' ? 'Total Revenue' : 'Avg. Spend'];
    } else if (name === 'repeatVisits') {
      return [`${value.toFixed(1)}x`, 'Repeat Visits'];
    } else if (name === 'count') {
      return [value.toLocaleString(), 'Guests'];
    }
    return [value.toLocaleString(), name];
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-100">Loyalty Tier Performance</h3>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex space-x-2">
            <button
              onClick={() => handleMetricChange('revenue')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                metric === 'revenue' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => handleMetricChange('count')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                metric === 'count' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Guests
            </button>
            <button
              onClick={() => handleMetricChange('averageSpend')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                metric === 'averageSpend' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Avg. Spend
            </button>
            <button
              onClick={() => handleMetricChange('repeatVisits')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                metric === 'repeatVisits' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Repeat Rate
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewType('bar')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setViewType('pie')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewType === 'pie' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Pie
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        {viewType === 'bar' ? (
          <BarChart
            data={loyaltyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="tier" 
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              tickFormatter={formatYAxisTick}
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip 
              formatter={getTooltipFormatter}
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
              itemStyle={{ color: '#E5E7EB' }}
            />
            <Legend wrapperStyle={{ color: '#E5E7EB' }} />
            <Bar 
              dataKey={metric} 
              name={getMetricTitle()} 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={loyaltyData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={130}
              innerRadius={60}
              fill="#8884d8"
              dataKey={metric}
              nameKey="tier"
            >
              {loyaltyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={getTooltipFormatter}
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
              itemStyle={{ color: '#E5E7EB' }}
            />
          </PieChart>
        )}
      </ResponsiveContainer>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Loyalty Tier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Guests</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg. Spend</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Repeat Rate</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg. Stay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loyaltyData.map((tier, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}>
                <td className="px-4 py-3 text-sm text-gray-300">{tier.tier}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{tier.count.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-300">${tier.revenue.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-300">${tier.averageSpend.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{tier.repeatVisits.toFixed(1)}x</td>
                <td className="px-4 py-3 text-sm text-gray-300">{tier.stayLength.toFixed(1)} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
