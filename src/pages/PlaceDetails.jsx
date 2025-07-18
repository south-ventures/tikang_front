import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import WarningPopup from '../components/WarningPopup';
import {
  FaHeart, FaRegHeart, FaTimes, FaBed, FaUsers, FaTag, FaCheckCircle, FaMinus, FaPlus, FaUserFriends, FaChild
} from 'react-icons/fa';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { DateRange } from 'react-date-range';
import { addDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

const PlaceDetails = () => {
  const { user, fetchUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    property_id,
    room_id,
    checkIn,
    checkOut,
    adults,
    children,
    roomNum
  } = location.state || {};
  const [editAdults, setEditAdults] = useState(adults || 1);
  const [editChildren, setEditChildren] = useState(children || 0);
  const [editRooms, setEditRooms] = useState(roomNum || 1);
  const modalRef = useRef();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [overlayImages, setOverlayImages] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showFullPropertyDesc, setShowFullPropertyDesc] = useState(false);
  const [expandedRoomDesc, setExpandedRoomDesc] = useState({});
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('error');
  const [expandedComments, setExpandedComments] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showFullRoomDesc, setShowFullRoomDesc] = useState({});
  const [showAllRoomAmenities] = useState(false);
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [creator, setCreator] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [dateRange, setDateRange] = useState([{
    startDate: checkIn ? new Date(checkIn) : new Date(),
    endDate: checkOut ? new Date(checkOut) : addDays(new Date(), 1),
    key: 'selection'
  }]);
  const [disabledDates, setDisabledDates] = useState([]);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeOverlay();
      }
    };
    if (showOverlay) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOverlay]);

  useEffect(() => {
    const fetchDetailsWithUser = async () => {
      try {
        let currentUser = user;
  
        if (!currentUser) {
          const fetched = await fetchUser();
          currentUser = fetched;
        }
  
        if (!property_id) return;
  
        const res = await fetch(
          `${process.env.REACT_APP_API_URL_PROPERTIES}/property-details/${property_id}?user_id=${currentUser?.user_id || ''}`
        );
        const result = await res.json();
        setData(result);
        setCreator(result.property);
  
        // ✅ Set disabled dates after result is available
        const disabled = result?.property?.disabled_dates || [];
        setDisabledDates(disabled.map(dateStr => new Date(dateStr)));
  
        if (currentUser?.user_id && result.favorites) {
          const fav = result.favorites.find(fav => fav.property_id === property_id);
          setIsFavorite(!!fav);
        }
  
        setLoading(false);
  
        if (room_id) {
          setTimeout(() => {
            const roomEl = document.getElementById(`room-${room_id}`);
            if (roomEl) {
              roomEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              roomEl.classList.add('ring', 'ring-blue-400');
              setTimeout(() => roomEl.classList.remove('ring', 'ring-blue-400'), 1500);
            }
          }, 300);
        }
      } catch (err) {
        console.error('Failed to fetch property details:', err);
      }
    };
  
    fetchDetailsWithUser();
  }, [fetchUser, user, property_id, room_id]);
  

  const handleBook = (room) => {
    navigate('/book', { state: { room } });
  };

  const isDisabledDate = (date) => {
    return disabledDates.some(disabled =>
      date.getFullYear() === disabled.getFullYear() &&
      date.getMonth() === disabled.getMonth() &&
      date.getDate() === disabled.getDate()
    );
  };
  
  const renderDayContent = (date) => {
    const isDisabled = isDisabledDate(date);
    return (
      <div className={`relative`}>
        <span>{date.getDate()}</span>
        {isDisabled && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full mt-1" />
        )}
      </div>
    );
  };

  const toggleFavorite = async () => {
    let currentUser = user;

    // Ensure user is fetched
    if (!currentUser) {
      const fetched = await fetchUser(); // this should return user or null
      currentUser = fetched;
    }
  
    if (!currentUser?.user_id) {
      setPopupMessage('Please log in to add this property to your favorites.');
      setPopupType('error');
      return;
    }
  
    try {
      if (!isFavorite) {
        // Add to favorites
        const res = await fetch(`${process.env.REACT_APP_API_URL_FAVORITES}/add-favorite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser.user_id,
            property_id,
          }),
        });
  
        if (!res.ok) throw new Error('Failed to add favorite.');
        setIsFavorite(true);
        setPopupMessage('Property added to your favorites!');
        setPopupType('success');
      } else {
        // Remove from favorites
        const res = await fetch(`${process.env.REACT_APP_API_URL_FAVORITES}/remove-favorite`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser.user_id,
            property_id,
          }),
        });
  
        if (!res.ok) throw new Error('Failed to remove favorite.');
        setIsFavorite(false);
        setPopupMessage('Property removed from your favorites.');
        setPopupType('success');
      }
    } catch (err) {
      console.error(err);
      setPopupMessage('Something went wrong.');
      setPopupType('error');
    }
  };



  const openOverlay = (images) => {
    const fullURLs = images.map(img => `${process.env.REACT_APP_API_URL}${img}`);
    setOverlayImages(fullURLs);
    setShowOverlay(true);
  };

  const closeOverlay = () => {
    setOverlayImages([]);
    setShowOverlay(false);
  };

  if (loading || !data) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading property details...</div>;
  }

  const {
    title, address, city, province, country,
    thumbnail_url = [], price_per_night, description, amenities, type, max_rooms
  } = data.property || {};

  const galleryImages = thumbnail_url.map(url => `${process.env.REACT_APP_API_URL}${url}`);
  const rooms = data.rooms || [];
  const reviews = data.reviews || [];
  const review_count = data.review_count || 0;
  const total_bookings = data.total_bookings || 0;

  const renderGallery = () => {
    const count = galleryImages.length;
    if (count === 1) return <img src={galleryImages[0]} className="w-full h-64 object-cover rounded-md" alt="Gallery" />;
    if (count === 2) return (
      <div className="grid grid-cols-2 gap-2">{galleryImages.slice(0, 2).map((url, i) =>
        <img key={i} src={url} className="h-64 object-cover rounded-md w-full" alt={`img-${i}`} />
      )}</div>
    );
    if (count === 3) return (
      <div className="grid grid-cols-3 gap-2">
        <img src={galleryImages[0]} className="h-full object-cover rounded-md col-span-1" alt="img-1" />
        <div className="grid grid-rows-2 gap-2 col-span-2">
          {galleryImages.slice(1, 3).map((url, i) => (
            <img key={i} src={url} className="object-cover rounded-md h-full w-full" alt={`img-${i + 2}`} />
          ))}
        </div>
      </div>
    );
    if (count === 4 || count === 5) return (
      <div className="grid grid-cols-3 gap-2">
        <img src={galleryImages[0]} className="object-cover rounded-md col-span-1 h-full" alt="img-1" />
        <div className="grid grid-cols-2 grid-rows-2 gap-2 col-span-2">
          {galleryImages.slice(1, 5).map((url, i) => (
            <img key={i} src={url} className="h-32 object-cover rounded-md w-full" alt={`img-${i + 2}`} />
          ))}
        </div>
      </div>
    );
    return null;
  };

  const truncateText = (text, limit = 160) => {
    if (!text) return '';
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <NavBar />
      <div className="mt-24 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-8 space-y-12">
          
        {/* Gallery */}
        <div className="relative">
        {/* Gallery with Heart Icon */}
        <div className="relative">
          {/* Heart Button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 left-3 z-50 bg-white p-2 rounded-full shadow text-red-500 hover:scale-110 transition"
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>

          {/* Mobile Carousel */}
          {galleryImages?.length > 0 && (
            <div className="block md:hidden z-10 relative">
              <Slider
                dots={true}
                infinite={true}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                className="rounded-lg overflow-hidden"
              >
                {galleryImages.map((img, idx) => (
                  <div key={idx}>
                    <img
                      src={img}
                      alt={`gallery-${idx}`}
                      className="w-full h-64 object-cover"
                      onClick={() => openOverlay(thumbnail_url)}
                    />
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>
          {/* Desktop Grid Gallery */}
          <div className="hidden md:block">
            {renderGallery()}
            <button
              onClick={() => openOverlay(thumbnail_url)}
              className="absolute top-3 right-3 bg-white px-4 py-1 rounded-full shadow border text-sm font-medium hover:scale-105 transition"
            >
              View all images
            </button>
            <button
              onClick={toggleFavorite}
              className="absolute top-3 left-3 bg-white p-2 rounded-full shadow text-red-500 hover:scale-110 transition"
            >
              {isFavorite ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
        </div>
  
        {/* Creator Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 border-b border-gray-300 gap-4">
          <div className="flex items-center gap-4">
          {creator?.creator_picture ? (
            <img
              src={`${process.env.REACT_APP_API_URL}${creator.creator_picture}`}
              alt="creator"
              className="w-14 h-14 rounded-full object-cover border"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white">?</div>
          )}

          <div>
            <p className="font-semibold text-lg">Listed by {creator?.creator_name || 'Unknown'}</p>
            <p className="text-sm text-gray-500">{creator?.creator_email || 'N/A'}</p>
            <p className="text-sm text-gray-500">
              Since {creator?.creator_created_at ? new Date(creator.creator_created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
              }) : 'N/A'}
            </p>
          </div>
          </div>

          <div className="w-full md:w-auto">
          <button
            onClick={() => setShowMessageModal(true)}
            className="mt-2 md:mt-0 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-base font-semibold px-6 py-3 rounded-2xl w-full md:w-auto shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Message Me
          </button>
          </div>
        </div>

  
      {/* Property Info */}
      <div className="py-6 border-b border-gray-300 flex flex-col md:flex-row justify-between items-start md:items-center text-lg">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-3xl font-bold">{title}</h1>
            {type?.toLowerCase() === 'house' && max_rooms && (
              <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                🛏️ Max {max_rooms} Room{max_rooms > 1 ? 's' : ''}
              </span>
            )}
            {type && (
              <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full capitalize">
                🏠 {type}
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">{[address, city, province, country].filter(Boolean).join(', ')}</p>
          <p className="text-green-600 font-semibold mt-1">⭐ {data.average_rating || 'No rating'} • {review_count} reviews</p>
          <p className="text-blue-600 font-semibold mt-1">📖 {total_bookings} total bookings</p>
        </div>

        <div className="mt-4 md:mt-0 text-right">
          <p className="text-sm text-gray-500">From</p>
          <p className="text-3xl font-bold text-red-600">₱ {price_per_night ? parseFloat(price_per_night).toFixed(2) : 'N/A'}</p>
          {type?.toLowerCase() === 'house' && (
            <button
              onClick={() =>
                navigate('/book', {
                  state: {
                    checkIn: dateRange[0].startDate,
                    checkOut: dateRange[0].endDate,
                    adults: editAdults,
                    children: editChildren,
                    roomNum: editRooms,
                    property: data.property
                  }
                })
              }
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-5 rounded-xl hover:scale-105 transition"
            >
              Reserve Now
            </button>
          )}
        </div>
      </div>

  
          {/* Description */}
          <div className="py-6 border-b border-gray-300">
            <p className="text-lg leading-relaxed text-gray-700 whitespace-normal break-words">
              {showFullPropertyDesc ? description : truncateText(description)}
              {description?.length > 160 && (
                <span className="text-blue-500 cursor-pointer ml-2 underline" onClick={() => setShowFullPropertyDesc(prev => !prev)}>
                  {showFullPropertyDesc ? 'Show less' : 'Show more'}
                </span>
              )}
            </p>
          </div>
  
          {/* Amenities */}
          {amenities?.length > 0 && (
            <div className="py-6 border-b border-gray-300">
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-sm text-gray-800 max-w-md">
                {(showAllAmenities ? amenities : amenities.slice(0, 10)).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                    <FaCheckCircle className="text-green-500 text-base" />
                    <span className="uppercase tracking-tight">{item}</span>
                  </div>
                ))}
              </div>
              {amenities.length > 10 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="mt-4 px-4 py-1 rounded bg-gray-100 hover:bg-gray-200 transition text-sm font-medium"
                >
                  {showAllAmenities
                    ? `HIDE ${amenities.length - 10} AMENITIES`
                    : `VIEW ${amenities.length - 10} AMENITIES`}
                </button>
              )}
            </div>
          )}


  
         {/* Rooms */}
          {type?.toLowerCase() !== 'house' && (
            <div className="py-6 border-b border-gray-300">
              <h2 className="text-2xl font-bold mb-6 text-[#1e3369]">Available Rooms</h2>
              {rooms.map((room, idx) => (
                <div
                  key={idx}
                  id={`room-${room.room_id}`}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 px-6 py-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 mb-6 border border-gray-100"
                  onClick={(e) => {
                    if (e.target.tagName !== 'BUTTON') {
                      setSelectedRoom(room);
                      setShowRoomModal(true);
                    }
                  }}
                >
                  {/* Image */}
                  <div className="md:col-span-1 relative">
                    <img
                      src={room.room_images?.[0] ? `${process.env.REACT_APP_API_URL}${room.room_images[0]}` : ''}
                      alt="room"
                      onClick={(e) => {
                        e.stopPropagation();
                        openOverlay(room.room_images);
                      }}
                      className="w-full h-32 object-cover rounded-xl shadow-sm hover:scale-105 transition"
                    />
                  </div>

                  {/* Info */}
                  <div className="md:col-span-3 space-y-2 text-gray-700">
                    <p className="font-semibold flex items-center gap-2 text-lg text-[#1e3369]">
                      <FaBed /> {room.room_name}
                    </p>
                    <p className="flex items-center gap-2 text-sm"><FaTag /> {room.room_type}</p>
                    <p className="flex items-center gap-2 text-sm"><FaUsers /> Max Guests: {room.max_guests}</p>
                    <p className="text-sm"><span className="font-semibold">Amenities:</span> {room.amenities?.join(', ')}</p>
                    <p className="text-sm text-gray-600 mt-1 whitespace-normal break-words leading-relaxed">
                      {expandedRoomDesc[room.room_id] ? room.description : truncateText(room.description, 100)}
                      {room.description?.length > 100 && (
                        <span
                          className="text-blue-600 font-medium cursor-pointer ml-1 underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedRoomDesc(prev => ({
                              ...prev,
                              [room.room_id]: !prev[room.room_id],
                            }));
                          }}
                        >
                          {expandedRoomDesc[room.room_id] ? 'Show less' : 'Show more'}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Pricing + Button */}
                  <div className="md:col-span-1 flex flex-col justify-between items-end">
                    {room.discount_price_per_night ? (
                      <>
                        <p className="text-sm text-gray-500 line-through">₱{room.price_per_night}</p>
                        <p className="text-2xl font-bold text-red-600">₱{room.discount_price_per_night}</p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold text-red-600">₱{room.price_per_night}</p>
                    )}
                    <button
                      onClick={() =>
                        navigate('/book', {
                          state: {
                            checkIn: dateRange[0].startDate,
                            checkOut: dateRange[0].endDate,
                            adults: editAdults,
                            children: editChildren,
                            room: room,
                            property: data.property
                          }
                        })
                      }
                      className="mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-base font-semibold py-3 px-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Book now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

  
          {/* Reviews */}
          <div className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-base text-gray-500">No reviews yet.</p>
            ) : (
              reviews.map((r, i) => (
                <div key={i} className="border rounded-xl p-5 mb-4 bg-gray-50 shadow-sm">
                  <div className="font-semibold text-base">{r.full_name}</div>
                  <div className="text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</div>
                  <div className="text-yellow-500 mt-1">⭐ {r.rating}</div>
                  <p className="mt-2 text-base whitespace-normal break-words leading-relaxed">
                  {expandedComments[r.review_id] || r.comment.length <= 150
                    ? r.comment
                    : r.comment.slice(0, 150) + '...'}
                  {r.comment.length > 150 && (
                    <span
                      className="text-blue-600 underline ml-2 cursor-pointer"
                      onClick={() =>
                        setExpandedComments((prev) => ({
                          ...prev,
                          [r.review_id]: !prev[r.review_id],
                        }))
                      }
                    >
                      {expandedComments[r.review_id] ? 'See less' : 'See more'}
                    </span>
                  )}
                </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Container for Dates & Guests */}
      <div>
        {/* DESKTOP: ≥1900px floating sidebar */}
        <div className="hidden xl-desktop:block fixed right-6 top-28 w-80 bg-gradient-to-br from-green-100 to-green-200 shadow-2xl border border-green-300 rounded-2xl z-30 p-6 space-y-6">
          <h2 className="text-xl font-bold text-green-900">Stay Details</h2>

          {/* DATE DISPLAY & PICKER */}
          <div className="text-green-800 text-sm w-full space-y-2">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full px-3 py-2 bg-white text-green-700 rounded-md shadow text-center"
            >
              {`${format(dateRange[0].startDate, 'MMM d, yyyy')} - ${format(dateRange[0].endDate, 'MMM d, yyyy')}`}
            </button>
            {showCalendar && (
              <div className="relative w-full">
                <div className="w-full overflow-hidden rounded-xl">
                <DateRange
                    locale={enUS}
                    editableDateInputs
                    ranges={dateRange}
                    onChange={(item) => setDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    minDate={new Date()}
                    disabledDates={disabledDates}
                    rangeColors={["#34d399"]}
                    showDateDisplay={false}
                    dayContentRenderer={renderDayContent}
                  />
                </div>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="absolute top-1 right-2 text-sm text-red-500 hover:underline"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* GUEST CONTROLS */}
          {[['Rooms', editRooms, setEditRooms, 1, <FaBed />],
            ['Adults', editAdults, setEditAdults, 1, <FaUserFriends />],
            ['Children', editChildren, setEditChildren, 0, <FaChild />],
          ].map(([label, value, setter, min, icon], i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="flex items-center gap-2 font-medium">{icon} {label}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setter(Math.max(min, value - 1))}
                  className="bg-green-200 hover:bg-green-300 text-green-800 px-3 py-1 rounded-full text-lg"
                >
                  <FaMinus />
                </button>
                <span className="text-base">{value}</span>
                <button
                  onClick={() => setter(value + 1)}
                  className="bg-green-200 hover:bg-green-300 text-green-800 px-3 py-1 rounded-full text-lg"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* TABLET: 1000px–1899px bottom bar */}
        <div className="hidden custom-md:flex fixed bottom-0 left-0 w-full bg-gradient-to-r from-green-100 to-green-200 border-t border-green-300 shadow-inner z-30 px-4 py-3 justify-between items-center text-green-900 text-sm overflow-x-auto">
        <div className="relative">
          <button
            onClick={() => setShowCalendar(true)}
            className="px-3 py-1 bg-white text-green-700 rounded-md shadow"
          >
            {`${format(dateRange[0].startDate, 'MMM d, yyyy')} - ${format(dateRange[0].endDate, 'MMM d, yyyy')}`}
          </button>
        </div>


          <div className="flex items-center gap-6">
            {[['Rooms', editRooms, setEditRooms, 1],
              ['Adults', editAdults, setEditAdults, 1],
              ['Children', editChildren, setEditChildren, 0],
            ].map(([label, value, setter, min], i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-semibold">{label}:</span>
                <button
                  onClick={() => setter(Math.max(min, value - 1))}
                  className="px-2 py-1 bg-green-200 hover:bg-green-300 rounded-full text-xs"
                >
                  <FaMinus />
                </button>
                <span>{value}</span>
                <button
                  onClick={() => setter(value + 1)}
                  className="px-2 py-1 bg-green-200 hover:bg-green-300 rounded-full text-xs"
                >
                  <FaPlus />
                </button>
              </div>
            ))}
          </div>
        </div>


        {/* MOBILE: <1000px floating container */}
        <div className="custom-md:hidden xl-desktop:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-[400px] bg-gradient-to-br from-green-100 to-green-200 border border-green-300 shadow-xl rounded-2xl z-50 px-4 py-6 pb-16 text-green-900 text-sm font-medium space-y-4">          <div className="w-full space-y-2">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full px-3 py-2 bg-white text-green-700 rounded-md shadow text-center"
            >
              {`${format(dateRange[0].startDate, 'MMM d, yyyy')} - ${format(dateRange[0].endDate, 'MMM d, yyyy')}`}
            </button>
            {showCalendar && (
              <div className="relative w-full">
                  <DateRange
                    locale={enUS}
                    editableDateInputs
                    ranges={dateRange}
                    onChange={(item) => setDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    minDate={new Date()}
                    disabledDates={disabledDates}
                    rangeColors={["#34d399"]}
                    showDateDisplay={false}
                    dayContentRenderer={renderDayContent}
                  />
                <button
                  onClick={() => setShowCalendar(false)}
                  className="absolute top-1 right-2 text-sm text-red-500 hover:underline"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {[['Rooms', editRooms, setEditRooms, 1, <FaBed />],
            ['Adults', editAdults, setEditAdults, 1, <FaUserFriends />],
            ['Children', editChildren, setEditChildren, 0, <FaChild />],
          ].map(([label, value, setter, min, icon], i) => (
            <div key={i} className="flex justify-between items-center gap-2">
              <span className="w-24 flex items-center gap-2">{icon} {label}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setter(Math.max(min, value - 1))}
                  className="px-2 py-1 bg-green-200 rounded-full hover:bg-green-300 text-xs"
                >
                  <FaMinus />
                </button>
                <span>{value}</span>
                <button
                  onClick={() => setter(value + 1)}
                  className="px-2 py-1 bg-green-200 rounded-full hover:bg-green-300 text-xs"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>



      <Footer />

      {/* Image Modal Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center px-4">
          <div ref={modalRef} className="relative bg-white max-w-6xl w-full max-h-[85vh] p-6 overflow-y-auto rounded-lg shadow-2xl">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-2xl"
              onClick={closeOverlay}
            >
              <FaTimes />
            </button>
            <div className="columns-1 sm:columns-2 md:columns-3 gap-4 mt-6 space-y-4">
              {overlayImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`img-${idx}`}
                  className={`w-full object-cover rounded-lg shadow-md mb-4 break-inside-avoid transition duration-300 hover:scale-105 ${
                    idx % 5 === 0 ? 'h-80' :
                    idx % 3 === 0 ? 'h-64' :
                    idx % 2 === 0 ? 'h-72' : 'h-60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {showRoomModal && selectedRoom && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center px-4"
          onClick={() => setShowRoomModal(false)}
        >
          <div
            className="relative bg-white max-w-5xl w-full max-h-[85vh] rounded-2xl p-6 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-3xl"
              onClick={() => setShowRoomModal(false)}
            >
              <FaTimes />
            </button>

            {/* Images */}
            <div className="mb-6">
              {/* Mobile Carousel */}
              <div className="block md:hidden">
                <Slider
                  dots={true}
                  infinite={true}
                  speed={500}
                  slidesToShow={1}
                  slidesToScroll={1}
                  className="rounded-xl overflow-hidden"
                >
                  {selectedRoom.room_images?.map((img, idx) => (
                    <div key={idx}>
                      <img
                        src={`${process.env.REACT_APP_API_URL}${img}`}
                        alt={`room-img-${idx}`}
                        className="w-full h-64 object-cover rounded-xl"
                      />
                    </div>
                  ))}
                </Slider>
              </div>

              {/* Desktop Masonry */}
              <div className="hidden md:block columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                {selectedRoom.room_images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={`${process.env.REACT_APP_API_URL}${img}`}
                    alt={`room-img-${idx}`}
                    className={`w-full object-cover rounded-xl shadow-md break-inside-avoid transition duration-300 hover:scale-105 ${
                      idx % 5 === 0
                        ? 'h-80'
                        : idx % 3 === 0
                        ? 'h-64'
                        : idx % 2 === 0
                        ? 'h-72'
                        : 'h-60'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Room Name & Price */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
              <h2 className="text-3xl font-bold text-gray-800">{selectedRoom.room_name}</h2>
              <div className="mt-2 md:mt-0 text-right">
                {selectedRoom.discount_price_per_night ? (
                  <>
                    <p className="text-sm text-gray-400 line-through">
                      ₱{parseFloat(selectedRoom.price_per_night).toFixed(2)}
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      ₱{parseFloat(selectedRoom.discount_price_per_night).toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-red-600">
                    ₱{parseFloat(selectedRoom.price_per_night).toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Type */}
            <p className="text-lg text-gray-500 mb-3">Type: {selectedRoom.room_type}</p>

            {/* Description */}
            <div className="text-gray-700 leading-relaxed mb-3 whitespace-normal break-words">
              {selectedRoom.description?.length > 200 ? (
                <p>
                  {showFullRoomDesc
                    ? selectedRoom.description
                    : `${selectedRoom.description.slice(0, 200)}...`}
                  <span
                    className="ml-2 text-blue-500 underline cursor-pointer"
                    onClick={() => setShowFullRoomDesc((prev) => !prev)}
                  >
                    {showFullRoomDesc ? 'See less' : 'See more'}
                  </span>
                </p>
              ) : (
                <p>{selectedRoom.description}</p>
              )}
            </div>

            {/* Max Guests */}
            <p className="text-gray-700 text-lg mb-3">
              <strong>Max Guests:</strong> {selectedRoom.max_guests}
            </p>

            {/* Amenities */}
            <div className="text-gray-700 text-lg mb-20">
              <strong className="block mb-2">Amenities:</strong>
              {selectedRoom.amenities?.length ? (
                <>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {(showAllRoomAmenities
                      ? selectedRoom.amenities
                      : selectedRoom.amenities.slice(0, 10)
                    ).map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <FaCheckCircle className="text-green-600 mt-1" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>

                  {selectedRoom.amenities.length > 10 && (
                    <button
                      onClick={() => setShowAllAmenities(!showAllRoomAmenities)}
                      className="mt-4 text-blue-600 text-sm underline hover:text-blue-800 transition"
                    >
                      {showAllAmenities
                        ? 'Hide Amenities'
                        : `View ${selectedRoom.amenities.length - 10} more Amenities`}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">N/A</p>
              )}
            </div>

            {/* Floating Button Inside Modal */}
            <div className="sticky bottom-0 bg-white pt-4 pb-4 text-right -mx-6 px-6 border-t">
              <button
                onClick={() => handleBook(selectedRoom)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-xl text-lg font-semibold transition hover:scale-105"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
      {showMessageModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4"
        onClick={() => setShowMessageModal(false)}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-xl"
            onClick={() => setShowMessageModal(false)}
          >
            &times;
          </button>
          <h2 className="text-xl font-semibold mb-4">Send a Message</h2>

          <label className="block mb-2 font-medium text-sm">Title</label>
          <input
            type="text"
            value={messageTitle}
            onChange={(e) => setMessageTitle(e.target.value)}
            placeholder="Enter title"
            className="w-full border rounded px-3 py-2 mb-4 text-sm"
          />

          <label className="block mb-2 font-medium text-sm">Message</label>
          <textarea
            rows={4}
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Write your message here..."
            className="w-full border rounded px-3 py-2 text-sm"
          ></textarea>

          <button
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
            onClick={async () => {
              if (!messageTitle || !messageBody) {
                setPopupMessage('Title and message are required.');
                setPopupType('error');
                return;
              }

              let currentUser = user;

              // If user is null or undefined, try to fetch
              if (!currentUser) {
                const fetched = await fetchUser(); // Ensure this returns a proper user or null
                currentUser = fetched;
              }

              const sender_id = currentUser?.user_id;
              const recipient_id = creator?.lessor_id;
              const property_id = data?.property?.property_id;

              if (!sender_id || !recipient_id || !property_id) {
                setPopupMessage('Unable to send message. Please make sure you are logged in and viewing a valid listing.');
                setPopupType('error');
                return;
              }

              try {
                const res = await fetch(`${process.env.REACT_APP_API_URL_MESSAGES}/send`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    sender_id,
                    recipient_id,
                    title: messageTitle,
                    message: messageBody,
                    property_id,
                  }),
                });

                const result = await res.json();

                if (res.ok) {
                  setPopupMessage('Message sent successfully, kindly go to messages to check for replies');
                  setPopupType('success');
                  setMessageTitle('');
                  setMessageBody('');
                  setShowMessageModal(false);
                } else {
                  throw new Error(result.error || 'Message failed to send.');
                }
              } catch (err) {
                console.error(err);
                setPopupMessage('An error occurred while sending the message.');
                setPopupType('error');
              }
            }}
          >
            Submit Message
          </button>

        </div>
      </div>
    )}
    {showCalendar && (
      <div className="hidden custom-md:block xl-desktop:hidden fixed bottom-[90px] left-4 z-[999] bg-white rounded-xl shadow-lg">
          <DateRange
            locale={enUS}
            editableDateInputs
            ranges={dateRange}
            onChange={(item) => setDateRange([item.selection])}
            moveRangeOnFirstSelection={false}
            minDate={new Date()}
            disabledDates={disabledDates}
            rangeColors={["#34d399"]}
            showDateDisplay={false}
            dayContentRenderer={renderDayContent}
          />
        <div className="text-right px-3 pb-2">
          <button
            onClick={() => setShowCalendar(false)}
            className="text-sm text-red-500 hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    )}
      {/* Warning Popup */}
      <WarningPopup
        message={popupMessage}
        type={popupType}
        onClose={() => setPopupMessage('')}
      />
    </div>
  );
};

export default PlaceDetails;
