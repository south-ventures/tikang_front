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
import { useAuth } from '../../../context/AuthContext';

export default function Bookings() {
  const { fetchUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        await fetchUser(); // ensures user is loaded and token is valid
        const token = localStorage.getItem('tikangToken');
        if (!token) return;
  
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
  }, [fetchUser]);

  const filteredBookings = bookings.filter(
    (b) => b.booking_status?.toLowerCase() === activeTab
  );

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }

    const token = localStorage.getItem('tikangToken');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/cancel-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: selectedBooking.booking_id,
          cancel_reason: cancelReason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Booking cancelled successfully!');
        setShowCancelModal(false);
        setCancelReason('');
        setBookings((prev) =>
          prev.map((b) =>
            b.booking_id === selectedBooking.booking_id
              ? { ...b, booking_status: 'cancelled', cancel_reason: cancelReason }
              : b
          )
        );
      } else {
        alert(data.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      console.error('❌ Cancel failed:', err);
      alert('An error occurred while cancelling the booking.');
    }
  };

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
            {booking.booking_status === 'completed' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/account/reviews');
                }}
                className={`text-sm font-semibold hover:underline ${
                  booking.review_id ? 'text-blue-600' : 'text-green-600'
                }`}
              >
                {booking.review_id ? 'View Review' : 'Leave Review'}
              </button>
            )}
            {['pending', 'confirmed'].includes(booking.booking_status?.toLowerCase()) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBooking(booking);
                  setShowCancelModal(true);
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
                setShowReceipt(false);
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
        <div className="w-full h-64 overflow-hidden rounded-t-2xl">
          <img
            src={booking.thumbnail_url ? `${process.env.REACT_APP_API_URL}${booking.thumbnail_url}` : '/assets/hotel_default.webp'}
            alt="Property"
            className="w-full h-full object-cover"
          />
        </div>

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
            <p><strong>Additional Info:</strong> <span className="capitalize">{booking.additional_info}</span></p>
          </div>
        </div>

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

        <div className="px-8 pb-4 mt-4 space-y-4">
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => {
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
        </div>

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

      <div className="flex gap-2 overflow-x-auto sm:gap-4 mb-6">
        {['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'].map((tab) => (
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

      {selectedBooking && (
        <div onClick={() => setSelectedBooking(null)}>
          <Modal onClose={() => setSelectedBooking(null)}>
            {renderModalContent(selectedBooking)}
          </Modal>
        </div>
      )}

      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4">
          <div
            className="bg-white rounded-2xl w-full max-w-xl p-8 space-y-6 relative shadow-2xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900">Cancel Booking</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              Please provide a reason for cancelling this booking.
              <br />
              <span className="text-red-600 font-semibold block mt-2">
                Important Notice:
              </span>
              <span className="text-gray-800">
                Cancelling will only refund <strong>50%</strong> of your total payment (
                <strong>₱{Number(selectedBooking?.total_price * 0.5).toFixed(2)}</strong>).
              </span>
            </p>
            <textarea
              rows={5}
              className="w-full border border-gray-300 rounded-lg p-4 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              placeholder="Write your cancellation reason here..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="px-5 py-2 text-base bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-6 py-2 text-base bg-red-600 text-white rounded-full hover:bg-red-700 transition font-semibold"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
