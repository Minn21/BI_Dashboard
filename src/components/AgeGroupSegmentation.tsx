'use client';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from './api';
import toast from 'react-hot-toast';
import { AgeGroupFullScreenModal } from './AgeGroupFullScreenModal';

interface AgeGroups {
  child: number;
  adult: number;
  middle_age: number;
  elder: number;
}

interface AgeGroupHistory {
  month: number;
  year: number;
  child: number;
  adult: number;
  middle_age: number;
  elder: number;
}

export function AgeGroupSegmentation() {
  const [ageData, setAgeData] = useState<AgeGroups | null>(null);
  const [chartData, setChartData] = useState<{ name: string; value: number; additionalContext?: string }[]>([]);
  const [historicalAgeGroups, setHistoricalAgeGroups] = useState<AgeGroupHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [currentAgeGroups, historicalData] = await Promise.all([
          api.getAgeGroups(),
          api.getHistoricalData()
        ]);

        const historicalAgeGroups: AgeGroupHistory[] = historicalData.map(data => ({
          month: data.month,
          year: data.year,
          ...data.age_group_segmentation
        }));

        setAgeData(currentAgeGroups);
        setChartData([
          { name: 'Child', value: currentAgeGroups.child, additionalContext: 'Ages 0-17' },
          { name: 'Adult', value: currentAgeGroups.adult, additionalContext: 'Ages 18-35' },
          { name: 'Middle Age', value: currentAgeGroups.middle_age, additionalContext: 'Ages 36-60' },
          { name: 'Elder', value: currentAgeGroups.elder, additionalContext: 'Ages 61+' }
        ]);
        setHistoricalAgeGroups(historicalAgeGroups);
      } catch (error) {
        toast.error('Failed to load age group data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-black p-6 rounded-xl shadow-lg">
        <div className="h-5 w-24 bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-7 w-36 bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  const totalGuests = ageData ? ageData.child + ageData.adult + ageData.middle_age + ageData.elder : 0;

  const lineChartData = historicalAgeGroups.map(data => ({
    label: `${new Date(data.year, data.month - 1).toLocaleString('default', { month: 'short' })} ${data.year}`,
    child: data.child,
    adult: data.adult,
    middle_age: data.middle_age,
    elder: data.elder
  }));

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
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
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
        <AgeGroupFullScreenModal
          isOpen={isFullScreen}
          onClose={() => setIsFullScreen(false)}
          data={{ current: chartData, historical: lineChartData }}
          title="Guest Age Demographics Analysis"
        />
      )}
    </>
  );
}