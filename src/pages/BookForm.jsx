import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, differenceInCalendarDays } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
const BookForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, fetchUser } = useAuth();
  const [adminGcashQr, setAdminGcashQr] = useState(null);
  const [showQrOverlay, setShowQrOverlay] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const {
    property,
    room,
    checkIn,
    checkOut,
    adults = 0,
    children = 0
  } = state || {};

  const [activeStep, setActiveStep] = useState(1);
  const [unlockedStep, setUnlockedStep] = useState(1);

  useEffect(() => {
    if (!user) fetchUser();
    const fetchAdminQR = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/admin/gcash-qr`);
        const data = await response.json();
        if (data.gcash_qr) {
          setAdminGcashQr(data.gcash_qr);
        }
      } catch (err) {
        console.error('Failed to load admin GCash QR:', err);
      }
    };
    
    fetchAdminQR();
  }, [user, fetchUser]);

  const formatCurrency = (price) => `₱${parseFloat(price).toFixed(2)}`;
  const getNights = () => {
    if (!checkIn || !checkOut) return 0;
    const nights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
    return nights > 0 ? nights : 0;
  };

  const totalGuests = adults + children;
  const maxGuests = property?.type?.toLowerCase() === 'house'
    ? property?.max_guests || (property?.max_rooms || 1) * 2
    : room?.max_guests;

  const pricePerNight = room
    ? room.discount_price_per_night || room.price_per_night
    : property?.discount_price_per_night || property?.price_per_night;

  const nights = getNights();
  const subtotal = pricePerNight * nights;
  const vat = subtotal * 0.12;
  const totalAmount = subtotal + vat;
  const overCapacity = totalGuests > maxGuests;
  const [receiptImage, setReceiptImage] = useState(null);

  const renderStepHeader = () => (
    <div className="bg-green-50 py-3 text-center text-sm font-medium text-green-700">
      <div className="flex justify-center space-x-6 cursor-pointer">
        <span
          className={`transition ${
            activeStep === 1 ? 'text-green-900 font-bold' : 'text-gray-500'
          } ${activeStep === 3 ? 'cursor-not-allowed opacity-40' : ''}`}
          onClick={() => activeStep !== 3 && setActiveStep(1)}
        >
          1. Booking Information
        </span>
        <span>→</span>
        <span
          className={`transition ${
            activeStep === 2
              ? 'text-green-900 font-bold'
              : unlockedStep >= 2
              ? 'text-gray-500'
              : 'text-gray-300 cursor-not-allowed'
          } ${activeStep === 3 ? 'cursor-not-allowed opacity-40' : ''}`}
          onClick={() => activeStep !== 3 && unlockedStep >= 2 && setActiveStep(2)}
        >
          2. Payment Information
        </span>
        <span>→</span>
        <span className="text-green-800 font-semibold">3. Booking Confirmed</span>
      </div>
    </div>
  );  

  const submitBooking = async () => {
    if (!user || !checkIn || !checkOut || !property) return;
  
    const formData = new FormData();
  
    // Booking info
    formData.append('user_id', user.user_id);
    formData.append('property_id', property.property_id);
    formData.append('check_in_date', new Date(checkIn).toLocaleDateString('en-CA'));
    formData.append('check_out_date', new Date(checkOut).toLocaleDateString('en-CA'));
    formData.append('num_adults', adults);
    formData.append('num_children', children);
    formData.append('num_rooms', room ? 1 : property?.max_rooms || 1);
    formData.append('stay_type', 'overnight');
    formData.append('total_price', totalAmount); // Keep this for compatibility
    formData.append('payment_status', 'pending');
    formData.append('booking_status', 'pending');
  
    if (room?.room_id) formData.append('room_id', `{${room.room_id}}`);
    if (receiptImage) formData.append('gcash_receipt', receiptImage);
  
    // Transaction values
    const serviceCharge = subtotal * 0.15; // used for admin, not included in total_payment
    const vatAmount = subtotal * 0.12;     // included in payment
    const totalPayment = subtotal + vatAmount; // actual payment made by guest
  
    formData.append('subtotal', subtotal.toFixed(2));
    formData.append('vat', vatAmount.toFixed(2));
    formData.append('total_payment', totalPayment.toFixed(2));
    formData.append('service_charge', serviceCharge.toFixed(2)); // just for reference
    formData.append('payment_method', 'gcash');
  
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL_BOOKINGS}/send`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) throw new Error('Failed to create booking');
  
      setActiveStep(3);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking submission failed. Please try again.');
      setActiveStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {loading && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      {!user && (
        <div className="absolute z-50 top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-lg font-bold text-gray-800 mb-2">🔒 Please log in to continue your booking.</h2>
            <p className="text-sm text-gray-600 mb-4">You'll need an account to complete your reservation.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
            >
              Login
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-4">
          <img src="/assets/logo.png" alt="Tikang Logo" className="h-10" />
        </div>
        <div className="text-sm text-blue-700 font-semibold">You're almost done!</div>
      </div>

      {renderStepHeader()}

      {activeStep === 1 && (
      <>
        {/* Back Button Container */}
        <div className="max-w-6xl mx-auto w-full mt-6 px-4">
          <div className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-base font-semibold"
            >
              <span className="text-xl">←</span> Back
            </button>
          </div>
        </div>

        {/* Main Booking Step Content */}
        <div className="flex flex-col lg:flex-row max-w-6xl mx-auto w-full px-4 gap-6">
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Who's the lead guest?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={user?.first_name || ''} readOnly className="border p-3 rounded w-full bg-gray-100" placeholder="First name *" />
                <input type="text" value={user?.last_name || ''} readOnly className="border p-3 rounded w-full bg-gray-100" placeholder="Last name *" />
              </div>
              <input type="email" value={user?.email || ''} readOnly className="border p-3 rounded w-full mt-4 bg-gray-100" placeholder="Email *" />
              <input type="text" value={user?.phone || ''} readOnly className="border p-3 rounded w-full mt-4 bg-gray-100" placeholder="Phone number (optional)" />

              <button
                className="mt-6 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
                onClick={() => {
                  setUnlockedStep(2);
                  setActiveStep(2);
                }}
              >
                NEXT: FINAL STEP
              </button>
              <p className="text-xs text-center text-green-600 mt-2">You won’t be charged yet.</p>
            </div>

            <div className="bg-white border border-blue-200 rounded-xl shadow p-6">
              <h2 className="text-lg font-bold text-blue-800 mb-2">💳 Booking Payment Summary</h2>
              <ul className="text-sm text-gray-700 mb-2 space-y-1">
                <li>🏷️ Nightly Rate: <strong>{formatCurrency(pricePerNight)}</strong></li>
                <li>🛏️ Nights: <strong>{nights}</strong></li>
                <li>📄 Subtotal: <strong>{formatCurrency(subtotal)}</strong></li>
                <li>🧾 VAT (12%): <strong>{formatCurrency(vat)}</strong></li>
              </ul>
              <div className="text-xl font-bold text-green-700 mt-2">
                🔥 Total Amount: {formatCurrency(totalAmount)}
              </div>

              {overCapacity && (
                <div className="mt-4 text-sm bg-red-100 border border-red-300 text-red-800 p-3 rounded-md">
                  ⚠️ You have {totalGuests} guests, but the max allowed is {maxGuests}. Additional fees may apply upon onboarding.
                </div>
              )}

              <div className="mt-4 text-sm bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-md text-center">
                📌 <strong>Cancellation Policy:</strong> If you need to cancel your booking, a <span className="font-bold text-blue-900">50% refund</span> will be issued.  
                For rescheduling requests, please contact the property owner directly. Full refunds are not available.
              </div>
            </div>
          </div>

          {/* Right Summary */}
          <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow text-sm text-gray-800">
            <img
              src={
                property?.thumbnail_url?.[0]
                  ? `${process.env.REACT_APP_API_URL}${property.thumbnail_url[0]}`
                  : "/assets/image_1.webp"
              }
              alt="Property"
              className="rounded-xl mb-4 w-full h-48 object-cover"
            />
            <h3 className="text-xl font-bold text-blue-900 mb-1">{property?.title}</h3>
            <p className="text-gray-600 mb-1">
              📍 {property?.address}, {property?.city}, {property?.province}, {property?.country}
            </p>
            <p className="mb-1">🏠 Type: {property?.type}</p>
            {property?.type?.toLowerCase() === 'house' && (
              <>
                <p className="mb-1">🛏️ Max Rooms: {property?.max_rooms}</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(property?.discount_price_per_night || property?.price_per_night)}
                </p>
              </>
            )}
            {room && (
              <>
                <hr className="my-4 border-gray-300" />
                <img
                  src={
                    room?.room_images?.[0]
                      ? `${process.env.REACT_APP_API_URL}${room.room_images[0]}`
                      : "/assets/image_1.webp"
                  }
                  alt="Room"
                  className="rounded-xl mb-4 w-full h-40 object-cover"
                />
                <h4 className="text-lg font-semibold text-gray-800">{room.room_name}</h4>
                <p className="mb-1">🛏️ Type: {room.room_type}</p>
                <p className="mb-1">👥 Max Guests: {room.max_guests}</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(room?.discount_price_per_night || room?.price_per_night)}
                </p>
              </>
            )}
            <hr className="my-4 border-gray-300" />
            <h4 className="text-base font-semibold mb-2 text-gray-800">📅 Stay Details</h4>
            <p>Check-in: <strong>{format(new Date(checkIn), 'MMM d, yyyy')}</strong></p>
            <p>Check-out: <strong>{format(new Date(checkOut), 'MMM d, yyyy')}</strong></p>
            <p>👤 Adults: {adults}</p>
            <p>🧒 Children: {children}</p>
            <div className="mt-6 bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-md text-center text-sm font-medium">
              ✨ <span className="font-bold">Lowest Price Guaranteed!</span> Book now to lock in today’s best rate.
            </div>
          </div>
        </div>
      </>
    )}

    {activeStep === 2 && (
      <div className="flex flex-col lg:flex-row max-w-6xl mx-auto w-full mt-12 px-4 gap-6">
        {/* Left Payment Section */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow text-center relative">
          <h2 className="text-2xl font-semibold mb-4">💳 GCash Payment</h2>

          {adminGcashQr ? (
            <>
              <div
                className="cursor-pointer"
                onClick={() => setShowQrOverlay(true)}
              >
                <img
                  src={`${process.env.REACT_APP_API_URL}${adminGcashQr}`}
                  alt="GCash QR Code"
                  className="w-64 h-64 object-contain mx-auto mb-2 border rounded-lg shadow transition-transform hover:scale-105"
                />
                <p className="text-xs text-red-600 font-medium">Click image to zoom</p>
              </div>

                {/* 📎 Upload Receipt Label */}
              <p className="text-sm text-gray-700 mt-6 mb-1 font-medium text-left max-w-md mx-auto">
                Upload GCash Receipt:
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setReceiptImage(e.target.files[0])}
                className="border p-3 rounded w-full max-w-md mx-auto mt-4 mb-4"
              />
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
                onClick={submitBooking}
              >
                Submit Payment
              </button>
            </>
          ) : (
            <div className="text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg">
              🚫 <strong>GCash QR not available at the moment.</strong><br />
              Kindly try again later.
            </div>
          )}
        </div>

        {/* Right Summary */}
        <div className="w-full lg:w-1/3 bg-white border border-blue-200 rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-blue-800 mb-2">💳 Booking Payment Summary</h2>
          <ul className="text-sm text-gray-700 mb-2 space-y-1">
            <li>🏷️ Nightly Rate: <strong>{formatCurrency(pricePerNight)}</strong></li>
            <li>🛏️ Nights: <strong>{nights}</strong></li>
            <li>📄 Subtotal: <strong>{formatCurrency(subtotal)}</strong></li>
            <li>🧾 VAT (12%): <strong>{formatCurrency(vat)}</strong></li>
          </ul>
          <div className="text-xl font-bold text-green-700 mt-2">
            🔥 Total Amount: {formatCurrency(totalAmount)}
          </div>

          {overCapacity && (
            <div className="mt-4 text-sm bg-red-100 border border-red-300 text-red-800 p-3 rounded-md">
              ⚠️ You have {totalGuests} guests, but the max allowed is {maxGuests}. Additional fees may apply upon arrival.
            </div>
          )}

          <div className="mt-4 text-sm bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-md text-center">
            📌 <strong>Cancellation Policy:</strong> A <span className="font-bold text-blue-900">50% refund</span> will be issued if the booking is canceled. <br />
            For rescheduling requests, kindly contact the property owner directly.
          </div>
        </div>

        {/* 🔍 Zoom Overlay */}
        {showQrOverlay && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
            onClick={() => setShowQrOverlay(false)}
          >
            <div className="relative max-w-full max-h-full p-4">
              <img
                src={`${process.env.REACT_APP_API_URL}${adminGcashQr}`}
                alt="Zoomed GCash QR"
                className="max-w-full max-h-[90vh] rounded-xl shadow-xl border-4 border-white"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image itself
              />
              <button
                onClick={() => setShowQrOverlay(false)}
                className="absolute top-2 right-2 text-white text-3xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-80"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    )}

      {activeStep === 3 && (
        <div className="max-w-2xl mx-auto mt-12 bg-green-50 border border-green-300 text-center p-8 rounded-xl shadow">
          {/* Animated checkmark */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-green-300 flex items-center justify-center animate-pulse bg-green-100">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 Booking Successfully Submitted!</h2>
          <p className="text-gray-700 mb-2 text-sm sm:text-base">
            Your reservation is now <span className="font-semibold text-green-700">pending confirmation</span> from the host.
          </p>
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            Kindly wait while we finalize the details. You can check your status anytime on the{' '}
            <span className="font-medium text-blue-700 underline cursor-pointer" onClick={() => navigate('/account/bookings')}>
              My Bookings
            </span>{' '}
            page.
          </p>

          <button
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      )}

    </div>
  );
};

export default BookForm;
