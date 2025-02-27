import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUser } from 'react-icons/fa';
import { api } from './api';
import { LoadingCard } from './components';

interface GuestBirthday {
  name: string;
  birthday: string;
  age: number;
  interests?: string[];
  notes?: string;
}

export function BirthdayList() {
  const [birthdays, setBirthdays] = useState<GuestBirthday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getGuestBirthdays();
        const transformedResult = result.map((guest: any) => ({
          ...guest,
          age: guest.age || 0,
        }));
        setBirthdays(transformedResult);
      } catch (error) {
        toast.error('Failed to load birthday data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const calculateDaysRemaining = (birthday: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time to midnight
    const birthDate = new Date(birthday);
    birthDate.setHours(0, 0, 0, 0);
    
    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const diffTime = Math.abs(nextBirthday.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) return <LoadingCard />;

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-100">Upcoming Birthdays</h3>
        <span className="text-sm text-gray-400">{birthdays.length} guests</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-3 font-medium px-4">Guest</th>
              <th className="pb-3 font-medium px-4">Date</th>
              <th className="pb-3 font-medium px-4">Days Left</th>
            </tr>
          </thead>
          <tbody>
            {birthdays.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-400">
                  No upcoming birthdays
                </td>
              </tr>
            ) : (
              birthdays.map((guest, index) => {
                const daysRemaining = calculateDaysRemaining(guest.birthday);
                return (
                  <tr 
                    key={guest.name + index} // Better key if possible
                    className="border-b border-gray-800 hover:bg-gray-800/50"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-full">
                          <FaUser className="text-blue-400" />
                        </div>
                        <span className="text-gray-100">{guest.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-300">
                        {formatDate(guest.birthday)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-300">
                        {daysRemaining > 0 ? `${daysRemaining}` : 'Today'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}