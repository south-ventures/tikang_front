import React, { useRef, useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../../components/LoadingSpinner';

const TopCitiesSection = ({ setLoaded }) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [topCities, setTopCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const updateArrowVisibility = () => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollLeft = Math.ceil(el.scrollLeft);
    const scrollWidth = Math.floor(el.scrollWidth);
    const offsetWidth = Math.floor(el.offsetWidth);

    setShowLeftArrow(scrollLeft > 5);
    setShowRightArrow(scrollLeft + offsetWidth < scrollWidth - 5);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrowVisibility();
    el.addEventListener('scroll', updateArrowVisibility);
    window.addEventListener('resize', updateArrowVisibility);
    setTimeout(updateArrowVisibility, 100); // Ensures initial state

    return () => {
      el.removeEventListener('scroll', updateArrowVisibility);
      window.removeEventListener('resize', updateArrowVisibility);
    };
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(process.env.REACT_APP_API_URL_PROPERTIES);
        const properties = await res.json();

        const cityMap = new Map();
        for (const property of properties) {
          const city = property.city;
          if (!city || !Array.isArray(property.thumbnail_url)) continue;

          if (!cityMap.has(city)) {
            cityMap.set(city, {
              name: city,
              count: 1,
              image: `${process.env.REACT_APP_API_URL}${property.thumbnail_url[0]}`,
            });
          } else {
            cityMap.get(city).count += 1;
          }
        }

        const sortedCities = Array.from(cityMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTopCities(sortedCities);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
        setLoaded?.();
      }
    };

    fetchProperties();
  }, [setLoaded]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="mt-16 px-6 relative">
      {/* Header Row */}
      <div className="flex justify-between items-center max-w-screen-xl mx-auto mb-4 px-2">
        <h2 className="text-2xl font-semibold text-gray-800">
          Cities you need to visit
        </h2>
        <div className="flex gap-2">
          <button
            disabled={!showLeftArrow}
            onClick={() => scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })}
            className={`p-2 rounded-full shadow transition ${
              showLeftArrow ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
            }`}
          >
            <FaChevronLeft className={`w-5 h-5 ${showLeftArrow ? 'text-gray-700' : 'text-gray-400'}`} />
          </button>
          <button
            disabled={!showRightArrow}
            onClick={() => scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })}
            className={`p-2 rounded-full shadow transition ${
              showRightArrow ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
            }`}
          >
            <FaChevronRight className={`w-5 h-5 ${showRightArrow ? 'text-gray-700' : 'text-gray-400'}`} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="max-w-screen-xl mx-auto">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 scroll-smooth no-scrollbar pb-2 px-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {topCities.map((city, index) => (
            <Link
              to={`/top-city-search?city=${encodeURIComponent(city.name)}&image=${encodeURIComponent(city.image)}`}
              key={index}
            >
              <div className="w-[20%] min-w-[200px] flex-shrink-0 bg-white rounded-lg shadow hover:shadow-md cursor-pointer transition duration-200 snap-start">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                <div className="p-3 text-center">
                  <h3 className="font-semibold text-gray-800">{city.name}</h3>
                  <p className="text-sm text-gray-500">{city.count} accommodations</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopCitiesSection;
