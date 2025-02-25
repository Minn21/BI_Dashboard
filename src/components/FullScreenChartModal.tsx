'use client';
import React, { useState, useEffect } from 'react';
import { X, FileText, BarChart, Download, RotateCcw, BrainCircuit } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

// Define types for our charts
interface MemberVsGeneralData {
  name: string;
  value: number;
}

interface AgeGroupData {
  name: string;
  value: number;
  additionalContext?: string;
}

interface FullScreenChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartType: 'memberVsGeneral' | 'ageGroups';
  data: MemberVsGeneralData[] | AgeGroupData[];
  title: string;
}

export function FullScreenChartModal({ isOpen, onClose, chartType, data, title }: FullScreenChartModalProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'data'>('chart');
  const [chartHeight, setChartHeight] = useState(400);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Handle responsive sizing
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Adjust chart height based on viewport and analysis visibility
      const baseHeight = window.innerWidth < 768 ? 300 : 400;
      setChartHeight(showAnalysis ? baseHeight * 0.6 : baseHeight);
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showAnalysis]);

  // Recalculate chart height when analysis state changes
  useEffect(() => {
    const baseHeight = window.innerWidth < 768 ? 300 : 400;
    setChartHeight(showAnalysis ? baseHeight * 0.6 : baseHeight);
  }, [showAnalysis]);

  if (!isOpen) return null;

  // Colors for the charts
  const MEMBER_COLORS = ['#3B82F6', '#10B981'];
  const AGE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  // Calculate the total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Handle analyze with AI action
  const handleAnalyzeWithAI = () => {
    setIsAnalyzing(true);
    setShowAnalysis(true);
    
    // Simulate AI analysis with a timeout
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisCompleted(true);
    }, 2000);
  };

  // Reset the analysis state
  const handleResetAnalysis = () => {
    setShowAnalysis(false);
    setAnalysisCompleted(false);
  };

  // Mock function for export data
  const handleExportData = () => {
    alert('Exporting data...');
    // In a real implementation, this would generate and download a CSV/Excel file
  };

  // AI analysis content based on chart type
  const renderAnalysisContent = () => {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-12 h-12 md:w-16 md:h-16 border-t-4 border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300 text-sm md:text-base">AI is analyzing your data...</p>
        </div>
      );
    }

    if (chartType === 'memberVsGeneral') {
      return (
        <div className="p-3 md:p-6 bg-gray-800 rounded-lg text-sm md:text-base">
          <h3 className="text-lg md:text-xl text-blue-400 mb-2 md:mb-4">AI Analysis: Member vs General Guests</h3>
          <div className="space-y-2 md:space-y-4 text-gray-300">
            <p>
              <span className="font-semibold">Key Finding:</span> Your property has a {data[0].value > data[1].value ? 'higher' : 'lower'} percentage 
              of members ({data[0].value}%) compared to general guests ({data[1].value}%).
            </p>
            <p>
              <span className="font-semibold">Insight:</span> {data[0].value > 60 ? 
                'Your high member percentage indicates strong loyalty and repeat business. Consider implementing more exclusive member benefits to further leverage this advantage.' : 
                'There\'s an opportunity to convert more general guests into members. Consider enhancing your loyalty program benefits or offering special promotions for first-time members.'}
            </p>
            <p>
              <span className="font-semibold">Recommendation:</span> {data[0].value > data[1].value ? 
                'Focus on member retention strategies and upselling premium services to your loyal customer base.' : 
                'Implement a targeted marketing campaign to increase membership sign-ups during check-in.'}
            </p>
            <p>
              <span className="font-semibold">Benchmark:</span> The industry average for member bookings is approximately 55%. Your property is 
              {data[0].value > 55 ? ' above ' : ' below '} this benchmark.
            </p>
          </div>
        </div>
      );
    } else {
      // Age groups analysis
      const youngestGroup = [...data].sort((a, b) => b.value - a.value)[0];
      const oldestGroup = data.find(group => group.name === 'Elder');
      const adultGroups = data.filter(group => group.name === 'Adult' || group.name === 'Middle Age');
      const adultTotal = adultGroups.reduce((sum, item) => sum + item.value, 0);
      
      return (
        <div className="p-3 md:p-6 bg-gray-800 rounded-lg text-sm md:text-base">
          <h3 className="text-lg md:text-xl text-blue-400 mb-2 md:mb-4">AI Analysis: Guest Age Demographics</h3>
          <div className="space-y-2 md:space-y-4 text-gray-300">
            <p>
              <span className="font-semibold">Key Finding:</span> Your largest guest demographic is the {youngestGroup.name} group 
              at {((youngestGroup.value / total) * 100).toFixed(1)}% of total guests.
            </p>
            <p>
              <span className="font-semibold">Insight:</span> {adultTotal > total * 0.6 ? 
                'Your property appeals strongly to working-age adults. Consider business amenities and services to enhance their stay.' : 
                'Your property has a diverse age distribution, suggesting family-friendly appeal.'}
            </p>
            <p>
              <span className="font-semibold">Recommendation:</span> {oldestGroup && oldestGroup.value > total * 0.2 ? 
                'With a significant elder demographic, consider enhancing accessibility features and offering services tailored to seniors.' : 
                youngestGroup.name === 'Child' ? 
                'With many families visiting, consider expanding children\'s activities and family packages.' :
                'Focus marketing efforts on the dominant ' + youngestGroup.name + ' demographic to maximize occupancy.'}
            </p>
            <p>
              <span className="font-semibold">Trend Analysis:</span> The current age distribution suggests 
              {youngestGroup.name === 'Adult' || youngestGroup.name === 'Middle Age' ? 
                ' business and leisure travel is your primary market.' : 
                youngestGroup.name === 'Child' ? 
                ' family vacations are a key driver for your bookings.' : 
                ' you have a unique opportunity to specialize in senior-friendly accommodations.'}
            </p>
          </div>
        </div>
      );
    }
  };

  // Custom label component for pie chart that is responsive
  const renderCustomizedLabel = ({ name, value, cx, cy, midAngle, innerRadius, outerRadius, percent, index }: { name: string; value: number; cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; index: number }) => {
    if (isMobile) return null; // Skip labels on mobile
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name}: ${chartType === 'memberVsGeneral' ? value : ((value / total) * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-3 md:p-4 flex items-center justify-between border-b border-gray-800">
          <h2 className="text-lg md:text-xl font-bold text-gray-100 truncate">{title}</h2>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={handleExportData}
              className="text-gray-400 hover:text-gray-200 p-1 md:p-2 rounded-full transition-colors"
              title="Export data"
            >
              <Download size={isMobile ? 18 : 20} />
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 p-1 md:p-2 rounded-full transition-colors"
              title="Close"
            >
              <X size={isMobile ? 18 : 20} />
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800">
          <button 
            className={`px-3 md:px-4 py-2 font-medium text-sm md:text-base ${activeTab === 'chart' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('chart')}
          >
            <div className="flex items-center gap-1 md:gap-2">
              <BarChart size={isMobile ? 16 : 18} />
              <span>Chart</span>
            </div>
          </button>
          <button 
            className={`px-3 md:px-4 py-2 font-medium text-sm md:text-base ${activeTab === 'data' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('data')}
          >
            <div className="flex items-center gap-1 md:gap-2">
              <FileText size={isMobile ? 16 : 18} />
              <span>Data</span>
            </div>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-3 md:p-6">
          {activeTab === 'chart' && (
            <div className="flex flex-col h-full">
              {/* Chart display */}
              <div className={`flex-1 ${showAnalysis ? 'h-1/2' : 'h-full'}`}>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  {chartType === 'memberVsGeneral' ? (
                    <PieChart>
                      <Pie
                        data={data}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={isMobile ? 100 : 160}
                        innerRadius={isMobile ? 60 : 100}
                        paddingAngle={5}
                        stroke="none"
                        label={isMobile ? undefined : renderCustomizedLabel}
                        labelLine={false}
                      >
                        {data.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={MEMBER_COLORS[index % MEMBER_COLORS.length]}
                            className="hover:opacity-80 transition-opacity duration-300"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: 'none',
                          borderRadius: '0.5rem',
                          padding: '0.5rem',
                        }}
                        itemStyle={{ color: '#E5E7EB' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconSize={isMobile ? 8 : 10}
                        formatter={(value, entry) => (
                          <span className="text-xs md:text-sm text-gray-300">{value}</span>
                        )}
                      />
                    </PieChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={data}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={isMobile ? 100 : 160}
                        innerRadius={isMobile ? 60 : 100}
                        paddingAngle={3}
                        stroke="none"
                        label={isMobile ? undefined : renderCustomizedLabel}
                        labelLine={false}
                      >
                        {data.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={AGE_COLORS[index % AGE_COLORS.length]}
                            className="hover:opacity-80 transition-opacity duration-300"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: 'none',
                          borderRadius: '0.5rem',
                          padding: '0.5rem',
                        }}
                        itemStyle={{ color: '#E5E7EB' }}
                        formatter={(value: number) => [`${value} guests (${((value / total) * 100).toFixed(1)}%)`, '']}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconSize={isMobile ? 8 : 10}
                        formatter={(value, entry) => (
                          <span className="text-xs md:text-sm text-gray-300">{value}</span>
                        )}
                      />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
              
              {/* AI Analysis button or section */}
              {!showAnalysis ? (
                <div className="flex justify-center mt-3 md:mt-6">
                  <button
                    onClick={handleAnalyzeWithAI}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-1 md:gap-2 transition-colors text-sm md:text-base"
                  >
                    <BrainCircuit size={isMobile ? 16 : 20} />
                    <span>Analyze with AI</span>
                  </button>
                </div>
              ) : (
                <div className="mt-3 md:mt-6">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h3 className="text-base md:text-lg font-medium text-gray-200 flex items-center gap-1 md:gap-2">
                      <BrainCircuit className="text-blue-400" size={isMobile ? 16 : 20} />
                      AI Analysis
                    </h3>
                    {analysisCompleted && (
                      <button
                        onClick={handleResetAnalysis}
                        className="text-gray-400 hover:text-gray-200 flex items-center gap-1 text-xs md:text-sm"
                      >
                        <RotateCcw size={isMobile ? 12 : 14} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                  {renderAnalysisContent()}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'data' && (
            <div className="overflow-x-auto -mx-3 md:-mx-6">
              <table className="w-full text-gray-300 text-sm md:text-base">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 md:py-3 px-3 md:px-4">Category</th>
                    <th className="text-right py-2 md:py-3 px-3 md:px-4">Value</th>
                    <th className="text-right py-2 md:py-3 px-3 md:px-4">Percentage</th>
                    {chartType === 'ageGroups' && (
                      <th className="text-left py-2 md:py-3 px-3 md:px-4">Notes</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="border-b border-gray-800">
                      <td className="py-2 md:py-3 px-3 md:px-4 flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: chartType === 'memberVsGeneral' 
                              ? MEMBER_COLORS[index % MEMBER_COLORS.length]
                              : AGE_COLORS[index % AGE_COLORS.length]
                          }}
                        ></div>
                        {item.name}
                      </td>
                      <td className="text-right py-2 md:py-3 px-3 md:px-4">{item.value}</td>
                      <td className="text-right py-2 md:py-3 px-3 md:px-4">{((item.value / total) * 100).toFixed(1)}%</td>
                      {chartType === 'ageGroups' && (
                        <td className="text-left py-2 md:py-3 px-3 md:px-4 text-gray-400 text-xs md:text-sm">
                          {(item as AgeGroupData).additionalContext || 'No additional data'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-800/50">
                  <tr>
                    <td className="py-2 md:py-3 px-3 md:px-4 font-medium">Total</td>
                    <td className="text-right py-2 md:py-3 px-3 md:px-4 font-medium">{total}</td>
                    <td className="text-right py-2 md:py-3 px-3 md:px-4 font-medium">100%</td>
                    {chartType === 'ageGroups' && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 md:p-4 border-t border-gray-800 flex flex-col md:flex-row justify-between text-xs md:text-sm text-gray-400">
          <div className="mb-1 md:mb-0">Last updated: {new Date().toLocaleDateString()}</div>
          <div>Data source: Hotel Management System</div>
        </div>
      </div>
    </div>
  );
}

export default FullScreenChartModal;