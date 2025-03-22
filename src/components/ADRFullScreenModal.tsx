'use client';
import React, { useState } from 'react';
import { X, BrainCircuit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { geminiService } from './GeminiService';

interface ADRFullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  adr: number;
}

export function ADRFullScreenModal({ isOpen, onClose, adr }: ADRFullScreenModalProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // Sample historical data - in a real app, this would come from an API
  const sampleHistoricalData = [
    { month: 'Jan', adr: Math.round((adr * 0.95) * 100) / 100 },
    { month: 'Feb', adr: Math.round((adr * 0.97) * 100) / 100 },
    { month: 'Mar', adr: Math.round((adr * 1.02) * 100) / 100 },
    { month: 'Apr', adr: adr },
    { month: 'May', adr: Math.round((adr * 1.05) * 100) / 100 },
    { month: 'Jun', adr: Math.round((adr * 1.08) * 100) / 100 },
  ];

  const handleAnalyzeClick = async () => {
    setIsAnalyzing(true);
    setShowAnalysis(true);
    try {
      // Make sure we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Cannot use Gemini service in server environment');
      }
      
      // Prepare data for analysis
      const chartData = sampleHistoricalData.map(item => ({
        name: item.month,
        value: item.adr
      }));
      
      // Call the Gemini service with error handling
      const result = await geminiService.analyzeChartData('adr', chartData, 'ADR Trend Analysis');
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing ADR data:', error);
      // Provide a fallback analysis when the API fails
      setAnalysis({
        keyFinding: "Unable to generate AI analysis at this time.",
        insight: "The system encountered an error while analyzing the ADR data.",
        recommendation: "Please try again later or contact support if the issue persists.",
        additionalInfo: "This is a fallback analysis due to an error with the AI service."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderAnalysisContent = () => {
    if (isAnalyzing) {
      return <div className="text-gray-300">AI is analyzing ADR data...</div>;
    }
    if (!analysis) return null;
    return (
      <div className="p-6 bg-gray-800 rounded-lg text-gray-300">
        <h3 className="text-xl text-blue-400 mb-4">AI ADR Analysis</h3>
        <p><span className="font-semibold">Key Finding:</span> {analysis.keyFinding}</p>
        <p><span className="font-semibold">Insight:</span> {analysis.insight}</p>
        {analysis.recommendation && (
          <p><span className="font-semibold">Recommendation:</span> {analysis.recommendation}</p>
        )}
        {analysis.additionalInfo && (
          <p><span className="font-semibold">Additional Info:</span> {analysis.additionalInfo}</p>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <h2 className="text-xl font-bold text-gray-100">Average Daily Rate Analysis</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200" title="Close">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="bg-gray-800 p-6 rounded-lg flex-1">
              <h3 className="text-xl text-gray-100 mb-4">Current ADR</h3>
              <div className="flex items-center justify-center">
                <div className="text-5xl font-bold text-green-500">${adr}</div>
              </div>
              <p className="text-gray-400 mt-4 text-center">
                The Average Daily Rate represents the average revenue earned per occupied room in a given time period.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg flex-1">
              <h3 className="text-xl text-gray-100 mb-4">ADR Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sampleHistoricalData}>
  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
  <XAxis dataKey="month" stroke="#9CA3AF" />
  <YAxis stroke="#9CA3AF" />
  <Tooltip
    contentStyle={{ 
      backgroundColor: '#1F2937',
      border: '1px solid #374151',
      borderRadius: '0.375rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}
  />
  <Bar dataKey="adr" fill="#34D399" radius={[4, 4, 0, 0]} />
</BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {!showAnalysis && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleAnalyzeClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <BrainCircuit size={20} />
                <span>Analyze ADR with AI</span>
              </button>
            </div>
          )}
          
          {showAnalysis && (
            <div className="mt-6">
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