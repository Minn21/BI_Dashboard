'use client';
import React from 'react';
import { Users, Calendar, LogOut, AlertTriangle } from 'lucide-react';

import {
  ArrivalStats,
  MemberVsGeneralChart,
  OccupancyRate,
  BirthdayList,
  KeyInsights,
  MetricsCard as ComponentMetricsCard,
  FilterDropdown,
  SearchBar,
  NotificationBell,
  GuestSatisfaction,
  CoffeeBreakTimer
} from '../components/components';
import { WeatherWidget } from '../components/WeatherWidget';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-100">
            Hotel Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <WeatherWidget />
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <FilterDropdown />
          <SearchBar />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ComponentMetricsCard
            title="Today's Arrivals"
            value="24"
            trend="up"
            percentage={5}
            icon={<Users className="w-5 h-5 text-blue-500" />}
          />
          <ComponentMetricsCard
            title="Today's Departures"
            value="18"
            trend="down"
            percentage={2}
            icon={<LogOut className="w-5 h-5 text-green-500" />}
          />
          <ComponentMetricsCard
            title="Canceled Bookings"
            value="12"
            trend="down"
            percentage={8}
            icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          />
          <ComponentMetricsCard
            title="Upcoming Events"
            value="5"
            trend="up"
            percentage={10}
            icon={<Calendar className="w-5 h-5 text-purple-500" />}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Full Width Charts */}
        <div className="lg:col-span-2">
          <ArrivalStats />
        </div>
        <div className="lg:col-span-1">
          <MemberVsGeneralChart />
        </div>
        
        {/* Three Column Section */}
        <div className="lg:col-span-1">
          <OccupancyRate />
        </div>
        <div className="lg:col-span-1">
          <KeyInsights />
        </div>
        <div className="lg:col-span-1">
          <BirthdayList />
        </div>

        {/* New Components */}
        <div className="lg:col-span-1">
          <GuestSatisfaction />
        </div>
        <div className="lg:col-span-1">
          <CoffeeBreakTimer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;