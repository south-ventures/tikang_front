import React, { useEffect, useState, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useNavigate } from "react-router-dom";

const TopProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL_PROPERTIES}/top-booked`
        );
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error("Error fetching top properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const nextSlide = () => {
    setFade(true);
    setTimeout(() => {
      setIndex((prev) => (prev === properties.length - 1 ? 0 : prev + 1));
      setFade(false);
    }, 300);
  };

  const prevSlide = () => {
    setFade(true);
    setTimeout(() => {
      setIndex((prev) => (prev === 0 ? properties.length - 1 : prev - 1));
      setFade(false);
    }, 300);
  };

  const goToSlide = (i) => {
    if (i === index) return;
    setFade(true);
    setTimeout(() => {
      setIndex(i);
      setFade(false);
    }, 300);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX) return;
    const touchEndX = e.changedTouches[0].clientX;
    const delta = touchStartX - touchEndX;

    if (delta > 50) nextSlide();
    else if (delta < -50) prevSlide();
    setTouchStartX(null);
  };

  const goToDetails = (property) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
  
    const slug = property.title?.toLowerCase().replace(/\s+/g, '-');
  
    navigate(`/property/${slug}`, {
      state: {
        property_id: property.property_id,
        room_id: property.type?.toLowerCase() === 'home' ? null : property.rooms?.[0]?.room_id || null,
        checkIn: today.toISOString().split('T')[0],
        checkOut: tomorrow.toISOString().split('T')[0],
        adults: 1,
        children: 0,
        rooms: 1,
      },
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12 px-4 text-center text-gray-500">
        No top properties available.
      </div>
    );
  }

  const {
    title,
    type,
    city,
    address,
    description,
    price_per_night,
    review_count,
    total_bookings,
    thumb_url,
  } = properties[index];

  return (
    <div className="relative w-full max-w-6xl mx-auto py-12 px-4">
      {/* Title and Arrows Row */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={prevSlide}
          className="bg-white text-gray-800 p-2 rounded-full shadow hover:bg-gray-100"
        >
          <FaChevronLeft size={18} />
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">
          Handpicked Homes for Your Next Getaway
        </h2>
        <button
          onClick={nextSlide}
          className="bg-white text-gray-800 p-2 rounded-full shadow hover:bg-gray-100"
        >
          <FaChevronRight size={18} />
        </button>
      </div>

      <div
        className="relative"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Desktop Layout */}
        <div
          className={`hidden md:block w-full h-[460px] bg-cover bg-center rounded-2xl overflow-hidden shadow-2xl transition-opacity duration-500 ${
            fade ? "opacity-0" : "opacity-100"
          }`}
          style={{
            backgroundImage: `url(${thumb_url || "/images/fallback.webp"})`,
          }}
        >
          <div className="w-full h-full bg-black/60 flex flex-col justify-center items-start pl-24 pr-12 py-10 text-white">
            <h3 className="text-4xl font-extrabold mb-3">{title}</h3>
            <p className="text-2xl font-semibold text-teal-300 mb-1 capitalize">
              {type}
            </p>
            <p className="text-lg text-gray-100 mb-4">
              {address}, {city}
            </p>
            <p className="text-xl text-emerald-300 font-bold mb-1">
              ₱{price_per_night?.toLocaleString()}{" "}
              <span className="text-base text-gray-200 font-normal">
                per night
              </span>
            </p>
            <p className="text-sm text-blue-200 mb-4">
              {review_count} review{review_count === 1 ? "" : "s"} ·{" "}
              {total_bookings || 0} booking{total_bookings === 1 ? "" : "s"}
            </p>
            <p className="text-base text-gray-200 mb-6 max-w-2xl leading-relaxed">
              {description?.slice(0, 200)}
              {description?.length > 200 ? "..." : ""}
            </p>
            <button
              onClick={() => goToDetails(properties[index])}
              className="mt-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-full font-semibold shadow transition duration-200"
            >
              Check Availability
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div
          className={`md:hidden w-full transition-opacity duration-500 ${
            fade ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="rounded-t-2xl overflow-hidden">
            <img
              src={thumb_url || "/images/fallback.webp"}
              alt={title}
              className="w-full h-60 object-cover"
            />
          </div>
          <div className="bg-gray-900 text-white px-6 py-6 rounded-b-2xl shadow-xl">
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-base font-semibold text-teal-300 mb-1 capitalize">
              {type}
            </p>
            <p className="text-sm text-gray-200 mb-2">
              {address}, {city}
            </p>
            <p className="text-lg text-emerald-300 font-bold mb-1">
              ₱{price_per_night?.toLocaleString()}{" "}
              <span className="text-sm text-gray-300">per night</span>
            </p>
            <p className="text-xs text-blue-200 mb-3">
              {review_count} review{review_count === 1 ? "" : "s"} ·{" "}
              {total_bookings || 0} booking{total_bookings === 1 ? "" : "s"}
            </p>
            <p className="text-sm text-gray-300 mb-4">
              {description?.slice(0, 120)}
              {description?.length > 120 ? "..." : ""}
            </p>
            <button
              onClick={() => goToDetails(properties[index])}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-base rounded-full font-semibold shadow transition"
            >
              Check Availability
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center items-center gap-2 mt-6">
        {properties.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-3 h-3 rounded-full ${
              index === i ? "bg-blue-600" : "bg-gray-300"
            } transition duration-300`}
          />
        ))}
      </div>
    </div>
  );
};

export default TopProperties;
