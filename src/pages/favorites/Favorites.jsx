import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import hotelImage from '../../assets/hotel_default.webp';
import NavBar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FaHeart } from 'react-icons/fa';
import WarningPopup from '../../components/WarningPopup';
import { addDays, formatISO } from 'date-fns';

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState('');
  const [popupType, setPopupType] = useState('info');

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL_FAVORITES}/${user.user_id}`);
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      }
    };
    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (property_id) => {
    const confirmRemove = window.confirm(
      'Clicking this will remove this property from your favorites. Would you like to continue?'
    );
    if (!confirmRemove) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_FAVORITES}/remove-favorite`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
          property_id,
        }),
      });

      if (!res.ok) throw new Error('Failed to remove favorite');

      setFavorites((prev) => prev.filter((f) => f.property_id !== property_id));
      setPopupMsg('Successfully removed from favorites.');
      setPopupType('success');
    } catch (err) {
      setPopupMsg('Failed to remove favorite. Please try again.');
      setPopupType('error');
    }

    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2500);
  };

  const handleCardClick = (home) => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const slug = home.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || 'property';

    navigate(`/property/${slug}`, {
      state: {
        property_id: home.property_id,
        room_id: '',
        checkIn: formatISO(today, { representation: 'date' }),
        checkOut: formatISO(tomorrow, { representation: 'date' }),
        adults: 1,
        children: 0,
        roomNum: 1,
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <NavBar />

      <main className="flex-grow px-4 pt-32 pb-12">
        {!user ? (
          <div className="flex items-center justify-center h-[calc(100vh-120px)]">
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition"
              onClick={() => navigate('/login')}
            >
              Log in to view favorites
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
              Favorites
            </h2>

            {favorites.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-xl text-gray-600">No added favorites</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {favorites.map((home, index) => (
                  <div
                    key={index}
                    className="relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer"
                  >
                    <img
                      src={
                        home.thumbnail_url?.[0]
                          ? `${process.env.REACT_APP_API_URL}${home.thumbnail_url[0]}`
                          : hotelImage
                      }
                      alt={home.title}
                      className="w-full h-48 object-cover"
                      onClick={() => handleCardClick(home)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = hotelImage;
                      }}
                    />
                    <div className="p-4" onClick={() => handleCardClick(home)}>
                      <h3 className="text-lg font-semibold text-gray-800">{home.title}</h3>
                      <p className="text-sm text-gray-500 mb-1">
                        {home.city}, {home.province}
                      </p>
                      <p className="text-xs text-gray-400">Per night before taxes</p>
                      <p className="text-lg font-bold text-red-500 mt-1">
                        ₱{parseFloat(home.price_per_night).toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(home.property_id);
                      }}
                      className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow text-red-500 hover:scale-110 transition"
                    >
                      <FaHeart />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {showPopup && (
        <WarningPopup
          type={popupType}
          message={popupMsg}
        />
      )}
    </div>
  );
};

export default Favorites;
