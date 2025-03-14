import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaCrown, FaCalendarAlt } from 'react-icons/fa';
import { api } from './api';
import { LoadingCard } from './components';

interface GuestBirthday {
  name: string;
  birthday: string;
  loyalty_member?: boolean;
  loyalty_level?: string | null;
  vip?: boolean;
  age_group?: string;
}

export function BirthdayList() {
  const [birthdays, setBirthdays] = useState<GuestBirthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [selectedLoyalty, setSelectedLoyalty] = useState<string>('all');
  const [showVIPOnly, setShowVIPOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getGuestBirthdays();
        setBirthdays(result);
      } catch (error) {
        toast.error('Failed to load birthday data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBirthdays = birthdays.filter(guest => {
    const loyaltyMatch = selectedLoyalty === 'all' || guest.loyalty_level === selectedLoyalty;
    const vipMatch = !showVIPOnly || guest.vip;
    return loyaltyMatch && vipMatch;
  });

  const CalendarView = () => {
    const daysInMonth = new Date().getDate();
    const today = new Date();
    
    return (
      <div className="grid grid-cols-7 gap-2 mt-4">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
          const dateStr = date.toISOString().split('T')[0];
          const dailyBirthdays = filteredBirthdays.filter(g => 
            g.birthday.startsWith(dateStr.slice(5))
          );
          
          return (
            <div 
              key={i}
              className="h-24 p-2 border border-gray-700 rounded-lg relative"
            >
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm">{i + 1}</span>
                {dailyBirthdays.length > 0 && (
                  <span className="text-blue-400 text-xs">
                    {dailyBirthdays.length}🎂
                  </span>
                )}
              </div>
              <div className="mt-1 space-y-1">
                {dailyBirthdays.slice(0, 2).map(guest => (
                  <div key={guest.name} className="text-xs text-gray-400 truncate">
                    {guest.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
        <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <FaCalendarAlt className="text-blue-400" />
          Guest Birthdays
        </h3>
        
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <label htmlFor="loyalty-select" className="sr-only">Select Loyalty Level</label>
          <select
            id="loyalty-select"
            className="bg-gray-800 text-gray-100 px-3 py-2 rounded-lg text-sm"
            value={selectedLoyalty}
            onChange={(e) => setSelectedLoyalty(e.target.value)}
          >
            <option value="all">All Loyalty</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
          
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={showVIPOnly}
              onChange={(e) => setShowVIPOnly(e.target.checked)}
              className="accent-blue-500"
            />
            VIP Only
          </label>

          <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-300'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-300'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingCard />
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3 font-medium px-4">Guest</th>
                <th className="pb-3 font-medium px-4">Date</th>
                <th className="pb-3 font-medium px-4">Days Left</th>
                <th className="pb-3 font-medium px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBirthdays.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-400">
                    No matching birthdays
                  </td>
                </tr>
              ) : (
                filteredBirthdays.map((guest, index) => (
                  <BirthdayRow key={guest.name + index} guest={guest} />
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <CalendarView />
      )}
    </div>
  );
}

const BirthdayRow = ({ guest }: { guest: GuestBirthday }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) 
      ? 'Invalid date'
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateDaysRemaining = (birthday: string) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    birthDate.setFullYear(today.getFullYear());
    if (birthDate < today) birthDate.setFullYear(today.getFullYear() + 1);
    return Math.ceil((birthDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  };

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/50">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-full">
            {guest.vip ? (
              <FaCrown className="text-yellow-400" />
            ) : (
              <FaUser className="text-blue-400" />
            )}
          </div>
          <div>
            <span className="text-gray-100">{guest.name}</span>
            {guest.loyalty_level && (
              <span className="text-xs text-gray-400 block capitalize">
                {guest.loyalty_level}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-gray-300">{formatDate(guest.birthday)}</td>
      <td className="py-4 px-4 text-gray-300">
        {calculateDaysRemaining(guest.birthday) || 'Today'}
      </td>
      <td className="py-4 px-4">
        {guest.vip && (
          <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs">
            VIP
          </span>
        )}
      </td>
    </tr>
  );
};