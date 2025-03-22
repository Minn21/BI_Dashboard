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
import { RevenueSourceBreakdown } from '../components/RevenueSourceBreakdown';
import { BookingChannelAnalysis } from '../components/BookingChannelAnalysis';
import { YearOverYearComparison } from '../components/YearOverYearComparison';
import { RoomTypePerformance } from '../components/RoomTypePerformance';
import { LoyaltyTierPerformance } from '../components/LoyaltyTierPerformance';
import { BookingsOverview } from '../components/BookingsOverview'; // Updated to use named import

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
type TabType = 'dashboard' | 'bookings' | 'analytics';

export const Dashboard = () => {
  // Add state for active tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Simulate loading state for smoother transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 responsive-p space-y-6 overflow-x-hidden">
        <div className="flex justify-between items-center animate-pulse">
          <div className="h-8 w-64 bg-gray-800 rounded-lg"></div>
          <div className="h-8 w-32 bg-gray-800 rounded-lg"></div>
        </div>
        <div className="h-12 w-full bg-gray-800 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-xl animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 responsive-p space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Header with improved responsiveness */}
      <header className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-between items-start sm:items-center animate-fade-in">
        <div className="space-y-1 sm:space-y-2 w-full sm:w-auto">
          <h1 className="responsive-text-xl font-bold text-gray-100 truncate">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Hotel Management
            </span>
            <span className="text-gray-300 ml-2">Dashboard</span>
          </h1>
          <p className="responsive-text-sm text-gray-400">Real-time operational insights and metrics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end w-full sm:w-auto">
          <NotificationBell />
          <div className="hidden sm:flex">
            <WeatherWidget />
          </div>
        </div>
      </header>

      {/* Tab Navigation with improved styling */}
      <div className="flex border-b border-gray-700 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pb-1 animate-slide-in-down">
        <button
          className={`px-3 py-1.5 sm:px-4 sm:py-2 mr-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
            activeTab === 'dashboard'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`px-3 py-1.5 sm:px-4 sm:py-2 mr-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
            activeTab === 'bookings'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
        <button
          className={`px-3 py-1.5 sm:px-4 sm:py-2 mr-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
            activeTab === 'analytics'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {/* Dashboard Content with improved animations and layout */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Priority Metrics */}
          <div className="dashboard-grid-2 lg:grid-cols-[1fr_2fr] gap-3 sm:gap-4 lg:gap-6">
            <div className="animate-slide-in-left" style={{animationDelay: '0.1s'}}>
              <TodayStatus />
            </div>
            <div className="dashboard-grid-4 animate-slide-in-right" style={{animationDelay: '0.2s'}}>
              <KeyInsights />
              <OccupancyRate />
              <ADRDisplay />
              <CanceledBookings />
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="dashboard-grid-2 animate-slide-in-up" style={{animationDelay: '0.3s'}}>
            <MemberVsGeneralChart />
            <AgeGroupSegmentation />
          </div>

          {/* Revenue Analysis Section */}
          <div className="dashboard-grid-2 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
            <RevenueSourceBreakdown />
            <BookingChannelAnalysis />
          </div>

          {/* Year-over-Year & Room Performance */}
          <div className="dashboard-grid-2 animate-slide-in-up" style={{animationDelay: '0.5s'}}>
            <YearOverYearComparison />
            <RoomTypePerformance />
          </div>

          {/* Guest Loyalty & Detailed Analysis */}
          <div className="dashboard-grid-2 animate-slide-in-up" style={{animationDelay: '0.6s'}}>
            <LoyaltyTierPerformance />
            <GuestSatisfaction />
          </div>

          {/* Detailed View Section */}
          <div className="dashboard-grid-1 lg:grid-cols-[1.5fr_1fr] gap-3 sm:gap-4 lg:gap-6 animate-slide-in-up" style={{animationDelay: '0.7s'}}>
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <ArrivalStats />
              <div className="dashboard-grid-1 gap-3 sm:gap-4 lg:gap-6">
                <RevenueForecast />
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="dashboard-card">
                <BirthdayList />
              </div>
              {/* Report section with improved styling */}
              <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl responsive-p shadow-xl border border-blue-700/30">
                <h3 className="dashboard-card-title mb-3 sm:mb-4">Reports & Analytics</h3>
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
                <p className="responsive-text-sm text-gray-400 mt-2 sm:mt-3">
                  Includes all current metrics, charts, and AI-powered insights
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Content with improved styling */}
      {activeTab === 'bookings' && (
        <div className="dashboard-card animate-fade-in">
          <h2 className="dashboard-card-title mb-3 sm:mb-4">Bookings Overview</h2>
          <BookingsOverview />
        </div>
      )}
      
      {/* Analytics Content */}
      {activeTab === 'analytics' && (
        <div className="dashboard-grid-1 gap-6 animate-fade-in">
          <div className="dashboard-card">
            <h2 className="dashboard-card-title mb-6">Advanced Analytics</h2>
            
            <div className="dashboard-grid-2 gap-6">
              <YearOverYearComparison />
              <RoomTypePerformance />
            </div>
            
            <div className="dashboard-grid-2 gap-6 mt-6">
              <LoyaltyTierPerformance />
              <BookingChannelAnalysis />
            </div>
          </div>
        </div>
      )}

      {/* Chatbot UI */}
      {isChatbotOpen && (
        <div
          className={`fixed bottom-4 right-4 w-full max-w-md transition-all duration-300 ease-in-out z-50 ${
            isChatbotVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          } ${isChatbotMinimized ? 'h-14' : 'h-[600px]'}`}
        >
          <Chatbot onClose={closeChatbot} onMinimize={toggleMinimizeChatbot} isMinimized={isChatbotMinimized} isVisible={isChatbotVisible} />
        </div>
      )}

      {/* Floating action button for chatbot */}
      {!isChatbotOpen && (
        <button
          onClick={openChatbot}
          className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-40 flex items-center justify-center"
        >
          <span className="material-icons text-2xl">chat</span>
        </button>
      )}
    </div>
  );
};