'use client';
import React from 'react';
import { AgeGroupSegmentation } from '@/components/AgeGroupSegmentation';
import { TodayStatus } from '../components/TodayStatus';
import { FilterDropdown } from '../components/FilterDropdown';
import { CanceledBookings } from '../components/CanceledBookings';
import { OccupancyRate } from '../components/OccupancyRate';
import { KeyInsights } from '../components/KeyInsights';
import { WeatherWidget } from '../components/WeatherWidget';
import { ArrivalStats } from '../components/ArrivalStats';
import { MemberVsGeneralChart } from '../components/MemberVsGeneralChart';
import { BirthdayList } from '../components/BirthdayList';
import { GuestSatisfaction } from '../components/GuestSatisfaction';
import { NotificationBell } from '../components/NotificationBell';
import { reportGenerator } from './reportGenerator';

// Reusable ActionButton component
interface ActionButtonProps {
  icon: React.ReactNode;
  text: string;
  iconBg: string;
  iconHoverBg: string;
  iconText: string;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon, 
  text, 
  iconBg, 
  iconHoverBg, 
  iconText, 
  onClick 
}) => (
  <button
    type="button"
    className="group p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/40 transition-all flex items-center gap-3 border border-gray-600/30"
    onClick={onClick}  // Add this line
  >
    <div className={`p-2 ${iconBg} rounded-lg group-hover:${iconHoverBg}`}>
      <span className={iconText}>{icon}</span>
    </div>
    <span className="text-gray-100 text-sm font-medium">{text}</span>
  </button>
);

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-3 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Unified Header Section */}
      <header className="flex flex-col lg:flex-row gap-4 lg:gap-8 justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Hotel Management
            </span>
            <span className="text-gray-300 ml-2">Dashboard</span>
          </h1>
          <p className="text-sm text-gray-400">Real-time operational insights and metrics</p>
        </div>

        {/* Action Bar with Consistent Spacing */}
        <div className="flex flex-wrap items-center gap-3 justify-end">
          <FilterDropdown />
          <NotificationBell />
          <WeatherWidget />
        </div>
      </header>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <TodayStatus />
        <OccupancyRate />
        <CanceledBookings />
        <KeyInsights />
        <MemberVsGeneralChart />
        <AgeGroupSegmentation />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4 sm:gap-6">
        {/* Left Column - Primary Data */}
        <div className="space-y-6 lg:space-y-8">
          <ArrivalStats />
          <GuestSatisfaction />
        </div>

        {/* Right Column - Secondary Data */}
        <div className="space-y-6 lg:space-y-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/30">
            <BirthdayList />
          </div>

          {/* Enhanced Report Section */}
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-700/30">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Reports & Analytics</h3>
            <ActionButton
              icon="📊"
              text="Generate Comprehensive Report"
              iconBg="bg-blue-500/30"
              iconHoverBg="bg-blue-500/40"
              iconText="text-blue-400"
              onClick={async () => {
                try {
                  await reportGenerator.generateComprehensiveReport();
                  alert('Report generated successfully!');
                } catch (error) {
                  console.error('Report generation failed', error);
                  alert('Failed to generate report. Please try again.');
                }
              }}
            />
            <p className="text-sm text-gray-400 mt-3">
              Includes all current metrics, charts, and AI-powered insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};