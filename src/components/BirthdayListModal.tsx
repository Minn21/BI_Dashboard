import React from 'react';
import { X, Calendar, User, Gift, Info } from 'lucide-react';

interface GuestBirthday {
  name: string;
  birthday: string;
  age: number;
  interests?: string[];
  notes?: string;
}

interface BirthdayListModalProps {
  isOpen: boolean;
  onClose: () => void;
  birthdays: GuestBirthday[];
}

interface BirthdayDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    guest: GuestBirthday | null;
  }

  export function BirthdayDetailModal({ isOpen, onClose, guest }: BirthdayDetailModalProps) {
    if (!isOpen || !guest) return null;
  
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    };
  
    const calculateAge = (birthdate: string) => {
      const diff = Date.now() - new Date(birthdate).getTime();
      return Math.abs(new Date(diff).getUTCFullYear() - 1970);
    };
  
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div 
          className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 flex items-center justify-between border-b border-gray-800">
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Gift size={24} className="text-blue-400" />
              <span>Birthday Details</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 p-2 rounded-full transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
  
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-full">
                <User size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">{guest.name}</h3>
                <p className="text-sm text-gray-400">Age: {calculateAge(guest.birthday)}</p>
              </div>
            </div>
  
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar size={18} className="text-gray-400" />
                {formatDate(guest.birthday)}
              </div>
              
              {guest.interests && guest.interests.length > 0 && (
                <div className="flex items-center gap-3">
                  <Info size={18} className="text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {guest.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
  
              {guest.notes && (
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-300">{guest.notes}</p>
                </div>
              )}
            </div>
          </div>
  
          <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
            <div className="flex justify-between items-center">
              <span>Celebration Day:</span>
              <span>{formatDate(guest.birthday)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }