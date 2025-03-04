'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { X, FileText, BarChart, Download, RotateCcw, BrainCircuit } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { geminiService, ChartData, GeminiAnalysisResponse } from './GeminiService';

// Chart type constants to avoid string literals
export const CHART_TYPES = {
  MEMBER_VS_GENERAL: 'memberVsGeneral',
  AGE_GROUPS: 'ageGroups',
  CANCELED_BOOKINGS: 'canceledBookings',
  OCCUPANCY: 'occupancy',
  ARRIVAL_STATS: 'arrivalStats'
} as const;

type ChartType = typeof CHART_TYPES[keyof typeof CHART_TYPES];
type TabType = 'chart' | 'data';

interface FullScreenChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartType: ChartType;
  data: ChartData[];
  title: string;
}

export function FullScreenChartModal({ isOpen, onClose, chartType, data, title }: FullScreenChartModalProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [analysis, setAnalysis] = useState<GeminiAnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('chart');
  const [chartHeight, setChartHeight] = useState(400);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize to adjust UI for mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      const baseHeight = isMobileView ? 300 : 400;
      setChartHeight(showAnalysis ? baseHeight * 0.6 : baseHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showAnalysis]);

  // Calculate total once to avoid repeated calculations
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  // Get chart colors based on chart type
  const COLORS = useMemo(() => {
    switch (chartType) {
      case CHART_TYPES.MEMBER_VS_GENERAL:
        return ['#3B82F6', '#10B981'];
      case CHART_TYPES.AGE_GROUPS:
        return ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
      case CHART_TYPES.CANCELED_BOOKINGS:
        return ['#10B981', '#EF4444']; // Green for confirmed, Red for canceled
      case CHART_TYPES.OCCUPANCY:
        return ['#3B82F6', '#F59E0B']; // Blue for occupied, Orange for available
      case CHART_TYPES.ARRIVAL_STATS:
        return ['#3B82F6', '#10B981'];
      default:
        return ['#3B82F6', '#10B981'];
    }
  }, [chartType]);

  // Handle window resize to adjust UI for mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      const baseHeight = isMobileView ? 300 : 400;
      setChartHeight(showAnalysis ? baseHeight * 0.6 : baseHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showAnalysis]);

  // AI Analysis handler with error handling
  const handleAnalyzeWithAI = async () => {
    setIsAnalyzing(true);
    setShowAnalysis(true);

    try {
      const analysisResult = await geminiService.analyzeChartData(chartType, data, title);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      setAnalysis({
        keyFinding: "Analysis failed.",
        insight: "Unable to retrieve insights due to an error.",
        recommendation: "Please try again later.",
        additionalInfo: "N/A"
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisCompleted(true);
    }
  };

  // Reset analysis state
  const handleResetAnalysis = () => {
    setShowAnalysis(false);
    setAnalysisCompleted(false);
    setAnalysis(null);
  };

  // Generate and download CSV data
  const handleExportData = () => {
    // Format timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const filename = `${title.replace(/\s+/g, '_')}_${chartType}_${timestamp}.csv`;
    
    // Generate CSV content
    const csvContent = generateCSV(data, title, chartType, total);
    
    // Create and trigger download
    downloadCSV(csvContent, filename);
  };

  // Custom label renderer for pie chart
  const renderCustomizedLabel = ({ name, value, cx, cy, midAngle, innerRadius, outerRadius }: { 
    name: string; 
    value: number; 
    cx: number; 
    cy: number; 
    midAngle: number; 
    innerRadius: number; 
    outerRadius: number; 
  }) => {
    if (isMobile) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const displayValue = chartType === CHART_TYPES.MEMBER_VS_GENERAL 
      ? value 
      : `${((value / total) * 100).toFixed(1)}%`;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name}: ${displayValue}`}
      </text>
    );
  };

  // Render analysis content with loading state
  const renderAnalysisContent = () => {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-12 h-12 md:w-16 md:h-16 border-t-4 border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300 text-sm md:text-base">AI is analyzing your data...</p>
        </div>
      );
    }

    if (!analysis) return null;

    return (
      <div className="p-3 md:p-6 bg-gray-800 rounded-lg text-sm md:text-base">
        <h3 className="text-lg md:text-xl text-blue-400 mb-2 md:mb-4">AI Analysis: {title}</h3>
        <div className="space-y-2 md:space-y-4 text-gray-300">
          <p><span className="font-semibold">Key Finding:</span> {analysis.keyFinding}</p>
          <p><span className="font-semibold">Insight:</span> {analysis.insight}</p>
          <p><span className="font-semibold">Recommendation:</span> {analysis.recommendation}</p>
          <p><span className="font-semibold">{chartType === CHART_TYPES.AGE_GROUPS ? 'Trend Analysis' : 'Benchmark'}:</span> {analysis.additionalInfo}</p>
        </div>
      </div>
    );
  };

  // Renders arrival stats card for that specific chart type
  const renderArrivalStats = () => {
    if (chartType !== CHART_TYPES.ARRIVAL_STATS) return null;
    
    const monthlyArrivals = data.find(d => d.name === 'Monthly Arrivals')?.value || 0;
    const yearlyArrivals = data.find(d => d.name === 'Yearly Arrivals')?.value || 0;
    const progressPercentage = yearlyArrivals > 0 
      ? (monthlyArrivals / yearlyArrivals) * 100 
      : 0;

    return (
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 mb-2">Monthly Arrivals</h3>
            <div className="text-3xl font-bold text-blue-400">{monthlyArrivals}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 mb-2">Yearly Arrivals</h3>
            <div className="text-3xl font-bold text-green-400">{yearlyArrivals}</div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 mb-2">Progress Toward Yearly Goal</h3>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-gray-300 mt-2 text-sm">
            Current progress: {progressPercentage.toFixed(1)}%
          </p>
        </div>
      </div>
    );
  };

  // Render chart tab content
  const renderChartTab = () => (
    <div className="flex flex-col h-full">
      <div className={`flex-1 ${showAnalysis ? 'h-1/2' : 'h-full'}`}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? 100 : 160}
              innerRadius={isMobile ? 60 : 100}
              paddingAngle={chartType === CHART_TYPES.AGE_GROUPS ? 3 : 5}
              stroke="none"
              label={isMobile ? undefined : renderCustomizedLabel}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
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
              formatter={(value: number) => chartType === CHART_TYPES.MEMBER_VS_GENERAL 
                ? [`${value}`, ''] 
                : [`${value} (${((value / total) * 100).toFixed(1)}%)`, '']
              }
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconSize={isMobile ? 8 : 10}
              formatter={(value) => (
                <span className="text-xs md:text-sm text-gray-300">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

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
  );

  // Render data tab content
  const renderDataTab = () => (
    <div className="overflow-x-auto -mx-3 md:-mx-6">
      <table className="w-full text-gray-300 text-sm md:text-base">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-2 md:py-3 px-3 md:px-4">Category</th>
            <th className="text-right py-2 md:py-3 px-3 md:px-4">Value</th>
            <th className="text-right py-2 md:py-3 px-3 md:px-4">Percentage</th>
            {chartType === CHART_TYPES.AGE_GROUPS && (
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
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                {item.name}
              </td>
              <td className="text-right py-2 md:py-3 px-3 md:px-4">{item.value}</td>
              <td className="text-right py-2 md:py-3 px-3 md:px-4">{((item.value / total) * 100).toFixed(1)}%</td>
              {chartType === CHART_TYPES.AGE_GROUPS && (
                <td className="text-left py-2 md:py-3 px-3 md:px-4 text-gray-400 text-xs md:text-sm">
                  {item.additionalContext || 'No additional data'}
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
            {chartType === CHART_TYPES.AGE_GROUPS && <td></td>}
          </tr>
        </tfoot>
      </table>
    </div>
  );

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
              aria-label="Export data"
            >
              <Download size={isMobile ? 18 : 20} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 p-1 md:p-2 rounded-full transition-colors"
              title="Close"
              aria-label="Close modal"
            >
              <X size={isMobile ? 18 : 20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800">
          <TabButton 
            isActive={activeTab === 'chart'} 
            onClick={() => setActiveTab('chart')}
            icon={<BarChart size={isMobile ? 16 : 18} />}
            label="Chart"
            isMobile={isMobile}
          />
          <TabButton 
            isActive={activeTab === 'data'} 
            onClick={() => setActiveTab('data')}
            icon={<FileText size={isMobile ? 16 : 18} />}
            label="Data"
            isMobile={isMobile}
          />
        </div>

        <div className="flex-1 overflow-auto p-3 md:p-6">
          {activeTab === 'chart' && renderChartTab()}
          {activeTab === 'data' && renderDataTab()}
          {renderArrivalStats()}
        </div>

        <div className="p-3 md:p-4 border-t border-gray-800 flex flex-col md:flex-row justify-between text-xs md:text-sm text-gray-400">
          <div className="mb-1 md:mb-0">Last updated: {new Date().toLocaleDateString()}</div>
          <div>Data source: Hotel Management System</div>
        </div>
      </div>
    </div>
  );
}

// Tab button component to reduce repetition
interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isMobile: boolean;
}

const TabButton = ({ isActive, onClick, icon, label, isMobile }: TabButtonProps) => (
  <button
    className={`px-3 md:px-4 py-2 font-medium text-sm md:text-base ${
      isActive ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-1 md:gap-2">
      {icon}
      <span>{label}</span>
    </div>
  </button>
);

// Helper function to generate CSV content
function generateCSV(
  data: ChartData[], 
  title: string, 
  chartType: ChartType, 
  total: number
): string {
  // Get current date and time for metadata
  const now = new Date();
  const formattedDateTime = now.toLocaleString();
  
  // Add metadata at the top of the CSV
  const metadata = [
    `"${title}"`,
    `"Data Source: Hotel Management System"`,
    `"Last Updated: ${formattedDateTime}"`,
    `"Exported: ${formattedDateTime}"`,
    ''  // Empty line to separate metadata from data
  ];
  
  // Create CSV header based on chart type
  let header = 'Category,Value,Percentage';
  if (chartType === CHART_TYPES.AGE_GROUPS) {
    header += ',Notes';
  }
  
  // Generate rows
  const rows = data.map(item => {
    const percentage = ((item.value / total) * 100).toFixed(1);
    let row = `"${item.name}",${item.value},${percentage}%`;
    
    // Add notes column for age groups if available
    if (chartType === CHART_TYPES.AGE_GROUPS) {
      const notes = item.additionalContext || 'No additional data';
      row += `,"${notes}"`;
    }
    
    return row;
  });
  
  // Add total row
  let totalRow = `"Total",${total},100%`;
  if (chartType === CHART_TYPES.AGE_GROUPS) {
    totalRow += ',';
  }
  
  // Combine metadata, header and all rows
  return [...metadata, header, ...rows, totalRow].join('\n');
}

// Helper function to download CSV
function downloadCSV(csvContent: string, filename: string): void {
  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element to trigger the download
  const link = document.createElement('a');
  
  // Set the download attributes
  link.href = url;
  link.setAttribute('download', filename);
  
  // Append to the document
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default FullScreenChartModal;