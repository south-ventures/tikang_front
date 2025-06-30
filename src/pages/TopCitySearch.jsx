import React, { useRef, useEffect, useState } from 'react';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import { useLocation, useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const TopCitySearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const initialCity = queryParams.get('city') || 'Manila';
  const image = queryParams.get('image') || '/assets/image_1.webp';

  const [destination, setDestination] = useState(initialCity);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
  const [adultCount, setAdultCount] = useState(2);
  const [roomCount, setRoomCount] = useState(1);
  const [childCount, setChildCount] = useState(0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setIsCalendarOpen(false);
        setGuestDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    navigate(`/search?city=${encodeURIComponent(destination)}`, {
      state: {
        checkIn,
        checkOut,
        adults: adultCount,
        children: childCount,
        rooms: roomCount,
        destination,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />

      <div
        className="relative bg-cover bg-center h-[80vh] flex items-center justify-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative z-10 text-white text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold">{destination} hotels & places to stay</h1>
          <p className="text-lg mt-2">Compare prices & find deals with free cancellation</p>

          {/* Search Box */}
          <div className="mt-6 bg-white rounded-xl shadow-lg flex flex-wrap items-center justify-center gap-2 px-4 py-3 w-full max-w-5xl mx-auto relative z-10 border border-blue-100">
            {/* Destination Input */}
            <div className="flex items-center border-r px-4 py-2 w-full sm:w-auto">
              <MdLocationOn className="text-gray-500 mr-2" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="text-gray-800 font-medium focus:outline-none w-full bg-transparent"
              />
            </div>

            {/* Dates */}
            <div
              onClick={() => {
                setIsCalendarOpen(true);
                setGuestDropdownOpen(false);
              }}
              className="flex items-center border-r px-4 py-2 w-full sm:w-auto cursor-pointer hover:bg-gray-50 rounded"
            >
              <FaCalendarAlt className="text-gray-500 mr-2" />
              <span className="text-gray-600 text-sm">
                {checkIn && checkOut
                  ? `${checkIn.toDateString()} – ${checkOut.toDateString()}`
                  : 'Select Dates'}
              </span>
            </div>

            {/* Guests */}
            <div
              onClick={() => {
                setGuestDropdownOpen(!guestDropdownOpen);
                setIsCalendarOpen(false);
              }}
              className="flex items-center px-4 py-2 w-full sm:w-auto cursor-pointer hover:bg-gray-50 rounded"
            >
              <FaUser className="text-gray-500 mr-2" />
              <span className="text-gray-600 text-sm">
                {adultCount} adult{adultCount > 1 ? 's' : ''}, {childCount} child
                {childCount !== 1 ? 'ren' : ''}, {roomCount} room{roomCount > 1 ? 's' : ''}
              </span>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-6 py-2"
            >
              SEARCH
            </button>

            {/* Calendar Picker */}
            {isCalendarOpen && (
              <div
                ref={calendarRef}
                className="absolute top-[110%] left-4 w-full max-w-xl bg-white rounded-xl shadow-xl p-6 z-50"
              >
                <DatePicker
                  selected={checkIn}
                  onChange={([start, end]) => {
                    setCheckIn(start);
                    setCheckOut(end || start);
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

            {/* Guest Dropdown */}
            {guestDropdownOpen && (
              <div className="absolute top-[110%] right-4 w-72 bg-white rounded-xl shadow-xl p-4 z-50 text-sm">
                {[
                  { label: 'Room', count: roomCount, set: setRoomCount, min: 1 },
                  { label: 'Adults', count: adultCount, set: setAdultCount, min: 1 },
                  { label: 'Children', count: childCount, set: setChildCount, min: 0 },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-700">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          item.set(Math.max(item.min, item.count - 1));
                        }}
                        className="border w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:text-black"
                      >
                        −
                      </button>
                      <span>{item.count}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          item.set(item.count + 1);
                        }}
                        className="border w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:text-black"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TopCitySearch;
