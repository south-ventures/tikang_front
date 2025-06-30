import React, { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import Modal from '../../../components/Modal';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { format } from 'date-fns';
import { useAuth } from '../../../context/AuthContext';

export default function Reviews() {
  useAuth(); // Keeping context available if needed elsewhere

  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [activeTab, setActiveTab] = useState('to-review');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('tikangToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [reviewedRes, unreviewedRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL_GUEST}/reviews`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL_GUEST}/no-reviews`, { headers })
      ]);

      const reviewedData = await reviewedRes.json();
      const unreviewedData = await unreviewedRes.json();

      setReviews(reviewedData.reviews || []);
      setUnreviewed(unreviewedData.bookings || []);
    } catch (err) {
      console.error('Error fetching review data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">My Reviews</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('to-review')}
          className={`px-4 py-2 rounded-t font-semibold ${
            activeTab === 'to-review' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          To Review
        </button>
        <button
          onClick={() => setActiveTab('reviewed')}
          className={`px-4 py-2 rounded-t font-semibold ${
            activeTab === 'reviewed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Reviewed
        </button>
      </div>

      {/* To Review Tab */}
      {activeTab === 'to-review' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {unreviewed.length === 0 ? (
            <div className="col-span-full text-left text-gray-500">No bookings to review yet.</div>
          ) : (
            unreviewed.map((booking, index) => (
              <div key={index} className="bg-white border rounded-lg p-4 shadow">
                <h2 className="text-lg font-semibold text-gray-800">{booking.property_name}</h2>
                <p className="text-sm text-gray-600 mb-1">
                  {format(new Date(booking.check_in_date), 'MMM dd, yyyy')} –{' '}
                  {format(new Date(booking.check_out_date), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-gray-500 mb-2">Stay Type: {booking.stay_type}</p>
                <button
                  className="text-white bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2 rounded mt-2"
                  onClick={() => alert('Review Now modal or redirect logic here')}
                >
                  Review Now
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reviewed Tab */}
      {activeTab === 'reviewed' && (
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500">You haven’t reviewed any stays yet.</p>
          ) : (
            reviews.map((review, index) => {
              const bg = review.thumbnail_url || '/assets/hotel_default.webp';
              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl shadow-md border border-gray-200"
                  style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="backdrop-blur-sm bg-white/80 p-5 relative z-10">
                    <h2 className="text-lg font-semibold text-gray-800">{review.property_name}</h2>
                    <p className="text-sm text-gray-600 mb-1">
                      {format(new Date(review.check_in_date), 'MMMM dd, yyyy')} –{' '}
                      {format(new Date(review.check_out_date), 'MMMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-700 italic mb-2">"{review.comment}"</p>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
                    >
                      View Info
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-black opacity-10" />
                </div>
              );
            })
          )}
        </div>
      )}

      {selectedReview && (
        <Modal onClose={() => setSelectedReview(null)}>
          <div
            className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-300 max-h-[90vh] overflow-y-auto"
            style={{
              backgroundImage: `url(${selectedReview.thumbnail_url || '/assets/hotel_default.webp'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <h2 className="text-2xl font-bold">{selectedReview.property_name}</h2>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/90">
                <p><strong>Check-in:</strong> {format(new Date(selectedReview.check_in_date), 'MMMM dd, yyyy')}</p>
                <p><strong>Check-out:</strong> {format(new Date(selectedReview.check_out_date), 'MMMM dd, yyyy')}</p>
                <p><strong>Adults:</strong> {selectedReview.num_adults}</p>
                <p><strong>Children:</strong> {selectedReview.num_children}</p>
                <p><strong>Rooms:</strong> {selectedReview.num_rooms}</p>
                <p><strong>Stay Type:</strong> {selectedReview.stay_type}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Comment</h3>
                <p className="text-sm italic text-white/90">{selectedReview.comment}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Rating</h3>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`h-5 w-5 ${i < selectedReview.rating ? 'text-yellow-400' : 'text-gray-400'}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Room Details</h3>
                {selectedReview.rooms?.length > 0 ? (
                  <ul className="list-disc list-inside text-sm">
                    {selectedReview.rooms.map((room, i) => (
                      <li key={i}>{room.room_name} – {room.room_type}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm italic text-white/80">No room details available.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Review Images</h3>
                {selectedReview.review_images?.length > 0 ? (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {selectedReview.review_images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Room view ${i + 1}`}
                        className="w-24 h-24 rounded-lg object-cover border border-white/40 shadow-sm"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-white/80">No images provided.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
)}
    </div>
  );
}
