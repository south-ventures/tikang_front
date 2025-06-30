import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';

const SearchBox = () => {
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
  const [adultCount, setAdultCount] = useState(2);
  const [roomCount, setRoomCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [destination, setDestination] = useState('');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  const handleSearch = () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
  
    navigate('/search', {
      state: {
        checkIn: checkIn || today,
        checkOut: checkOut || tomorrow,
        adults: adultCount,
        children: childCount,
        rooms: roomCount,
        destination,
      },
    });
  };
  

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg mt-10 px-8 py-8 relative z-10 border border-blue-100">
      {/* Destination Input */}
      <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 mb-6 bg-white shadow-sm">
        <span className="mr-3 text-xl text-blue-500">📍</span>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Where are you going?"
          className="w-full outline-none text-base bg-transparent text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Date & Guest Selector */}
      <div className="flex flex-wrap md:flex-nowrap gap-4 mb-6 relative">
        <div
          onClick={() => {
            setIsCalendarOpen(true);
            setGuestDropdownOpen(false);
          }}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 bg-white cursor-pointer hover:shadow-md"
        >
          <div className="text-sm text-gray-700 font-semibold">
            {checkIn && checkOut
              ? `${checkIn.toDateString()} - ${checkOut.toDateString()}`
              : 'Select your dates'}
          </div>
          <div className="text-xs text-gray-500">Check-in & Check-out</div>
        </div>

        <div
          onClick={() => {
            setGuestDropdownOpen(!guestDropdownOpen);
            setIsCalendarOpen(false);
          }}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 bg-white flex items-center justify-between relative cursor-pointer hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xl text-indigo-500">👥</span>
            <span className="text-gray-700 font-semibold">
              {adultCount} adult{adultCount > 1 ? 's' : ''}
            </span>
            <span className="text-gray-500">
              • {roomCount} room{roomCount > 1 ? 's' : ''}
            </span>
          </div>
          <span className="text-gray-400 text-sm">▼</span>

          {guestDropdownOpen && (
            <div className="absolute top-[110%] right-0 w-72 bg-white rounded-xl shadow-xl p-4 z-50 text-sm">
              {[ 
                { label: 'Room', count: roomCount, set: setRoomCount, min: 1 },
                { label: 'Adults', sub: 'Age 18+', count: adultCount, set: setAdultCount, min: 1 },
                { label: 'Children', sub: 'Age 0–17', count: childCount, set: setChildCount, min: 0 }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2">
                  <div>
                    <div className="font-medium text-gray-800">{item.label}</div>
                    {item.sub && <div className="text-xs text-gray-500">{item.sub}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        item.set((prev) => Math.max(item.min, prev - 1));
                      }}
                      className="border border-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:text-black"
                    >
                      −
                    </button>
                    <span>{item.count}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        item.set((prev) => prev + 1);
                      }}
                      className="border border-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:text-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar */}
        {isCalendarOpen && (
          <div
            ref={calendarRef}
            className="absolute top-[110%] left-0 bg-white rounded-xl shadow-xl p-6 z-50 w-full md:w-[650px]"
          >
            <DatePicker
              selected={checkIn}
              onChange={(dates) => {
                const [start, end] = dates;
                setCheckIn(start);
                setCheckOut(end);
              }}
              startDate={checkIn}
              endDate={checkOut}
              selectsRange
              inline
              monthsShown={2}
              minDate={new Date()}
            />
          </div>
        )}
      </div>

      {/* Search Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleSearch}
          className="bg-[#3A78F2] hover:bg-[#3167d3] text-white font-semibold text-lg px-10 py-3 rounded-xl shadow-md transition"
        >
          🔍 Search
        </button>
      </div>
    </div>
  );
};

export default SearchBox;
