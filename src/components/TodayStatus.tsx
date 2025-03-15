'use client';
import React, { useState, useEffect } from 'react';
import { Users, Home, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './api';
import { LoadingCard } from './components';

// Glowing gradient colors for arrivals/departures
const HEATMAP_GRADIENTS = {
  arrivals: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
  departures: ['#34d399', '#10b981', '#059669', '#047857']
};

const generateMockData = (type: 'arrivals' | 'departures') => {
  const data: { [hour: string]: number } = {};
  const basePeak = type === 'arrivals' ? 14 : 10;
  
  for (let hour = 0; hour < 24; hour++) {
    const distanceFromPeak = Math.abs(hour - basePeak);
    const noise = Math.random() * 3;
    const value = Math.floor(
      Math.max(0, 
        15 * Math.exp(-distanceFromPeak/3) + noise
      )
    );
    data[hour.toString().padStart(2, '0')] = value;
  }
  return data;
};

const HeatmapCell = ({ value, max, time, isActive }: { 
  value: number, max: number, time: string, isActive: boolean 
}) => {
  const intensity = Math.min(value / max, 1);
  const currentHour = new Date().getHours();
  const isCurrent = parseInt(time.split(':')[0]) === currentHour;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative group"
    >
      <div className="relative h-8 w-full">
        {/* Glowing background */}
        <div className={`absolute inset-0 rounded-lg ${
          isCurrent ? 'animate-pulse' : ''
        }`} style={{
          background: `radial-gradient(circle at center, 
            ${HEATMAP_GRADIENTS[isActive ? 'arrivals' : 'departures'][2]}20, 
            transparent 70%)`,
          filter: `blur(${intensity * 8}px)`
        }} />
        
        {/* Main cell */}
        <motion.div
          className={`h-full w-full rounded-lg backdrop-blur-sm border ${
            isCurrent ? 'border-white/30' : 'border-transparent'
          } transition-all duration-300`}
          style={{
            background: `linear-gradient(
              45deg,
              ${HEATMAP_GRADIENTS[isActive ? 'arrivals' : 'departures'][0]}${Math.round(intensity * 100)},
              ${HEATMAP_GRADIENTS[isActive ? 'arrivals' : 'departures'][2]}${Math.round(intensity * 70)}
            )`,
            boxShadow: `0 4px 24px -4px ${HEATMAP_GRADIENTS[isActive ? 'arrivals' : 'departures'][1]}${Math.round(intensity * 50)}`
          }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-lg" />
          
          {value > 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md"
            >
              {value}
            </motion.span>
          )}
        </motion.div>
      </div>

      {/* Floating time label */}
      <AnimatePresence>
        {parseInt(time.split(':')[0]) % 3 === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full mt-1 w-full text-center"
          >
            <span className="text-[0.6rem] text-gray-400 font-medium">
              {time.replace(':00', '')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover tooltip */}
      <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
        bg-gray-800/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-white shadow-xl z-10">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          {time} - {value} {isActive ? 'arrivals' : 'departures'}
        </div>
      </div>
    </motion.div>
  );
};

type TodayStatusType = {
  arrival_hours: { [hour: string]: number };
  departure_hours: { [hour: string]: number };
  today_arrivals: number;
  today_departures: number;
};

export function TodayStatus() {
  const [statusData, setStatusData] = useState<TodayStatusType | null>(null);
  const [activeTab, setActiveTab] = useState<'arrivals' | 'departures'>('arrivals');
  const [maxValue, setMaxValue] = useState(15);

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiData = await api.getTodayStatus();
        const mergedData = {
          ...apiData,
          arrival_hours: generateMockData('arrivals'),
          departure_hours: generateMockData('departures'),
          today_arrivals: 56,
          today_departures: 48
        };
        setStatusData(mergedData);
        setMaxValue(Math.max(...Object.values(mergedData.arrival_hours || {}), ...Object.values(mergedData.departure_hours || {})));
      } catch (error) {
        toast.error('Failed to load data');
      }
    };
    loadData();
  }, []);

  if (!statusData) return <LoadingCard />;

  function getTimeSlots() {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">Today's Movement</h3>
      
      {/* Cards for total arrivals and departures */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
          className={`bg-gray-800/50 p-4 rounded-lg cursor-pointer transition-all ${activeTab === 'arrivals' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setActiveTab('arrivals')}
        >
          <div className="flex flex-col items-center">
            <div className="p-2 rounded-full bg-blue-500/20 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{statusData?.today_arrivals}</span>
            <span className="text-sm text-gray-400">Arrivals</span>
          </div>
        </div>
        <div 
          className={`bg-gray-800/50 p-4 rounded-lg cursor-pointer transition-all ${activeTab === 'departures' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => setActiveTab('departures')}
        >
          <div className="flex flex-col items-center">
            <div className="p-2 rounded-full bg-green-500/20 mb-2">
              <Home className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{statusData?.today_departures}</span>
            <span className="text-sm text-gray-400">Departures</span>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-12 gap-1.5 relative">
          {getTimeSlots().map((time) => (
            <HeatmapCell
              key={time}
              time={time}
              value={(activeTab === 'arrivals' 
                ? statusData.arrival_hours?.[time.split(':')[0]] 
                : statusData.departure_hours?.[time.split(':')[0]]) || 0}
              max={maxValue}
              isActive={activeTab === 'arrivals'}
            />
          ))}
        </div>

        {/* Animated legend */}
        <motion.div 
          className="flex justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {HEATMAP_GRADIENTS[activeTab].map((color, i) => (
            <div key={color} className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full shadow-lg border border-white/10"
                style={{ 
                  background: `radial-gradient(75% 75% at 25% 25%, ${color}40, ${color}80)`,
                  boxShadow: `0 0 16px ${color}40`
                }}
              />
              <span className="text-xs text-gray-400">
                {Math.round((i / (HEATMAP_GRADIENTS.arrivals.length - 1)) * maxValue)}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}