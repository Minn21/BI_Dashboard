'use client';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from './api';
import toast from 'react-hot-toast';
import { FullScreenChartModal } from './FullScreenChartModal';

interface MemberVsGeneralData {
  member_arrivals: number;
  general_arrivals: number;
}

// Updated Member vs General Chart Component
export function MemberVsGeneralChart() {
    const [rawData, setRawData] = useState<MemberVsGeneralData | null>(null);
    const [chartData, setChartData] = useState<{ name: string; value: number; }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const result = await api.getMemberVsGeneral();
          setRawData(result);
          setChartData([
            { name: 'Members', value: result.member_arrivals },
            { name: 'General Guests', value: result.general_arrivals }
          ]);
        } catch {
          toast.error('Failed to load member data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    if (loading) return (
      <div className="bg-black p-6 rounded-xl shadow-lg">
        <div className="h-5 w-24 bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-7 w-36 bg-gray-700 rounded animate-pulse" />
      </div>
    );
  
    const COLORS = ['#3B82F6', '#10B981'];
  
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
          <FullScreenChartModal
            isOpen={isFullScreen}
            onClose={() => setIsFullScreen(false)}
            chartType="memberVsGeneral"
            data={chartData}
            title="Member vs. General Guests Analysis"
          />
        )}
      </>
    );
  }