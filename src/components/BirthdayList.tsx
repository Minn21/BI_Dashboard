import React from 'react';
import { Calendar, Gift } from 'lucide-react';

interface Birthday {
  name: string;
  date: string;
  room: string;
}

export default function BirthdayList() {
  const birthdays: Birthday[] = [
    { name: 'John Doe', date: '2023-10-15', room: 'Suite 301' },
    { name: 'Jane Smith', date: '2023-10-20', room: 'Deluxe 102' },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-100">Upcoming Birthdays</h3>
        </div>
        <span className="text-sm text-gray-400">{birthdays.length} upcoming</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-3 font-medium">Guest</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Room</th>
            </tr>
          </thead>
          <tbody>
            {birthdays.map((guest, index) => (
              <tr 
                key={index} 
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200"
              >
                <td className="py-4">
                  <span className="text-gray-100">{guest.name}</span>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{formatDate(guest.date)}</span>
                  </div>
                </td>
                <td className="py-4">
                  <span className="px-2 py-1 text-sm rounded-full bg-gray-800 text-gray-300">
                    {guest.room}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {birthdays.length === 0 && (
        <div className="text-center py-6">
          <span className="text-gray-400">No upcoming birthdays</span>
        </div>
      )}
    </div>
  );
}