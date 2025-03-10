'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { X, BrainCircuit } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { geminiService } from './GeminiService';

interface CanceledBookingsFullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { 
    current: Array<{ name: string; value: number }>; 
    historical: Array<{ label: string; canceled: number; confirmed: number }>;
  };
  title: string;
}

export function CanceledBookingsFullScreenModal({ isOpen, onClose, data, title }: CanceledBookingsFullScreenModalProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'historical'>('current');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [chartHeight, setChartHeight] = useState(400);
  const [isMobile, setIsMobile] = useState(false);
  const [historicalChartType, setHistoricalChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setChartHeight(showAnalysis ? (isMobileView ? 180 : 240) : (isMobileView ? 300 : 400));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showAnalysis]);

  const COLORS = ['#3B82F6', '#EF4444']; // Blue for Confirmed, Red for Canceled
  const total = useMemo(() => data.current.reduce((sum, item) => sum + item.value, 0), [data.current]);

  const handleAnalyzeWithAI = async () => {
    setIsAnalyzing(true);
    setShowAnalysis(true);
    try {
      const analysisResult = await geminiService.analyzeChartData(
        'canceledBookings',
        activeTab === 'current' ? data.current : data.historical.map(item => ({ name: item.label, value: item.canceled + item.confirmed })),
        activeTab === 'current' ? 'Current Cancellation Analysis' : 'Historical Cancellation Trend Analysis'
      );
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      setAnalysis({
        keyFinding: 'Analysis failed.',
        insight: 'Error occurred while analyzing cancellation data.',
        recommendation: 'Please try again later.',
        additionalInfo: 'Error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderChart = () => {
    if (activeTab === 'current') {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data.current}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? 100 : 160}
              innerRadius={isMobile ? 60 : 100}
              paddingAngle={3}
              stroke="none"
            >
              {data.current.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity duration-300"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', padding: '0.5rem' }}
              itemStyle={{ color: '#E5E7EB' }}
              formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, '']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    } else {
      if (data.historical.length === 0) {
        return <div className="text-gray-400 text-center">Historical data not available</div>;
      }
      return (
        <div className="space-y-4">
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setHistoricalChartType('line')}
              className={`px-3 py-1 rounded ${historicalChartType === 'line' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Line Chart
            </button>
            <button
              onClick={() => setHistoricalChartType('bar')}
              className={`px-3 py-1 rounded ${historicalChartType === 'bar' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Bar Chart
            </button>
          </div>
          <ResponsiveContainer width="100%" height={chartHeight}>
            {historicalChartType === 'line' ? (
              <LineChart data={data.historical}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="confirmed" stroke="#3B82F6" name="Confirmed" />
                <Line type="monotone" dataKey="canceled" stroke="#EF4444" name="Canceled" />
              </LineChart>
            ) : (
              <BarChart data={data.historical}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="confirmed" fill="#3B82F6" name="Confirmed" />
                <Bar dataKey="canceled" fill="#EF4444" name="Canceled" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      );
    }
  };

  const renderAnalysisContent = () => {
    if (isAnalyzing) {
      return <div className="text-gray-300">AI is analyzing cancellation data...</div>;
    }
    if (!analysis) return null;
    return (
      <div className="p-6 bg-gray-800 rounded-lg text-gray-300">
        <h3 className="text-xl text-blue-400 mb-4">AI Cancellation Analysis</h3>
        <p><span className="font-semibold">Key Finding:</span> {analysis.keyFinding}</p>
        <p><span className="font-semibold">Insight:</span> {analysis.insight}</p>
        <p><span className="font-semibold">Recommendation:</span> {analysis.recommendation}</p>
        <p><span className="font-semibold">Additional Info:</span> {analysis.additionalInfo}</p>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <h2 className="text-xl font-bold text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200" title="Close">
            <X size={20} />
          </button>
        </div>
        <div className="flex border-b border-gray-800">
          <button
            className={`px-4 py-2 ${activeTab === 'current' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('current')}
          >
            Current Cancellation Data
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'historical' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('historical')}
          >
            Historical Trends
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {renderChart()}
          {!showAnalysis && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleAnalyzeWithAI}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <BrainCircuit size={20} />
                <span>Analyze Cancellation Data with AI</span>
              </button>
            </div>
          )}
          {showAnalysis && (
            <div className="mt-4">
              {renderAnalysisContent()}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Close Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}