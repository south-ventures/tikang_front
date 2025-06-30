import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import hotelImage from '../../../assets/hotel_default.webp';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function RecommendedHomes() {
  const [groupedByCity, setGroupedByCity] = useState({});
  const [topCities, setTopCities] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [selectedHome, setSelectedHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL_PROPERTIES}/with-reviews`);
        const data = await res.json();

        const cityGroups = {};
        for (const property of data) {
          if (!property.city) continue;
          if (!cityGroups[property.city]) {
            cityGroups[property.city] = [];
          }
          cityGroups[property.city].push(property);
        }

        const sortedCities = Object.entries(cityGroups)
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 10);

        const topCityNames = sortedCities.map(([city]) => city);
        const grouped = Object.fromEntries(sortedCities);

        setTopCities(topCityNames);
        setGroupedByCity(grouped);
        setActiveTab(topCityNames[0] || '');
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const capitalize = (text) => text?.charAt(0).toUpperCase() + text?.slice(1);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      weekday: 'short',
    });

  const goToSearchPage = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    navigate('/search', {
      state: {
        destination: activeTab,
        checkIn: today.toISOString().split('T')[0],
        checkOut: tomorrow.toISOString().split('T')[0],
        adults: 2,
        children: 0,
        rooms: 1,
      },
    });
  };

  return (
    <section id="recommended-homes" className="bg-[#3A6EA5] py-12 px-6">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white">
            Featured homes recommended for you
          </h2>
          {activeTab && (
            <button
              onClick={goToSearchPage}
              className="text-white text-sm underline hover:text-blue-100"
            >
              See more ({activeTab}) properties →
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 text-sm border-b border-blue-100 text-white overflow-x-auto">
          {topCities.map((city) => (
            <button
              key={city}
              onClick={() => setActiveTab(city)}
              className={`pb-2 border-b-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === city
                  ? 'border-white text-white font-semibold'
                  : 'border-transparent text-blue-100 hover:text-white'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {(groupedByCity[activeTab] || []).slice(0, 6).map((home, i) => (
              <div
                key={i}
                onClick={() => setSelectedHome(home)}
                className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-200 cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={
                      home.thumbnail_url?.[0]
                        ? `${process.env.REACT_APP_API_URL}${home.thumbnail_url[0]}`
                        : hotelImage
                    }
                    alt={home.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = hotelImage;
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    ★ {home.review_count > 0 && home.average_rating !== null ? parseFloat(home.average_rating).toFixed(1) : 0}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">
                    {home.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{home.city}</p>
                  <p className="text-xs text-gray-400">Per night before taxes</p>
                  <p className="text-sm font-bold text-red-500 mt-1">
                    ₱{parseFloat(home.price_per_night).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedHome && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center px-4 py-10"
          onClick={(e) => {
            if (e.target.classList.contains('bg-black')) setSelectedHome(null);
          }}
        >
          <div className="bg-white max-w-2xl w-full rounded-xl overflow-hidden shadow-2xl">
            <div className="relative">
              <img
                src={
                  selectedHome.thumbnail_url?.[0]
                    ? `${process.env.REACT_APP_API_URL}${selectedHome.thumbnail_url[0]}`
                    : hotelImage
                }
                alt={selectedHome.title}
                className="w-full h-64 md:h-80 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = hotelImage;
                }}
              />
              <button
                onClick={() => setSelectedHome(null)}
                className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm hover:bg-opacity-90"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {selectedHome.title}
              </h3>
              <p className="text-gray-600 text-sm mb-1">
                {selectedHome.city} — {capitalize(selectedHome.type)}
              </p>
              <p className="text-gray-400 text-sm mb-3">
                {selectedHome.review_count} review{selectedHome.review_count === 1 ? '' : 's'} • Rating: ★{' '}
                {selectedHome.review_count > 0 && selectedHome.average_rating !== null
                  ? parseFloat(selectedHome.average_rating).toFixed(1)
                  : 0}
              </p>
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                {selectedHome.description && selectedHome.description !== 'null'
                  ? selectedHome.description
                  : 'No description available.'}
              </p>
              <div className="flex justify-between items-center mb-6">
                <p className="text-xl font-bold text-red-500">
                  ₱{parseFloat(selectedHome.price_per_night).toFixed(2)}
                </p>
                <button
                  onClick={() => {
                    const today = new Date();
                    const tomorrow = new Date();
                    tomorrow.setDate(today.getDate() + 1);

                    navigate(`/property/${selectedHome.title?.toLowerCase().replace(/\s+/g, '-')}`, {
                      state: {
                        property_id: selectedHome.property_id,
                        room_id: selectedHome.type?.toLowerCase() === 'house' ? null : selectedHome.rooms?.[0]?.room_id || null,
                        checkIn: today.toISOString().split('T')[0],
                        checkOut: tomorrow.toISOString().split('T')[0],
                        adults: 1,
                        children: 0,
                        rooms: 1,
                      },
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-full font-medium"
                >
                  {selectedHome.type?.toLowerCase() === 'house' ? 'Reserve Now!' : 'Check Rooms'}
                </button>
              </div>

              {Array.isArray(selectedHome.reviews) && selectedHome.reviews.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Latest Reviews</h4>
                  <div className="space-y-4">
                    {[...selectedHome.reviews]
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .slice(0, 5)
                      .map((review, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-md border">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold text-gray-700">{review.full_name}</p>
                            <span className="text-yellow-500 text-sm">★ {review.rating}</span>
                          </div>
                          <p className="text-sm text-gray-600 italic mb-1">"{review.comment}"</p>
                          <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
