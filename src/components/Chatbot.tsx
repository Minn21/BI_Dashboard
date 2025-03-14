'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import ReactMarkdown from 'react-markdown';
import { IconMessage, IconX, IconMinus, IconRefresh, IconArrowUp } from '@tabler/icons-react';
import { api, GuestBirthday } from './api';
import { geminiService } from './GeminiService';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'loading' | 'error' | 'success';
};

type ChatbotProps = {
  onClose: () => void;
  isVisible: boolean;
  isMinimized: boolean;
  onMinimize: () => void;
};

const sanitizeBirthdays = (birthdays: GuestBirthday[]): GuestBirthday[] => 
  birthdays.map(b => ({
    name: b.name,
    birthday: b.birthday,
    age_group: b.age_group,
    loyalty_member: b.loyalty_member
  }));

const MessageBubble = React.memo(function MessageBubble({ msg }: { msg: ChatMessage }) {
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className={`group relative p-2 rounded-lg bg-gray-700 text-gray-100 max-w-[85%] break-words ${
      msg.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'mr-auto'
    }`}>
      <div className="prose prose-invert prose-sm">
        <ReactMarkdown>{msg.content}</ReactMarkdown>
      </div>
      <div className={`mt-1 text-xs ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'} flex justify-between items-center`}>
        <span>{time}</span>
        {msg.status === 'error' && (
          <button className="ml-2 hover:text-white" aria-label="Retry message">
            <IconRefresh size={14} />
          </button>
        )}
      </div>
    </div>
  );
});

export const Chatbot: React.FC<ChatbotProps> = ({ onClose, isVisible, isMinimized, onMinimize }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatMessages');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Scroll handling
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "**Welcome to Hotel Analytics Assistant**\nAsk me about:\n- Occupancy & ADR\n- Revenue trends\n- Cancellations\n- Guest demographics\n- Booking arrivals\n- Member vs general guests\n- Age groups\n- Popular room types\n- Historical data\n- Year-over-year comparisons\n- Current bookings\n- Guest birthdays\n- VIP guests\n- Special requests\nAnd more...",
        timestamp: Date.now()
      }]);
    }
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

  const buildPrompt = useCallback(async (question: string): Promise<string> => {
    try {
      const [essentialData, bookingArrivals, memberVsGeneral, ageGroups] = await Promise.all([
        api.getEssentialData().catch(() => null),
        api.getBookingArrivals().catch(() => null),
        api.getMemberVsGeneral().catch(() => null),
        api.getAgeGroups().catch(() => null),
      ]);

      const context = {
        summary: essentialData?.summary,
        occupancy: essentialData?.occupancy,
        cancellations: essentialData?.cancellations,
        revenue: essentialData?.revenue,
        bookingArrivals,
        memberVsGeneral,
        ageGroups,
        dataStatus: essentialData ? 'fresh' : 'cached',
      };

      return JSON.stringify({
        system: "You are a comprehensive hotel analytics assistant. Provide detailed, markdown-formatted answers using these guidelines:",
        context,
        question: question.trim(),
        guidelines: [
          "1. Maintain guest privacy - never reveal personal details",
          "2. Use **bold** for key metrics and $$$ for currency",
          "3. Structure complex data with bullet points and tables",
          "4. Highlight trends and anomalies in the data",
          "5. Mention data recency based on context.dataStatus"
        ]
      });
    } catch (error) {
      console.error('Prompt build error:', error);
      return JSON.stringify({
        error: "Partial data loaded",
        details: "Using cached data where available"
      });
    }
  }, []);

  const handleSend = useDebouncedCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      status: 'success'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const prompt = await buildPrompt(input);
      const response = await geminiService.askQuestion(prompt);
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        status: 'success'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `**Service Update**\n${
          process.env.NODE_ENV === 'development' 
            ? `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            : 'Our analytics service is currently unavailable. Please try again later.'
        }`,
        timestamp: Date.now(),
        status: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, 400);

  const TypingIndicator = () => (
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
      </div>
      Analyzing data...
    </div>
  );

  if (isMinimized) {
    return (
      <button
        onClick={onMinimize}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all flex items-center justify-center group"
        aria-label="Open analytics chat"
      >
        <IconMessage size={24} />
        <span className="absolute -top-2 -right-2 bg-red-500 text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
          {messages.filter(m => m.status === 'error').length}
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="bg-gray-800 rounded-lg shadow-xl flex flex-col w-96 max-h-[70vh] border border-gray-700">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
          <h3 className="text-base font-medium text-white">Analytics Assistant</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setMessages([]);
                localStorage.removeItem('chatMessages');
              }}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
              aria-label="Reset conversation"
            >
              <IconRefresh size={20} />
            </button>
            <button 
              onClick={onMinimize} 
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
              aria-label="Minimize chat"
            >
              <IconMinus size={20} />
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
              aria-label="Close chat"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <MessageBubble msg={msg} />
            </div>
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 p-2 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400"
              placeholder="Ask about hotel metrics... (Shift+Enter for new line)"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button
              onClick={handleSend}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              disabled={isLoading}
              aria-label="Send message"
            >
              <IconArrowUp size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Data updates every 5 minutes • <button onClick={() => setMessages([])} className="hover:text-blue-400">Clear history</button>
          </p>
        </div>
      </div>
    </div>
  );
};