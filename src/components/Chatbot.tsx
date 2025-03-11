// File: Chatbot.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { api, HotelData, HistoricalData } from './api';
import { geminiService } from './GeminiService';

// Import from GuestSatisfaction component
import { GuestSatisfaction } from './GuestSatisfaction';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Define interfaces for Guest Satisfaction data
interface RatingBreakdown {
  stars: number;
  percentage: number;
  count: number;
}

interface SatisfactionMetric {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
}

interface HistoricalRating {
  date: string;
  value: number;
}

interface Review {
  user: string;
  date: string;
  rating: number;
  comment: string;
  verified: boolean;
}

interface GuestSatisfactionData {
  rating: number;
  ratingTrend: {
    direction: 'up' | 'down' | 'stable';
    value: number;
  };
  ratingHistory: HistoricalRating[];
  ratingBreakdown: RatingBreakdown[];
  metrics: SatisfactionMetric[];
  reviews: Review[];
  responseRate: number;
  avgResponseTime: string;
}

// Function to get guest satisfaction data
const getGuestSatisfactionData = (): GuestSatisfactionData => {
  // Initialize with the same mock data from GuestSatisfaction component
  const initialHistory = Array.from({ length: 6 }, (_, i) => ({
    date: `2023-0${i + 1}`,
    value: +(4 + Math.random() * 0.5).toFixed(1)
  }));
  
  const initialBreakdown = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    percentage: Math.floor(Math.random() * (50 - 5 * stars) + 10),
    count: Math.floor(Math.random() * 500 + 50)
  })).sort((a, b) => b.stars - a.stars);

  const metrics: SatisfactionMetric[] = [
    { name: 'Service', value: 4.5, trend: 'up', percentChange: 5.2 },
    { name: 'Cleanliness', value: 4.7, trend: 'up', percentChange: 2.1 },
    { name: 'Amenities', value: 4.0, trend: 'down', percentChange: 1.8 },
    { name: 'Value', value: 3.9, trend: 'stable', percentChange: 0.3 },
  ];

  const reviews = [
    { user: 'John D.', date: '3 days ago', rating: 5, verified: true,
      comment: 'Exceptional service and beautiful accommodations. The staff went above and beyond!' },
    { user: 'Sarah M.', date: '1 week ago', rating: 4, verified: true,
      comment: 'Great location and comfortable rooms. Breakfast was amazing!' },
    { user: 'Michael T.', date: '2 weeks ago', rating: 3, verified: true,
      comment: 'Room cleanliness could be improved. Staff was friendly but seemed understaffed.' },
  ];

  // Calculate trend based on rating history
  const rating = 4.3;
  const last = initialHistory[initialHistory.length - 1].value;
  const prev = initialHistory[initialHistory.length - 2].value;
  const diff = last - prev;
  const percent = (diff / prev) * 100;

  const ratingTrend = {
    direction: diff > 0.05 ? 'up' : diff < -0.05 ? 'down' : 'stable' as 'up' | 'down' | 'stable',
    value: +percent.toFixed(1)
  };

  return {
    rating,
    ratingTrend,
    ratingHistory: initialHistory,
    ratingBreakdown: initialBreakdown,
    metrics,
    reviews,
    responseRate: 87,
    avgResponseTime: '12h'
  };
};

// Data analysis functions
const analyzeOccupancyTrends = (historicalData: HistoricalData[]): string => {
  if (!historicalData || historicalData.length < 2) return "Insufficient historical data for trend analysis.";
  
  const occupancyRates = historicalData.map(data => data.occupancy_and_adr.occupancy_rate);
  const avgOccupancy = occupancyRates.reduce((sum, rate) => sum + rate, 0) / occupancyRates.length;
  
  // Calculate trend
  const recentTrend = occupancyRates[occupancyRates.length - 1] - occupancyRates[occupancyRates.length - 2];
  const trendDescription = recentTrend > 2 ? "strong upward" : 
                           recentTrend > 0 ? "slight upward" : 
                           recentTrend < -2 ? "strong downward" : 
                           recentTrend < 0 ? "slight downward" : "stable";
  
  return `Occupancy shows a ${trendDescription} trend with an average of ${avgOccupancy.toFixed(1)}% over the past ${historicalData.length} months.`;
};

const analyzeCancellationPatterns = (historicalData: HistoricalData[]): string => {
  if (!historicalData || historicalData.length < 2) return "Insufficient data for cancellation analysis.";
  
  const cancellationRates = historicalData.map(data => data.canceled_bookings.canceled_percentage);
  const avgCancellationRate = cancellationRates.reduce((sum, rate) => sum + rate, 0) / cancellationRates.length;
  const mostRecentRate = cancellationRates[cancellationRates.length - 1];
  
  // Compare current to average
  const comparisonToAvg = mostRecentRate > avgCancellationRate * 1.2 ? "significantly higher than" :
                          mostRecentRate > avgCancellationRate * 1.05 ? "slightly higher than" :
                          mostRecentRate < avgCancellationRate * 0.8 ? "significantly lower than" :
                          mostRecentRate < avgCancellationRate * 0.95 ? "slightly lower than" : "in line with";
  
  return `Current cancellation rate (${mostRecentRate.toFixed(1)}%) is ${comparisonToAvg} the historical average of ${avgCancellationRate.toFixed(1)}%.`;
};

const analyzeRevenueInsights = (historicalData: HistoricalData[]): string => {
  if (!historicalData || historicalData.length < 2) return "Insufficient data for revenue analysis.";
  
  const monthlyRevenues = historicalData.map(data => data.total_income.total_income_month);
  const totalRevenue = monthlyRevenues.reduce((sum, revenue) => sum + revenue, 0);
  const avgMonthlyRevenue = totalRevenue / monthlyRevenues.length;
  
  // Calculate growth rate
  const currentRevenue = monthlyRevenues[monthlyRevenues.length - 1];
  const previousRevenue = monthlyRevenues[monthlyRevenues.length - 2];
  const growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  
  return `Monthly revenue is ${growthRate > 0 ? "up" : "down"} by ${Math.abs(growthRate).toFixed(1)}% month-over-month with an average of ${avgMonthlyRevenue.toFixed(0)} per month.`;
};

const correlateOccupancyAndSatisfaction = (
  historicalData: HistoricalData[], 
  guestSatisfaction: GuestSatisfactionData
): string => {
  if (!historicalData || historicalData.length < 1) return "Insufficient data for correlation analysis.";
  
  const currentOccupancy = historicalData[historicalData.length - 1].occupancy_and_adr.occupancy_rate;
  
  let correlation = "No clear correlation found between occupancy and satisfaction.";
  
  if (currentOccupancy > 80 && guestSatisfaction.rating < 4.0) {
    correlation = "High occupancy (>80%) may be negatively impacting guest satisfaction scores.";
  } else if (currentOccupancy > 80 && guestSatisfaction.rating > 4.5) {
    correlation = "Despite high occupancy (>80%), guest satisfaction remains excellent (>4.5).";
  } else if (currentOccupancy < 60 && guestSatisfaction.rating < 4.0) {
    correlation = "Both occupancy (<60%) and guest satisfaction (<4.0) are underperforming.";
  }
  
  return correlation;
};

// Primary data fetching and analysis function
const generateDataSummary = async (): Promise<string> => {
  try {
    // Fetch all data at once using the comprehensive API method
    const allData = await api.getAllDashboardData();
    const { currentData, historicalData, yoyComparison } = allData;
    
    // Get guest satisfaction data
    const guestSatisfaction = getGuestSatisfactionData();
    
    // Generate insights from data
    const occupancyTrend = analyzeOccupancyTrends(historicalData);
    const cancellationInsight = analyzeCancellationPatterns(historicalData);
    const revenueInsight = analyzeRevenueInsights(historicalData);
    const occupancySatisfactionCorrelation = correlateOccupancyAndSatisfaction(historicalData, guestSatisfaction);
    
    // YoY comparison insights
    const occupancyYoY = yoyComparison.occupancy;
    const currentYearOccupancy = occupancyYoY[occupancyYoY.length - 1].value;
    const prevYearOccupancy = occupancyYoY[occupancyYoY.length - 2].value;
    const occupancyYoYChange = ((currentYearOccupancy - prevYearOccupancy) / prevYearOccupancy) * 100;
    
    // Current metrics summary
    const currentSummary = `
Current Dashboard Metrics:
- Booking Arrivals: Current Month: ${currentData.bookingArrivals.current_month_arrivals}, Current Year: ${currentData.bookingArrivals.current_year_arrivals}, Percentage: ${currentData.bookingArrivals.percentage_current_month}%
- Member vs General: Members: ${currentData.memberVsGeneral.member_arrivals}, General: ${currentData.memberVsGeneral.general_arrivals}
- Today Status: Arrivals: ${currentData.todayStatus.today_arrivals}, Departures: ${currentData.todayStatus.today_departures}
- Occupancy: ${currentData.occupancyAndADR.occupancy_rate}%, ADR: ${currentData.occupancyAndADR.adr}
- Age Groups: Child: ${currentData.ageGroups.child}, Adult: ${currentData.ageGroups.adult}, Middle Age: ${currentData.ageGroups.middle_age}, Elder: ${currentData.ageGroups.elder}
- Canceled Bookings: ${currentData.canceledBookings.canceled_bookings} (${currentData.canceledBookings.canceled_percentage}%)
- Total Income: Month: ${currentData.totalIncome.total_income_month}, Year: ${currentData.totalIncome.total_income_year}
`;

    // Analytics and insights
    const analyticsInsights = `
Key Analytics Insights:
- ${occupancyTrend}
- ${cancellationInsight}
- ${revenueInsight}
- Year-over-Year occupancy is ${occupancyYoYChange > 0 ? "up" : "down"} by ${Math.abs(occupancyYoYChange).toFixed(1)}%.
- ${occupancySatisfactionCorrelation}
- Most booked unit: ${currentData.mostBookedUnit.unit_id} with ${currentData.mostBookedUnit.booking_count} bookings.
`;

    // Guest satisfaction summary
    const satisfactionSummary = `
Guest Satisfaction Metrics:
- Overall Rating: ${guestSatisfaction.rating.toFixed(1)}/5.0 (${guestSatisfaction.ratingTrend.direction}, ${Math.abs(guestSatisfaction.ratingTrend.value)}%)
- Rating Breakdown: ${guestSatisfaction.ratingBreakdown.map(rb => `${rb.stars}★: ${rb.percentage}% (${rb.count} reviews)`).join(', ')}
- Category Ratings: ${guestSatisfaction.metrics.map(m => `${m.name}: ${m.value.toFixed(1)} (${m.trend}, ${m.percentChange}%)`).join(', ')}
- Response Rate: ${guestSatisfaction.responseRate}%
- Average Response Time: ${guestSatisfaction.avgResponseTime}
- Recent Reviews: ${guestSatisfaction.reviews.length} reviews in the last 14 days
`;

    // Actionable recommendations 
    let recommendations = "Actionable Recommendations:\n";
    
    // Based on occupancy and satisfaction
    if (currentData.occupancyAndADR.occupancy_rate < 65) {
      recommendations += "- Consider promotional packages to boost low occupancy rate.\n";
    }
    
    // Based on cancellation rates
    if (currentData.canceledBookings.canceled_percentage > 15) {
      recommendations += "- Review cancellation policies and consider offering more flexible booking options.\n";
    }
    
    // Based on guest satisfaction metrics
    const lowestMetric = guestSatisfaction.metrics.reduce((prev, curr) => 
      prev.value < curr.value ? prev : curr, guestSatisfaction.metrics[0]);
    
    recommendations += `- Focus on improving ${lowestMetric.name.toLowerCase()} (rated ${lowestMetric.value.toFixed(1)}/5) to boost overall satisfaction.\n`;
    
    // Based on member vs general
    const memberPercentage = (currentData.memberVsGeneral.member_arrivals / 
      (currentData.memberVsGeneral.member_arrivals + currentData.memberVsGeneral.general_arrivals)) * 100;
    
    if (memberPercentage < 40) {
      recommendations += "- Enhance loyalty program benefits to increase member bookings.\n";
    }

    return currentSummary + analyticsInsights + satisfactionSummary + recommendations;
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

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          role: 'assistant', 
          content: "Hi there! I'm your Hotel Analytics Assistant. I can help analyze occupancy trends, guest satisfaction, revenue, and more. What would you like to know about your hotel's performance?"
        }
      ]);
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
      const prompt = `You are an AI analytics assistant for a hotel management dashboard. Provide concise and relevant answers based on the following data:\n${summary}\nQuestion: ${input}. Focus on providing actionable insights when possible and correlations between different metrics like occupancy and guest satisfaction. Keep it short and straightforward. keep the reponse in bullet point`;
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

  const handleReset = () => {
    setMessages([
      { 
        role: 'assistant', 
        content: "Chat has been reset. How can I help you with your hotel analytics today?"
      }
    ]);
  };

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