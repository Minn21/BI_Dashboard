'use client';
import React, { useState, useEffect } from 'react';
import { Chatbot } from './Chatbot';
import { AgeGroupSegmentation } from '@/components/AgeGroupSegmentation';
import { TodayStatus } from '../components/TodayStatus';
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
import { ADRDisplay } from '../components/ADRDisplay';
import { RevenueForecast } from '../components/RevenueForecast';
import BookingsOverview from '@/components/BookingsOverview'; // Import the new component

// ActionButton component remains unchanged
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
  onClick,
}) => (
  <button
    type="button"
    className="group p-3 sm:p-4 w-full bg-gray-700/30 rounded-lg hover:bg-gray-700/40 transition-all flex items-center gap-3 border border-gray-600/30"
    onClick={onClick}
  >
    <div className={`p-2 ${iconBg} rounded-lg group-hover:${iconHoverBg}`}>
      <span className={iconText}>{icon}</span>
    </div>
    <span className="text-gray-100 text-xs sm:text-sm font-medium">{text}</span>
  </button>
);

// Tab type definition
type TabType = 'dashboard' | 'bookings';

export const Dashboard = () => {
  // Add state for active tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openChatbot = () => {
    setIsChatbotOpen(true);
    setIsChatbotMinimized(false);
    setTimeout(() => setIsChatbotVisible(true), 10);
  };

  const closeChatbot = () => {
    setIsChatbotVisible(false);
    setTimeout(() => setIsChatbotOpen(false), 300);
  };

  const toggleMinimizeChatbot = () => {
    if (isChatbotMinimized) {
      setIsChatbotMinimized(false);
      setIsChatbotVisible(true);
    } else {
      setIsChatbotMinimized(true);
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Header remains unchanged */}
      {/* Existing Header */}
      <header className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-between items-start sm:items-center">
        <div className="space-y-1 sm:space-y-2 w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-100 truncate">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Hotel Management
            </span>
            <span className="text-gray-300 ml-2">Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">Real-time operational insights and metrics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end w-full sm:w-auto">
          <NotificationBell />
          <div className="hidden sm:flex">
            <WeatherWidget />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          className={`px-3 py-1.5 sm:px-4 sm:py-2 mr-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${activeTab === 'dashboard'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-200'
            }`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'bookings'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-200'
            }`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>

      </div>

      {/* Dashboard Content */}
      {activeTab === 'dashboard' && (
        <>
          {/* Priority Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-14 gap-3 sm:gap-4 lg:gap-6">
            <div className="lg:col-span-5 sm:col-span-2 grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
              <TodayStatus />
            </div>
            <div className="lg:col-span-7 sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <KeyInsights className="col-span-2 sm:col-span-1" />
              <OccupancyRate className="col-span-2 sm:col-span-1" />
              <ADRDisplay className="col-span-2 sm:col-span-1" />
              <CanceledBookings className="col-span-2 sm:col-span-1" />
              
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <MemberVsGeneralChart />
            <AgeGroupSegmentation />
          </div>

          {/* Detailed View Section */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-3 sm:gap-4 lg:gap-6">
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <ArrivalStats />
              <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
                <RevenueForecast />
              </div>
              <GuestSatisfaction />
            </div>
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700/30">
                <BirthdayList />
              </div>
              {/* Report section remains */}
              <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-xl border border-blue-700/30">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Reports & Analytics</h3>
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
                <p className="text-xs sm:text-sm text-gray-400 mt-2 sm:mt-3">
                  Includes all current metrics, charts, and AI-powered insights
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bookings Content - Responsive padding */}
      {activeTab === 'bookings' && (
        <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-700/30">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mb-3 sm:mb-4">Bookings Overview</h2>
          <BookingsOverview />
        </div>
      )}

      {/* Chatbot */}
      {isChatbotOpen && (
        <Chatbot
          onClose={closeChatbot}
          isVisible={isChatbotVisible}
          isMinimized={isChatbotMinimized}
          onMinimize={toggleMinimizeChatbot}
        />
      )}
      {!isChatbotOpen && (
        <button
          onClick={openChatbot}
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center z-40 transition-all"
          aria-label="Open chat assistant"
        >
          <span className="text-xl sm:text-2xl">💬</span>
        </button>
      )}
    </div>
  );
};