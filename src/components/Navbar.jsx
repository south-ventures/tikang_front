import React, { useState, useRef, useEffect } from 'react';
import {
  FaSearch,
  FaCalendarAlt,
  FaUserFriends,
  FaShoppingCart,
  FaUserCircle,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../context/AuthContext';
import OwnerRedirectModal from './OwnerRedirectModal'; 

export default function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showReportModal, setShowReportModal] = useState(false);
  const [problemText, setProblemText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitProblem = async () => {
    if (!problemText.trim()) return alert("Please describe your problem.");
    setSubmitting(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/submit-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.user_id,
          message: problemText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Problem submitted successfully.");
        setProblemText('');
        setShowReportModal(false);
      } else {
        alert(data.message || "Failed to submit.");
      }
    } catch (err) {
      console.error("Error submitting problem:", err);
      alert("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const searchParams = location.state || {};
  const {
    destination = '',
    checkIn = null,
    checkOut = null,
    adults = 2,
    children = 0,
    rooms = 1,
  } = searchParams;

  const [searchInput, setSearchInput] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [adultCount, setAdultCount] = useState(2);
  const [roomCount, setRoomCount] = useState(1);
  const [childCount, setChildCount] = useState(0);

  const [ownerModalOpen, setOwnerModalOpen] = useState(false);

  const calendarRef = useRef(null);
  const guestRef = useRef(null);

  useEffect(() => {
    if (destination) setSearchInput(destination);
    if (checkIn) setStartDate(new Date(checkIn));
    if (checkOut) setEndDate(new Date(checkOut));
    if (adults) setAdultCount(adults);
    if (children) setChildCount(children);
    if (rooms) setRoomCount(rooms);
  }, [destination, checkIn, checkOut, adults, children, rooms]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target) &&
        !e.target.closest('.calendar-toggle')
      ) {
        setCalendarOpen(false);
      }
      if (
        guestRef.current &&
        !guestRef.current.contains(e.target) &&
        !e.target.closest('.guest-toggle')
      ) {
        setGuestDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const handleSearch = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    navigate('/search', {
      state: {
        destination: searchInput,
        checkIn: startDate || today,
        checkOut: endDate || tomorrow,
        adults: adultCount,
        children: childCount,
        rooms: roomCount,
      },
    });
    setMobileSearchOpen(false);
  };

  const guestControl = (label, value, setValue, min, note = '') => (
    <div className="flex justify-between items-center py-2">
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-gray-500">{note}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setValue(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border text-lg font-bold text-gray-600"
        >
          −
        </button>
        <span className="min-w-[20px] text-center">{value}</span>
        <button
          onClick={() => setValue(value + 1)}
          className="w-8 h-8 rounded-full border text-lg font-bold text-gray-600"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#D4EDDA] shadow-md px-4 py-3">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
      <Link to="/dashboard" className="flex items-center gap-2">
        <img
          src={`${process.env.REACT_APP_API_URL}/uploads/logo/logo.png`}
          alt="Tikang Logo"
          className="h-16 w-auto object-contain cursor-pointer"
          onError={e => { e.currentTarget.src = '/fallback-logo.png'; }} // optional fallback
        />
      </Link>

        {/* Desktop Search */}
        <div className="hidden sm:flex flex-1 max-w-3xl mx-6">
          <div className="flex items-center w-full bg-white rounded-full px-4 py-2 gap-4 shadow-sm border text-sm">
            <div className="flex items-center gap-2 flex-1">
              <FaSearch className="text-blue-500" />
              <input
                type="text"
                placeholder="Search a place"
                className="bg-transparent outline-none w-full placeholder-gray-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className="relative calendar-toggle">
              <button
                onClick={() => {
                  setCalendarOpen((prev) => !prev);
                  setGuestDropdownOpen(false);
                }}
                className="flex items-center gap-2 text-gray-600 whitespace-nowrap"
              >
                <FaCalendarAlt className="text-blue-500" />
                {startDate && endDate
                  ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                  : 'Select Dates'}
              </button>
              {calendarOpen && (
                <div
                  ref={calendarRef}
                  className="absolute top-12 left-0 bg-white shadow-xl rounded-xl p-4 z-50"
                >
                  <DatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    monthsShown={2}
                    inline
                    minDate={new Date()}
                  />
                </div>
              )}
            </div>

            <div className="relative guest-toggle">
              <button
                onClick={() => {
                  setGuestDropdownOpen((prev) => !prev);
                  setCalendarOpen(false);
                }}
                className="flex items-center gap-2 text-gray-600 whitespace-nowrap"
              >
                <FaUserFriends className="text-blue-500" />
                {adultCount + childCount} Guests, {roomCount} Room
              </button>
              {guestDropdownOpen && (
                <div
                  ref={guestRef}
                  className="absolute top-12 left-0 bg-white shadow-xl rounded-xl p-4 z-50 w-72 text-sm"
                >
                  {guestControl('Room', roomCount, setRoomCount, 1)}
                  {guestControl('Adults', adultCount, setAdultCount, 1, 'Age 18+')}
                  {guestControl('Children', childCount, setChildCount, 0, 'Age 0–17')}
                </div>
              )}
            </div>

            <button
              className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full font-semibold"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

        {/* Mobile Search Button */}
        <div className="block sm:hidden text-blue-700 text-xl">
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm"
          >
            <FaSearch />
            <span className="text-sm text-gray-500">{searchInput || 'Search'}</span>
          </button>
        </div>

        {/* Mobile Drawer Toggle */}
        <div className="sm:flex lg:hidden ml-4">
          <button onClick={() => setMobileMenuOpen(true)} className="text-2xl text-gray-700">
            <FaBars />
          </button>
        </div>

        {/* Desktop Account / Menu */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
        <button
                onClick={() => setShowReportModal(true)}
                className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
              >
                Report
        </button>
        {!user ? (
            <Link to="/owner" className="hover:text-green-600">
              List your Property
            </Link>
          ) : (
            <button
              onClick={() => setOwnerModalOpen(true)}
              className="hover:text-green-600"
            >
              Homeowner Centre
            </button>
          )}
          <Link to="/favorites" className="hover:text-green-600">Favorites</Link>
          {user ? (
            <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="hover:text-green-600 font-semibold text-sm"
            >
              Welcome, {user?.full_name?.split(' ')[0] || 'User'}
            </button>

            {profileDropdownOpen && (
              <div
                className="absolute top-full mt-0 left-0 bg-white border rounded shadow-md w-48 z-50"
              >
                <Link to="/account/information" className="block px-4 py-2 hover:bg-gray-100 text-sm">My Account</Link>
                <Link to="/account/bookings" className="block px-4 py-2 hover:bg-gray-100 text-sm">Bookings</Link>
                <Link to="/account/messages" className="block px-4 py-2 hover:bg-gray-100 text-sm">Messages</Link>
                <Link to="/account/tikangcash" className="block px-4 py-2 hover:bg-gray-100 text-sm">TikangCash</Link>
                <Link to="/account/reviews" className="block px-4 py-2 hover:bg-gray-100 text-sm">Reviews</Link>
                <button
                onClick={() => setShowReportModal(true)}
                className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
              >
                Report
              </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          ) : (
            <Link to="/login" className="hover:text-green-600 text-xl">
              <FaUserCircle />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-start pt-24 sm:hidden z-[1000]">
          <div className="bg-white w-full max-w-sm mx-4 rounded-xl shadow-xl p-6 relative">
            <button className="absolute top-3 right-3 text-xl text-gray-600" onClick={() => setMobileSearchOpen(false)}>
              <FaTimes />
            </button>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border px-3 py-2 rounded">
                <FaSearch className="text-pink-500" />
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="outline-none w-full text-sm"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div className="border rounded px-3 py-2">
                <label className="font-semibold text-sm">Select your dates</label>
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  inline
                  minDate={new Date()}
                />
              </div>

              <div className="border rounded px-3 py-2">
                <label className="font-semibold text-sm">Guests</label>
                {guestControl('Room', roomCount, setRoomCount, 1)}
                {guestControl('Adults', adultCount, setAdultCount, 1, 'Age 18+')}
                {guestControl('Children', childCount, setChildCount, 0, 'Age 0–17')}
              </div>

              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white py-2 rounded text-center text-sm font-semibold"
              >
                <FaSearch className="inline mr-2" /> Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-xl transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <span className="text-lg font-semibold">Menu</span>
          <FaTimes className="text-xl cursor-pointer" onClick={() => setMobileMenuOpen(false)} />
        </div>
        <div className="p-4 flex flex-col gap-4 text-gray-700 text-sm">
          {user && (
              <div className="text-blue-700 font-semibold text-base">
                Welcome, {user?.full_name?.split(' ')[0] || 'User'}!
              </div>
            )}
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          {!user ? (
            <Link to="/owner" className="hover:text-green-600">
              List your Property
            </Link>
          ) : (
            <button
              onClick={() => setOwnerModalOpen(true)}
              className="hover:text-green-600"
            >
              Homeowner Centre
            </button>
          )}
          <Link to="#" onClick={() => setMobileMenuOpen(false)}>Favorites</Link>
          <Link to="#" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
            <FaShoppingCart /> Cart
          </Link>
          {user ? (
            <>
              <Link to="/account/information" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
              <Link to="/account/bookings" onClick={() => setMobileMenuOpen(false)}>Bookings</Link>
              <Link to="/account/messages" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
              <Link to="/account/tikangcash" onClick={() => setMobileMenuOpen(false)}>TikangCash</Link>
              <Link to="/account/reviews" onClick={() => setMobileMenuOpen(false)}>Reviews</Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left text-red-600">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <FaUserCircle /> Login
            </Link>
          )}
        </div>
      </div>
            {/* Report a Problem Modal */}
            {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Report a Problem</h3>
            <textarea
              rows={4}
              className="w-full border rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              placeholder="Describe the issue you're facing..."
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
            ></textarea>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitProblem}
                disabled={submitting}
                className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
      <OwnerRedirectModal
        isOpen={ownerModalOpen}
        onClose={() => setOwnerModalOpen(false)}
        otherRoles={user?.other_role}
        userType={user?.user_type}
        userId={user?.user_id}
      />
    </nav>
  );
}
