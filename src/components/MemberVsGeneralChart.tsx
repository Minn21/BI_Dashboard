import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PieData {
  name: string;
  value: number;
}

const data: PieData[] = [
  { name: 'Members', value: 65 },
  { name: 'General Guests', value: 35 },
];

const COLORS = ['#3B82F6', '#10B981'];

export default function MemberVsGeneralChart() {
  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">
        Member vs. General Guests
      </h3>
      <div className="text-center mb-4">
        <div className="flex justify-center gap-6">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[0] }}></div>
            <span className="text-gray-300">Members: {data[0].value}%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[1] }}></div>
            <span className="text-gray-300">Guests: {data[1].value}%</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={50}
            paddingAngle={5}
            stroke="none"
          >
            {data.map((_, index) => (
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
  );
}