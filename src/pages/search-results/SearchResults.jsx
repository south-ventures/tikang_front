import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaMapMarkerAlt,
  FaUsers,
  FaHome,
  FaHotel,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
} from 'react-icons/fa';
import NavBar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BudgetFilter from './components/BudgetFilter';
import RightFilter from './components/RightFilter';
import LoadingSpinner from '../../components/LoadingSpinner';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    destination = '',
    checkIn,
    checkOut,
    stayType,
    adults = 2,
    children = 0,
    rooms = 1,
  } = location.state || {};

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budgetRange, setBudgetRange] = useState([0, 20000]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [propertyAmenities, setPropertyAmenities] = useState([]);
  const [selectedPropertyAmenities, setSelectedPropertyAmenities] = useState([]);
  const [roomAmenities, setRoomAmenities] = useState([]);
  const [selectedRoomAmenities, setSelectedRoomAmenities] = useState([]);
  const [selectedMaxGuests, setSelectedMaxGuests] = useState([]);
  const [maxGuestOptions, setMaxGuestOptions] = useState([]);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          weekday: 'short',
        })
      : 'N/A';

  const isRoomAvailable = (roomId, bookings, checkIn, checkOut, totalRoomCount) => {
    const overlapping = bookings.filter(
      (b) =>
        b.room_id?.includes(roomId) &&
        b.booking_status === 'confirmed' &&
        !b.cancelled_date &&
        !(new Date(checkOut) <= new Date(b.check_in_date) || new Date(checkIn) >= new Date(b.check_out_date))
    );
    return totalRoomCount - overlapping.length;
  };

  const typeColors = {
    hotel: 'bg-blue-50',
    apartment: 'bg-yellow-50',
    guesthouse: 'bg-pink-50',
    resort: 'bg-green-50',
    house: 'bg-purple-50',
  };

  const getPropertyAverageRating = (propertyId) => {
    const propReviews = reviews.filter((r) => r.property_id === propertyId);
    if (propReviews.length === 0) return 0;
    return propReviews.reduce((sum, r) => sum + r.rating, 0) / propReviews.length;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    }

    if (halfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }

    while (stars.length < 5) {
      stars.push(<FaRegStar key={`empty-${stars.length}`} className="text-yellow-400" />);
    }

    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propsRes, roomsRes, bookingsRes, reviewsRes] = await Promise.all([
          axios.get(process.env.REACT_APP_API_URL_PROPERTIES),
          axios.get(process.env.REACT_APP_API_URL_ROOMS),
          axios.get(process.env.REACT_APP_API_URL_BOOKINGS),
          axios.get(process.env.REACT_APP_API_URL_REVIEWS),
        ]);

        setReviews(reviewsRes.data);
        const properties = propsRes.data.filter((p) => p.is_verify === 'yes');
        const allRooms = roomsRes.data;
        const bookings = bookingsRes.data;

        const types = [...new Set(properties.map((p) => p.type?.toLowerCase()))];
        setAvailableTypes(types);

        const propertyAmenitySet = new Set();
        const roomAmenitySet = new Set();
        const guestSet = new Set();

        const filtered = properties
          .filter((p) => p.city.toLowerCase().includes(destination.toLowerCase()))
          .map((prop) => {
            const type = prop.type?.toLowerCase();
            const isHouse = type === 'house';

            const propRooms = allRooms.filter((r) => r.property_id === prop.property_id && r.is_active);

            const availableRooms = propRooms
              .map((room) => {
                const availableCount = isRoomAvailable(
                  room.room_id,
                  bookings,
                  checkIn,
                  checkOut,
                  room.total_rooms
                );
                const price = parseFloat(room.discount_price_per_night) || parseFloat(room.price_per_night);

                (room.amenities || []).forEach((a) => roomAmenitySet.add(a));
                guestSet.add(room.max_guests);

                return {
                  ...room,
                  availableCount,
                  price,
                };
              })
              .filter((room) => {
                const matchRoomAmenities =
                  selectedRoomAmenities.length === 0 ||
                  selectedRoomAmenities.every((a) => (room.amenities || []).includes(a));
                const matchPropertyAmenities =
                  selectedPropertyAmenities.length === 0 ||
                  selectedPropertyAmenities.every((a) => (prop.amenities || []).includes(a));
                const matchGuests =
                  selectedMaxGuests.length === 0 || selectedMaxGuests.includes(room.max_guests);

                return (
                  room.availableCount >= rooms &&
                  room.price >= budgetRange[0] &&
                  room.price <= budgetRange[1] &&
                  matchRoomAmenities &&
                  matchPropertyAmenities &&
                  matchGuests
                );
              });

            (prop.amenities || []).forEach((a) => propertyAmenitySet.add(a));
            const typeMatches = selectedTypes.length === 0 || selectedTypes.includes(type);

            return (availableRooms.length > 0 || isHouse) && typeMatches
              ? { ...prop, availableRooms }
              : null;
          })
          .filter(Boolean);

        setPropertyAmenities(Array.from(propertyAmenitySet));
        setRoomAmenities(Array.from(roomAmenitySet));
        setMaxGuestOptions(Array.from(guestSet).sort((a, b) => a - b));
        setResults(filtered);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    destination,
    checkIn,
    checkOut,
    rooms,
    budgetRange,
    selectedTypes,
    selectedPropertyAmenities,
    selectedRoomAmenities,
    selectedMaxGuests,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-pink-100 to-purple-100 flex flex-col">
      <NavBar />
      <div className="mt-20 bg-[#1C2241] text-white px-4 py-4 shadow-md">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt />
            <span className="font-semibold text-lg">{destination}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>Check-in: <strong>{formatDate(checkIn)}</strong></span>
            <span>Check-out: <strong>{formatDate(checkOut)}</strong></span>
            <span>
              <strong>{adults}</strong> adults, <strong>{children}</strong> children, <strong>{rooms}</strong> rooms
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-6 min-h-[600px]">
          <BudgetFilter
            budget={budgetRange}
            setBudget={setBudgetRange}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            types={availableTypes}
          />

          <section className="space-y-10 w-full">
            {results.length === 0 ? (
              <div className="text-center text-gray-500 text-lg font-medium mt-20">
                No available properties found.
              </div>
            ) : (
              results.map((prop, i) => {
                const type = prop.type?.toLowerCase();
                const bgClass = typeColors[type] || 'bg-white';
                const avgRating = getPropertyAverageRating(prop.property_id);
                const slug = slugify(prop.title);

                return (
                  <div
                    key={i}
                    className={`shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition duration-300 border border-gray-200 ${bgClass}`}
                  >
                    <div className="flex flex-col md:flex-row items-center gap-4 p-5 border-b">
                      <img
                        src={`${process.env.REACT_APP_API_URL}${prop.thumbnail_url?.[0]}`}
                        alt={prop.title}
                        className="w-full md:w-64 h-40 object-cover rounded-md border"
                      />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-[#1C2241]">{prop.title}</h3>
                        <p className="text-sm text-blue-700">
                          {prop.address}, {prop.city}, {prop.province}, {prop.country}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          {type === 'house' ? <FaHome /> : <FaHotel />}
                          <span className="capitalize">{prop.type}</span>
                        </div>
                        <div className="mt-2">{renderStars(avgRating)}</div>
                      </div>
                      <button
                        onClick={() => {
                          if (type === 'house') {
                            navigate(`/property/${slug}`, {
                              state: {
                                property_id: prop.property_id,
                                checkIn,
                                checkOut,
                                adults,
                                children,
                                rooms
                              }
                            });
                          } else {
                            setExpanded(expanded === i ? null : i);
                          }
                        }}
                        className="mt-4 md:mt-0 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow hover:shadow-lg transition"
                      >
                        {type === 'house' ? 'Check Availability' : 'Check Rooms'}
                      </button>
                    </div>

                    {expanded === i && (
                      <div className={`p-5 space-y-4 ${bgClass}`}>
                        {prop.availableRooms.map((room, rIdx) => (
                          <div
                            key={rIdx}
                            className="flex flex-col md:flex-row gap-4 bg-white/90 p-5 rounded-lg shadow border cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                            onClick={() =>
                              navigate(`/property/${slug}`, {
                                state: {
                                  property_id: prop.property_id,
                                  room_id: room.room_id,
                                  checkIn,
                                  checkOut,
                                  adults,
                                  children,
                                  rooms
                                }
                              })
                            }
                          >
                            <div className="md:w-1/4">
                              <img
                                src={`${process.env.REACT_APP_API_URL}${room.room_images?.[0]}`}
                                alt={room.room_name}
                                className="w-full h-32 object-cover rounded border"
                              />
                            </div>
                            <div className="md:w-3/4">
                              <h4 className="text-lg font-semibold text-[#1C2241]">{room.room_name}</h4>
                              <p className="text-sm text-gray-600">Type: {room.room_type}</p>
                              <p className="text-sm text-gray-600">Guests: {room.max_guests}</p>
                              <p className="text-sm text-gray-600">Amenities: {room.amenities?.join(', ')}</p>
                              <div className="text-red-600 font-bold mt-2 text-xl">
                                ₱{room.price.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">{room.availableCount} room(s) left</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>

          <RightFilter
            propertyAmenities={propertyAmenities}
            selectedPropertyAmenities={selectedPropertyAmenities}
            setSelectedPropertyAmenities={setSelectedPropertyAmenities}
            roomAmenities={roomAmenities}
            selectedRoomAmenities={selectedRoomAmenities}
            setSelectedRoomAmenities={setSelectedRoomAmenities}
            maxGuestOptions={maxGuestOptions}
            selectedMaxGuests={selectedMaxGuests}
            setSelectedMaxGuests={setSelectedMaxGuests}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;
