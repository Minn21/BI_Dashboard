'use client';
import React, { useState, useEffect } from 'react';
import { Chatbot } from './Chatbot';
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
import { ADRDisplay } from '../components/ADRDisplay';

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

export const Dashboard = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive layout based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
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
      // If minimized, open it
      setIsChatbotMinimized(false);
      setIsChatbotVisible(true);
    } else {
      // If open, minimize it
      setIsChatbotMinimized(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden">
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

      {/* Priority Metrics - Always visible and properly sized for all screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <TodayStatus />
        <OccupancyRate />
        <ADRDisplay />
        <CanceledBookings />
      </div>

      {/* Secondary Metrics - Responsive layout adjustment */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <KeyInsights />
        <MemberVsGeneralChart />
        <AgeGroupSegmentation />
      </div>

      {/* Detailed View Section - Adjusts based on screen size */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-3 sm:gap-4 lg:gap-6">
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <ArrivalStats />
          <GuestSatisfaction />
        </div>
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700/30">
            <BirthdayList />
          </div>
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

      {/* Chatbot - always rendered but conditionally visible */}
      {isChatbotOpen && (
        <Chatbot 
          onClose={closeChatbot} 
          isVisible={isChatbotVisible}
          isMinimized={isChatbotMinimized}
          onMinimize={toggleMinimizeChatbot}
        />
      )}
      
      {/* Chatbot button - Responsive position and size */}
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