// File: Chatbot.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { api, HotelData, HistoricalData } from './api';
import { geminiService } from './GeminiService';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const generateDataSummary = async (): Promise<string> => {
  try {
    // Fetch all current data directly from API
    const bookingArrivals = await api.getBookingArrivals();
    const memberVsGeneral = await api.getMemberVsGeneral();
    const todayStatus = await api.getTodayStatus();
    const occupancyAdr = await api.getOccupancyAndADR();
    const ageGroups = await api.getAgeGroups();
    const canceledBookings = await api.getCanceledBookings();
    const totalIncome = await api.getTotalIncome();
    
    // Fetch historical data
    const historical = await api.getHistoricalData();

    const currentSummary = `
Current Dashboard Metrics:
- Booking Arrivals: Current Month: ${bookingArrivals.current_month_arrivals}, Current Year: ${bookingArrivals.current_year_arrivals}, Percentage: ${bookingArrivals.percentage_current_month}%
- Member vs General: Members: ${memberVsGeneral.member_arrivals}, General: ${memberVsGeneral.general_arrivals}
- Today Status: Arrivals: ${todayStatus.today_arrivals}, Departures: ${todayStatus.today_departures}
- Occupancy: ${occupancyAdr.occupancy_rate}%, ADR: ${occupancyAdr.adr}
- Age Groups: Child: ${ageGroups.child}, Adult: ${ageGroups.adult}, Middle Age: ${ageGroups.middle_age}, Elder: ${ageGroups.elder}
- Canceled Bookings: ${canceledBookings.canceled_bookings} (${canceledBookings.canceled_percentage}%)
- Total Income: Month: ${totalIncome.total_income_month}, Year: ${totalIncome.total_income_year}
`;

    let historicalSummary = '';
    if (historical?.length > 0) {
      const totalMonths = historical.length;
      const avgOccupancy = historical.reduce((sum, data) => sum + data.occupancy_and_adr.occupancy_rate, 0) / totalMonths;
      const totalHistoricalIncome = historical.reduce((sum, data) => sum + data.total_income.total_income_month, 0);
      historicalSummary = `
Historical Trends (over ${totalMonths} months):
- Average Occupancy Rate: ${avgOccupancy.toFixed(1)}%
- Total Income: ${totalHistoricalIncome}
`;
    }
    return currentSummary + historicalSummary;
  } catch (error) {
    console.error('Error generating data summary:', error);
    return 'Error retrieving hotel data. Please try again.';
  }
};

interface ChatbotProps {
  onClose: () => void;
  isVisible: boolean;
  isMinimized: boolean;
  onMinimize: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onClose, isVisible, isMinimized, onMinimize }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const summary = await generateDataSummary();
      const prompt = `You are an AI analytics assistant for a hotel management dashboard. Provide concise and relevant answers based on the following data:\n${summary}\nQuestion: ${input}.`;
      const response = await geminiService.askQuestion(prompt);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error('Error getting AI response:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => setMessages([]);

  // When minimized, show only a floating button
  if (isMinimized) {
    return (
      <button
        onClick={onMinimize}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center z-40 transition-all"
      >
        <span className="text-2xl">💬</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 transform ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-gray-800 rounded-lg shadow-xl flex flex-col w-80 sm:w-96 h-96 sm:h-[450px] border border-gray-700">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
          <h3 className="text-base font-medium text-white">Hotel Analytics Assistant</h3>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
              title="Reset chat"
            >
              ↻
            </button>
            <button
              onClick={onMinimize}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
              title="Minimize"
            >
              _
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-gray-400 text-sm text-center p-4">
              Ask me about occupancy rates, bookings, or any other hotel metrics!
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <span
                className={`inline-block p-3 rounded-lg max-w-[85%] text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                {msg.content}
              </span>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <span className="bg-gray-700 text-gray-100 p-3 rounded-lg text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 p-2 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="Ask about hotel metrics..."
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              disabled={isLoading}
            >
              <span>↑</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};