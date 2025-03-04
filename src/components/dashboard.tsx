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

export const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
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
                <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-3">
                        <FilterDropdown />
                        <div className="hidden sm:flex items-center gap-3">
                            <NotificationBell />
                            <WeatherWidget />
                        </div>
                    </div>
                </div>
            </header>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                <TodayStatus />
                <OccupancyRate />
                <CanceledBookings />
                <KeyInsights />
                <MemberVsGeneralChart />
                <AgeGroupSegmentation />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8">
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

                    {/* Enhanced Quick Actions */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/30">
                        <h3 className="text-lg font-semibold text-gray-100 mb-6">Management Tools</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button className="group p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/40 transition-all flex items-center gap-3 border border-gray-600/30">
                                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30">
                                    <span className="text-blue-400">📊</span>
                                </div>
                                <span className="text-gray-100 text-sm font-medium">Generate Report</span>
                            </button>
                            <button className="group p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/40 transition-all flex items-center gap-3 border border-gray-600/30">
                                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30">
                                    <span className="text-green-400">📅</span>
                                </div>
                                <span className="text-gray-100 text-sm font-medium">New Booking</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};