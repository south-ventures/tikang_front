import React, { useEffect, useState, useCallback } from 'react';
import { FaStar } from 'react-icons/fa';
import { format } from 'date-fns';
import Modal from '../../../components/Modal';
import LoadingSpinner from '../../../components/LoadingSpinner';
import WarningPopup from '../../../components/WarningPopup';
import { useAuth } from '../../../context/AuthContext';

export default function Reviews() {
  const { fetchUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('to-review');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ comment: '', rating: 0, images: [] });
  const [alert, setAlert] = useState({ message: '', type: '' });

  const fetchData = useCallback(async () => {
    try {
      await fetchUser();
      const token = localStorage.getItem('tikangToken');
      if (!token) return;

      const res = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setReviewForm({ ...reviewForm, images: files });
  };

  const handleSubmitReview = async () => {
    const formData = new FormData();
    formData.append('booking_id', selectedReview.booking_id);
    formData.append('comment', reviewForm.comment);
    formData.append('rating', reviewForm.rating);
    reviewForm.images.forEach((file) => formData.append('images', file));

    try {
      const token = localStorage.getItem('tikangToken');
      const res = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/submit-review`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setAlert({ message: 'Review submitted successfully!', type: 'success' });
        setShowReviewForm(false);
        setSelectedReview(null);
        fetchData();
      } else {
        setAlert({ message: data.message || 'Failed to submit review.', type: 'error' });
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setAlert({ message: 'Unexpected error occurred.', type: 'error' });
    }

    setTimeout(() => setAlert({ message: '', type: '' }), 4000);
  };

  if (loading) return <LoadingSpinner />;

  const reviewed = bookings.filter((b) => b.is_reviewed);
  const unreviewed = bookings.filter((b) => !b.is_reviewed);

  const renderCard = (b) => {
    const image = b.thumbnail_url
      ? `${process.env.REACT_APP_API_URL}${b.thumbnail_url}`
      : '/assets/hotel_default.webp';

    return (
      <div
        key={b.booking_id}
        className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition cursor-pointer"
        onClick={() => setSelectedReview(b)}
      >
        <div className="h-48 bg-gray-200">
          <img src={image} alt={b.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-4 space-y-2">
          <h2 className="font-semibold text-lg text-gray-800">{b.title}</h2>
          <p className="text-sm text-gray-500">{b.address}</p>
          <p className="text-sm text-gray-600">
            {format(new Date(b.check_in_date), 'MMM dd')} - {format(new Date(b.check_out_date), 'MMM dd, yyyy')}
          </p>
          <div className="flex items-center gap-1 pt-1">
            {b.is_reviewed ? (
              [...Array(5)].map((_, j) => (
                <FaStar key={j} className={`h-4 w-4 ${j < b.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
              ))
            ) : (
              <button
                className="px-3 py-1 mt-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReview(b);
                  setShowReviewForm(true);
                  setReviewForm({ comment: '', rating: 0, images: [] });
                }}
              >
                Leave a Review
              </button>
            )}
          </div>
          {b.is_reviewed && <p className="text-sm italic mt-2">"{b.comment}"</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 py-6 max-w-full sm:max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Reviews</h1>

      {alert.message && (
        <WarningPopup
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ message: '', type: '' })}
        />
      )}
      <div className="flex gap-2 overflow-x-auto sm:gap-4 mb-6">
        {['to-review', 'reviewed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-semibold capitalize transition ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab === 'to-review' ? 'To Review' : 'Reviewed'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(activeTab === 'to-review' ? unreviewed : reviewed).map(renderCard)}
      </div>

      {selectedReview && !showReviewForm && (
      <Modal onClose={() => setSelectedReview(null)}>
        <div className="max-h-[90vh] overflow-y-auto p-4 w-full">
          <h2 className="text-2xl font-semibold text-gray-800">{selectedReview.title}</h2>
          <p className="text-sm text-gray-600">{selectedReview.address}</p>
          <p className="text-sm text-gray-500">
            {format(new Date(selectedReview.check_in_date), 'MMM dd, yyyy')} -{' '}
            {format(new Date(selectedReview.check_out_date), 'MMM dd, yyyy')}
          </p>

          <div className="w-full h-64 rounded-lg overflow-hidden mt-2">
            <img
              src={
                selectedReview.thumbnail_url
                  ? `${process.env.REACT_APP_API_URL}${selectedReview.thumbnail_url}`
                  : '/assets/hotel_default.webp'
              }
              alt="Property"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <div className="text-sm space-y-1 mt-3">
            <p><strong>Guests:</strong> {selectedReview.num_adults} Adults, {selectedReview.num_children} Children</p>
            <p><strong>Rooms:</strong> {selectedReview.num_rooms}</p>
            <p><strong>Payment Status:</strong> {selectedReview.payment_status}</p>
          </div>

          {selectedReview.rooms?.length > 0 && (
            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Room Details</h3>
              <div className="space-y-4">
                {selectedReview.rooms.map((room, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-gray-50 border rounded-xl p-4">
                    <img
                      src={room.room_images?.[0]
                        ? `${process.env.REACT_APP_API_URL}${room.room_images[0]}`
                        : '/assets/room_placeholder.webp'}
                      alt={`Room ${idx}`}
                      className="w-32 h-24 object-cover rounded-lg border"
                    />
                    <div className="text-sm space-y-1">
                      <p><strong>Name:</strong> {room.room_name}</p>
                      <p><strong>Type:</strong> {room.room_type}</p>
                      <p><strong>Stay Type:</strong> {room.stay_type}</p>
                      <p><strong>Price/Night:</strong> ₱{room.price_per_night}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReview.is_reviewed && (
            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Your Review</h3>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`h-5 w-5 ${i < selectedReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>

              <p className="text-sm italic text-gray-700">"{selectedReview.comment}"</p>

              {selectedReview.review_images?.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedReview.review_images.map((img, i) => (
                    <img
                      key={i}
                      src={`${process.env.REACT_APP_API_URL}${img}`}
                      alt={`Review ${i + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedReview.is_reviewed && (
            <button
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition"
              onClick={() => {
                setShowReviewForm(true);
                setReviewForm({ comment: '', rating: 0, images: [] });
              }}
            >
              Leave a Review
            </button>
          )}
        </div>
      </Modal>
    )}


      {/* Submit Review Modal */}
      {showReviewForm && selectedReview && (
        <Modal
          onClose={() => {
            setShowReviewForm(false);
            setSelectedReview(null);
          }}
        >
          <>
            <h2 className="text-xl font-semibold mb-3">Submit Your Review</h2>
            <p className="text-sm mb-2 text-gray-600">
              <strong>{selectedReview.title}</strong><br />
              {format(new Date(selectedReview.check_in_date), 'MMM dd')} -{' '}
              {format(new Date(selectedReview.check_out_date), 'MMM dd, yyyy')}
            </p>

            <label className="block text-sm font-medium mt-3">Comment</label>
            <textarea
              rows={3}
              className={`w-full mt-1 border rounded p-2 text-sm ${
                reviewForm.comment.trim() === '' && alert.type === 'error' ? 'border-red-500' : ''
              }`}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            />
            {reviewForm.comment.trim() === '' && alert.type === 'error' && (
              <p className="text-sm text-red-500 mt-1">Comment is required.</p>
            )}

            <label className="block text-sm font-medium mt-3">Rating</label>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`cursor-pointer h-5 w-5 ${i < reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                />
              ))}
            </div>
            {reviewForm.rating === 0 && alert.type === 'error' && (
              <p className="text-sm text-red-500 mt-1">Rating is required.</p>
            )}

            <label className="block text-sm font-medium mt-3">Upload Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-600 mt-1"
            />

            <button
              onClick={() => {
                if (!reviewForm.comment.trim() || reviewForm.rating === 0) {
                  setAlert({ message: 'Please fill out all required fields.', type: 'error' });
                  return;
                }
                handleSubmitReview();
              }}
              className="mt-5 w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700"
            >
              Submit Review
            </button>
          </>
        </Modal>
      )}
    </div>
  );
}
