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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  const totalGuests = ageData ? ageData.child + ageData.adult + ageData.middle_age + ageData.elder : 0;

  if (loading) {
    return (
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-800 rounded" />
        <div className="flex justify-center">
          <div className="h-64 w-64 rounded-full bg-gray-800" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-gray-800 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={() => setIsFullScreen(true)}
        role="button"
        aria-label="View age group segmentation details"
      >
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-semibold text-gray-100">Guest Age Groups</h3>
          <span className="text-sm bg-gray-800 px-3 py-1 rounded-full text-gray-300">
            {totalGuests.toLocaleString()} total
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {chartData.map((entry, index) => (
            <div 
              key={`legend-${index}`}
              className="flex items-center p-3 bg-gray-800 rounded-lg transition-colors hover:bg-gray-700"
            >
              <div
                className="w-3 h-3 rounded-full mr-3 shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div>
                <p className="text-gray-300 font-medium">{entry.name}</p>
                <p className="text-gray-400 text-sm">{entry.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="transition-opacity duration-200 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ payload }) => (
                <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
                  <p className="font-medium text-gray-100">{payload?.[0]?.name}</p>
                  <p className="text-sm text-gray-300">
                    {payload?.[0]?.value?.toLocaleString()} guests
                    <span className="text-gray-400 ml-2">
                      ({(payload?.[0]?.payload.percent * 100).toFixed(1)}%)
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {payload?.[0]?.payload.additionalContext}
                  </p>
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {isFullScreen && (
        <AgeGroupFullScreenModal
          isOpen={isFullScreen}
          onClose={() => setIsFullScreen(false)}
          data={{ 
            current: chartData, 
            historical: historicalAgeGroups.map(group => ({
              label: `${group.month}/${group.year}`,
              child: group.child,
              adult: group.adult,
              middle_age: group.middle_age,
              elder: group.elder
            }))
          }}
          title="Guest Age Demographics Analysis"
        />
      )}
    </>
  );
}