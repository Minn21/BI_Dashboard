'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { X, BrainCircuit } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { geminiService } from './GeminiService';

interface ArrivalStatsFullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { current: Array<{ name: string; value: number }>, historical: any[] };
  title: string;
}

export function ArrivalStatsFullScreenModal({ isOpen, onClose, data, title }: ArrivalStatsFullScreenModalProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [chartHeight, setChartHeight] = useState(400);
  const [isMobile, setIsMobile] = useState(false);
  const [chartType, setChartType] = useState<'pie' | 'line' | 'bar'>('pie');

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setChartHeight(isMobileView ? 300 : 400);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const COLORS = ['#3B82F6', '#10B981'];
  const total = useMemo(() => data.current.reduce((sum, item) => sum + item.value, 0), [data.current]);

  const handleAnalyzeWithAI = async () => {
    setIsAnalyzing(true);
    setShowAnalysis(true);
    try {
      const analysisResult = await geminiService.analyzeChartData(
        'arrivalStats',
        data.current,
        'Arrival Statistics Analysis'
      );
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      setAnalysis({
        keyFinding: 'Analysis failed.',
        insight: 'Error occurred while analyzing arrival data.',
        recommendation: 'Please try again later.',
        additionalInfo: 'Error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetAnalysis = () => {
    setShowAnalysis(false);
    setAnalysis(null);
  };

  const renderChart = () => {
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data.current}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? 80 : 120}
              innerRadius={isMobile ? 40 : 60}
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
    }
    
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        {chartType === 'line' ? (
          <LineChart data={data.current}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#3B82F6" name="Arrivals" />
          </LineChart>
        ) : (
          <BarChart data={data.current}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3B82F6" name="Arrivals" />
          </BarChart>
        )}
      </ResponsiveContainer>
    );
  };

  const renderAnalysisContent = () => {
    if (isAnalyzing) return <div className="text-gray-300">AI is analyzing arrival data...</div>;
    if (!analysis) return null;
    
    return (
      <div className="p-6 bg-gray-800 rounded-lg text-gray-300">
        <h3 className="text-xl text-blue-400 mb-4">AI Arrival Analysis</h3>
        <p><span className="font-semibold">Key Finding:</span> {analysis.keyFinding}</p>
        <p><span className="font-semibold">Insight:</span> {analysis.insight}</p>
        <p><span className="font-semibold">Recommendation:</span> {analysis.recommendation}</p>
        <p><span className="font-semibold">Additional Info:</span> {analysis.additionalInfo}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <h2 className="text-xl font-bold text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200" title="Close">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex gap-4 p-4 border-b border-gray-800">
          <button
            className={`px-4 py-2 ${chartType === 'pie' ? 'bg-blue-600' : 'bg-gray-700'} rounded`}
            onClick={() => setChartType('pie')}
          >
            Pie Chart
          </button>
          <button
            className={`px-4 py-2 ${chartType === 'line' ? 'bg-blue-600' : 'bg-gray-700'} rounded`}
            onClick={() => setChartType('line')}
          >
            Line Chart
          </button>
          <button
            className={`px-4 py-2 ${chartType === 'bar' ? 'bg-blue-600' : 'bg-gray-700'} rounded`}
            onClick={() => setChartType('bar')}
          >
            Bar Chart
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
                <span>Analyze Arrivals with AI</span>
              </button>
            </div>
          )}
          {showAnalysis && (
            <div className="mt-4">
              {renderAnalysisContent()}
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleResetAnalysis}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  Reset Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}