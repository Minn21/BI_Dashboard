import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

interface FullScreenChartModalProps {
    title: string;
    data: { name: string; value: number; }[];
    colors: string[];
    onClose: () => void;
    onAnalyze: () => void;
    totalValue: number;
    valueLabel: string;
    onAnalyzeWithGemini: () => void; // New prop for Gemini analysis
}

export function FullScreenChartModal({ data, onClose, onAnalyzeWithGemini }: FullScreenChartModalProps) {
    const COLORS = ['#3B82F6', '#10B981'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-8 z-50">
            <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full h-full max-w-6xl max-h-[90vh] overflow-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
                >
                    Close
                </button>
                <h3 className="text-2xl font-semibold text-gray-100 mb-6">Member vs. General Guests (Full Screen)</h3>
                
                {/* Additional Buttons */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={onAnalyzeWithGemini}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Analyze with Gemini
                    </button>
                    <button
                        onClick={() => toast('Exporting data...')}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Export Data
                    </button>
                    <button
                        onClick={() => toast('Saving chart...')}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        Save Chart
                    </button>
                </div>

                <div className="text-center mb-4">
                    <div className="flex justify-center gap-6">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[0] }}></div>
                            <span className="text-gray-300">Members: {data[0].value}%</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[1] }}></div>
                            <span className="text-gray-300">Guests: {data[1].value}%</span>
                        </div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={500}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            outerRadius={200}
                            innerRadius={100}
                            paddingAngle={5}
                            stroke="none"
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
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}