import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUser } from 'react-icons/fa'; // Import the FaUser icon from react-icons
import { api } from './api'; // Adjust the import according to your project structure
import { LoadingCard } from './components'; // Adjust the import according to your project structure
import { BirthdayDetailModal } from './BirthdayListModal'; // Import the modal component

interface GuestBirthday {
    name: string;
    birthday: string;
    age: number;
    interests?: string[];
    notes?: string;
  }

// Update BirthdayList component in components.tsx
export function BirthdayList() {
    const [birthdays, setBirthdays] = useState<GuestBirthday[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<GuestBirthday | null>(null);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const result = await api.getGuestBirthdays();
          const transformedResult = result.map((guest: any) => ({
            ...guest,
            age: guest.age || 0, // Provide a default value for age if missing
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
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    };
  
    const calculateDaysRemaining = (birthday: string) => {
      const today = new Date();
      const birthDate = new Date(birthday);
      birthDate.setFullYear(today.getFullYear());
      if (birthDate < today) {
        birthDate.setFullYear(today.getFullYear() + 1);
      }
      const diffTime = Math.abs(birthDate.getTime() - today.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleRowClick = (guest: GuestBirthday) => {
      setSelectedGuest(guest);
      setIsModalOpen(true);
    };
  
    if (loading) return <LoadingCard />;
  
    return (
      <>
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
    {birthdays.map((guest, index) => (
      <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
        <td className="py-4 px-4"> {/* Added px-4 for spacing */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-full">
              <FaUser className="text-blue-400" />
            </div>
            {calculateDaysRemaining(guest.birthday) > 0 ? `${calculateDaysRemaining(guest.birthday)}d` : 'Today'}
            <span className="text-gray-100">{guest.name}</span>
          </div>
        </td>
        <td className="py-4 px-4"> {/* Added px-4 for spacing */}
          <span className="text-gray-300">
            {formatDate(guest.birthday)}
          </span>
        </td>
        
      </tr>
    ))}
  </tbody>
</table>
          </div>
        </div>
  
        <BirthdayDetailModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          guest={selectedGuest}
        />
      </>
    );
  }