"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Room {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

interface RoomSelectorProps {
  availableRooms: Room[];
  selectedRooms: string[];
  onSelectRoom: (roomId: string) => void;
}

export default function RoomSelector({
  availableRooms,
  selectedRooms,
  onSelectRoom
}: RoomSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="bg-white px-4 py-2 rounded-lg border border-gray-200 flex items-center justify-between min-w-[180px] hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-gray-700">Select Rooms</span>
        </div>
        <svg 
          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-700">Choose rooms to display</div>
          </div>
          {availableRooms.map(room => (
            <div 
              key={room.id} 
              className={`px-3 py-2.5 flex items-center hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedRooms.includes(room.id) ? 'bg-green-50' : ''
              }`}
              onClick={() => {
                onSelectRoom(room.id);
              }}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 ${
                selectedRooms.includes(room.id) ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {room.icon}
              </div>
              <span className={`${selectedRooms.includes(room.id) ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                {room.name}
              </span>
              <div className="ml-auto">
                <div className={`w-5 h-5 rounded flex items-center justify-center ${
                  selectedRooms.includes(room.id) 
                    ? 'bg-green-500 text-white' 
                    : 'border border-gray-300'
                }`}>
                  {selectedRooms.includes(room.id) && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="px-3 py-2 border-t border-gray-100 mt-1">
            <button 
              className="w-full text-center text-sm text-green-600 hover:text-green-800 font-medium"
              onClick={() => setIsOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 