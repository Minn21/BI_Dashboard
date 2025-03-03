'use client';
import React, { useState, useEffect } from 'react';
import { Home, DollarSign, TrendingUp } from 'lucide-react';
import { api } from './api';
import toast from 'react-hot-toast';
import { LoadingCard } from './components';

interface UnitBooking {
  unit_id: string;
  booking_count: number;
}

interface TotalIncome {
  total_income_month: number;
  total_income_year: number;
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