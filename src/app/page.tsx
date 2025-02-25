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
  NotificationBell,
  GuestSatisfaction,
  TodayStatus,
  AgeGroupSegmentation,
  CoffeeBreakTimer
} from '../components/components';
import { WeatherWidget } from '../components/WeatherWidget';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">
          Hotel Management Dashboard
        </h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex-1 min-w-[200px] w-full sm:w-auto">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
            <FilterDropdown />
            <NotificationBell />
            <WeatherWidget />
          </div>
        </div>
      </header>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TodayStatus />
        <OccupancyRate />
        <CanceledBookings />
        <KeyInsights />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Primary Data Visualization */}
        <div className="lg:col-span-3 space-y-6">
          <ArrivalStats />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <MemberVsGeneralChart />
            <AgeGroupSegmentation />
          </div>
        </div>

        {/* Secondary Information & Tools */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <BirthdayList />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <GuestSatisfaction />
              <CoffeeBreakTimer />
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  Generate Report
                </button>
                <button className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  Add Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;