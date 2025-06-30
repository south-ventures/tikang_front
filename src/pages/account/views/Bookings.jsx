import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Modal from '../../../components/Modal';
import {
  FaCalendarAlt,
  FaUsers,
  FaHome,
  FaTag,
} from 'react-icons/fa';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('tikangToken');
        const res = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.bookings) setBookings(data.bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(
    (b) => b.booking_status?.toLowerCase() === activeTab
  );

  const renderBookingCard = (booking) => {
    const bg = `${process.env.REACT_APP_API_URL}${booking.thumbnail_url}` || '/assets/hotel_default.webp';
    return (
      <div
        key={booking.booking_id}
        className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition cursor-pointer"
        onClick={() => setSelectedBooking(booking)}
      >
        <div className="h-48 bg-gray-200">
          <img src={bg} alt={booking.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <h2 className="font-semibold text-xl text-gray-800">{booking.title}</h2>
            <span
              className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${
                booking.booking_status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : booking.booking_status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : booking.booking_status === 'confirmed'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {booking.booking_status}
            </span>
          </div>
          <p className="text-sm text-gray-500">{booking.address}</p>
          <p className="text-sm text-gray-600">
            {format(new Date(booking.check_in_date), 'MMM dd')} -{' '}
            {format(new Date(booking.check_out_date), 'MMM dd, yyyy')}
          </p>
          <div className="flex justify-between items-center pt-2">
            <p className="text-sm text-gray-700">Rooms: {booking.num_rooms}</p>
            <p className="text-lg font-semibold text-gray-800">
              ₱{Number(booking.total_price).toFixed(2)}
            </p>
          </div>
          <div className="flex justify-between pt-3">
            {['pending', 'confirmed'].includes(booking.booking_status?.toLowerCase()) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Cancel booking logic goes here.');
                }}
                className="text-sm text-red-600 font-semibold hover:underline"
              >
                Cancel
              </button>
            )}
            <button
              className="text-sm text-blue-600 font-semibold hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBooking(booking);
                setShowReceipt(false); // optional: reset receipt visibility
              }}
            >
              View Info
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderModalContent = (booking) => {
    const receiptUrl = booking.gcash_receipt
      ? `${process.env.REACT_APP_API_URL}${booking.gcash_receipt}`
      : null;

    return (
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto w-full md:max-w-2xl mx-auto box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="w-full h-64 overflow-hidden rounded-t-2xl">
          <img
            src={booking.thumbnail_url ? `${process.env.REACT_APP_API_URL}${booking.thumbnail_url}` : '/assets/hotel_default.webp'}
            alt="Property"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="px-8 py-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">{booking.title}</h2>
          <p className="text-sm text-gray-500">{booking.address}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
            <p><FaCalendarAlt className="inline mr-2" /><strong>Check-in:</strong> {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}</p>
            <p><FaCalendarAlt className="inline mr-2" /><strong>Check-out:</strong> {format(new Date(booking.check_out_date), 'MMM dd, yyyy')}</p>
            {booking.cancelled_date && (
              <p className="sm:col-span-2"><strong>Cancelled Date:</strong> {format(new Date(booking.cancelled_date), 'MMM dd, yyyy')}</p>
            )}
            <p><FaUsers className="inline mr-2" /><strong>Guests:</strong> {booking.num_adults} adults, {booking.num_children} children</p>
            <p><FaHome className="inline mr-2" /><strong>Stay Type:</strong> {booking.stay_type}</p>
            <p><FaTag className="inline mr-2" /><strong>Total Price:</strong> ₱{Number(booking.total_price).toFixed(2)}</p>
            <p><strong>Payment Status:</strong> <span className="capitalize">{booking.payment_status}</span></p>
            <p><strong>Status:</strong> <span className="capitalize">{booking.booking_status}</span></p>
          </div>
        </div>

        {/* Rooms */}
        {booking.rooms?.length > 0 && (
          <div className="px-8 pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Room Details</h3>
            <div className="space-y-5">
              {booking.rooms.map((room, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row gap-4 items-start border border-gray-200 p-4 rounded-xl bg-gray-50"
                >
                  <img
                    src={`${process.env.REACT_APP_API_URL}${room.room_images?.[0]}` || '/assets/room_placeholder.webp'}
                    alt="Room"
                    className="w-full sm:w-48 h-40 object-cover rounded-xl border"
                  />
                  <div className="flex-1 space-y-1 text-sm text-gray-700">
                    <p><strong>Name:</strong> {room.room_name}</p>
                    <p><strong>Type:</strong> {room.room_type}</p>
                    <p><strong>Price/Night:</strong> ₱{Number(room.price_per_night).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-8 pb-4 mt-4 space-y-4">
          <div className="flex justify-center gap-4 flex-wrap">
          <button
              onClick={(e) => {
                e.stopPropagation();
                const today = new Date();
                const tomorrow = new Date();
                tomorrow.setDate(today.getDate() + 1);

                navigate(`/property/${booking.title.toLowerCase().replace(/\s+/g, '-')}`, {
                  state: {
                    property_id: booking.property_id,
                    room_id: booking.rooms?.[0]?.room_id,
                    checkIn: today.toISOString(),
                    checkOut: tomorrow.toISOString(),
                    adults: 1,
                    children: 0,
                    roomNum: 1,
                  },
                });
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-full shadow hover:bg-blue-700 text-sm transition"
            >
              View Live
            </button>
            {receiptUrl && (
              <button
                onClick={() => setShowReceipt(!showReceipt)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-full shadow hover:bg-indigo-700 text-sm transition"
              >
                {showReceipt ? 'Hide Receipt' : 'View Receipt'}
              </button>
            )}
          </div>
          {['pending', 'confirmed'].includes(booking.booking_status?.toLowerCase()) && (
            <div className="flex justify-center">
              <button
                onClick={() => alert('Cancel booking logic goes here.')}
                className="bg-red-600 text-white px-8 py-3 text-sm sm:text-base rounded-full shadow hover:bg-red-700 transition duration-200"
              >
                Cancel Booking
              </button>
            </div>
          )}
        </div>

        {/* Receipt */}
        {showReceipt && receiptUrl && (
          <div className="px-8 pb-8 flex justify-center">
            <img
              src={receiptUrl}
              alt="GCash Receipt"
              className="rounded-lg border w-full sm:w-auto max-h-96 object-contain shadow"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="px-4 py-6 max-w-full sm:max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto sm:gap-4 mb-6">
        {['pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-semibold capitalize transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredBookings.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No <span className="capitalize">{activeTab}</span> bookings found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map(renderBookingCard)}
        </div>
      )}

      {/* Modal */}
      {selectedBooking && (
        <div onClick={() => setSelectedBooking(null)}>
          <Modal onClose={() => setSelectedBooking(null)}>
            {renderModalContent(selectedBooking)}
          </Modal>
        </div>
      )}
    </div>
  );
}
