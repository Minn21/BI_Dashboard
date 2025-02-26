'use client';
import React from 'react';
import {
  ArrivalStats,
  MemberVsGeneralChart,
  OccupancyRate,
  BirthdayList,
  KeyInsights,
  CanceledBookings,
  FilterDropdown,
  SearchBar,
  TodayStatus,
  AgeGroupSegmentation,
  CoffeeBreakTimer
} from '../components/components';
import { WeatherWidget } from '../components/WeatherWidget';
import { GuestSatisfaction } from '../components/GuestSatisfaction';
import { NotificationBell } from '../components/NotificationBell';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Enhanced Header Section */}
      <header className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-start sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Hotel Management Dashboard
          </h1>
          <p className="text-sm text-gray-400">Real-time hotel performance metrics</p>
        </div>
        
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex-1 min-w-[240px]">
            <SearchBar />
          </div>
          <div className="flex items-center gap-3">
            <FilterDropdown />
            <div className="hidden sm:flex items-center gap-3">
              <NotificationBell />
              <WeatherWidget />
            </div>
          </div>
        </div>
      </header>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <TodayStatus />
        <OccupancyRate />
        <CanceledBookings />
        <KeyInsights />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-6">
        {/* Left Column - Data Visualization */}
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <ArrivalStats />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <MemberVsGeneralChart />
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <AgeGroupSegmentation />
            </div>
          </div>
        </div>

        {/* Right Column - Secondary Information */}
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <BirthdayList />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <GuestSatisfaction />
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <CoffeeBreakTimer />
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-100 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="group p-4 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-xl hover:from-blue-600/40 hover:to-purple-600/40 transition-all flex items-center gap-3">
                <span className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  📊
                </span>
                <span className="text-gray-100">Generate Report</span>
              </button>
              <button className="group p-4 bg-gradient-to-br from-green-600/30 to-cyan-600/30 rounded-xl hover:from-green-600/40 hover:to-cyan-600/40 transition-all flex items-center gap-3">
                <span className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  📅
                </span>
                <span className="text-gray-100">Add Booking</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;