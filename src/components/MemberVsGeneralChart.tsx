'use client';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from './api';
import toast from 'react-hot-toast';
import { MemberVsGeneralFullScreenModal } from './MemberVsGeneralFullScreenModal';

interface MemberVsGeneralData {
  member_arrivals: number;
  general_arrivals: number;
}

interface HistoricalMemberVsGeneral {
  month: number;
  year: number;
  member_arrivals: number;
  general_arrivals: number;
}

export function MemberVsGeneralChart() {
  const [rawData, setRawData] = useState<MemberVsGeneralData | null>(null);
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalMemberVsGeneral[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both current and historical data
        const [currentData, historicalData] = await Promise.all([
          api.getMemberVsGeneral(), // Fetch current member vs general data
          api.getHistoricalData(),  // Fetch historical data
        ]);

        // Transform historical data for member vs general arrivals
        const historicalMemberVsGeneral: HistoricalMemberVsGeneral[] = historicalData.map(data => ({
          month: data.month,
          year: data.year,
          member_arrivals: data.member_vs_general_arrivals.member_arrivals,
          general_arrivals: data.member_vs_general_arrivals.general_arrivals,
        }));

        // Set current data for the pie chart
        setRawData(currentData);
        setChartData([
          { name: 'Members', value: currentData.member_arrivals },
          { name: 'General Guests', value: currentData.general_arrivals },
        ]);

        // Set historical data for the line chart
        setHistoricalData(historicalMemberVsGeneral);
      } catch (error) {
        toast.error('Failed to load member data');
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

  const COLORS = ['#3B82F6', '#10B981'];

  // Prepare historical data for the line chart
  const lineChartData = historicalData.map(data => ({
    label: `${new Date(data.year, data.month - 1).toLocaleString('default', { month: 'short' })} ${data.year}`,
    Members: data.member_arrivals,
    'General Guests': data.general_arrivals,
  }));

  return (
    <>
      <div
        className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => setIsFullScreen(true)}
      >
        <h3 className="text-xl font-semibold text-gray-100 mb-4 px-4">
          Member vs. General Guests
        </h3>
        <div className="text-center mb-4">
          <div className="flex justify-center gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[0] }}></div>
              <span className="text-gray-300">Members: {chartData[0]?.value || 0}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[1] }}></div>
              <span className="text-gray-300">Guests: {chartData[1]?.value || 0}</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50}
              paddingAngle={5}
              stroke="none"
            >
              {chartData.map((_, index) => (
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
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {isFullScreen && (
        <MemberVsGeneralFullScreenModal
          isOpen={isFullScreen}
          onClose={() => setIsFullScreen(false)}
          data={{
            current: chartData,
            historical: lineChartData
          }}
          title="Member vs. General Guests Analysis"
        />
      )}
    </>
  );
}