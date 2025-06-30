import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    image: 'image_1.webp',
    text: 'Discover Cozy Homes',
    button: 'See Recommendation',
    action: 'scroll',
    target: '#recommended-homes',
  },
  {
    image: 'image_2.webp',
    text: 'Become an Owner',
    button: 'Rent Your Own Place',
    action: 'navigate',
    target: '/owner',
  },
  {
    image: 'image_3.webp',
    text: 'Learn About Tikang',
    button: 'About Tikang',
    action: 'navigate',
    target: '/about-us',
  },
  {
    image: 'image_4.webp',
    text: 'Stay Like a Local',
    button: 'Find A Place',
    action: 'navigate',
    target: '/search',
    isDiscountedSearch: true,
  },
  {
    image: 'image_5.webp',
    text: 'Big Offers Await!',
    button: 'View Discounted Offers',
    action: 'navigate',
    target: '/search',
    isDiscountedSearch: true,
  },
];

export default function CarouselSection() {
  const navigate = useNavigate();

  const handleClick = (slide) => {
    if (slide.action === 'navigate') {
      if (slide.isDiscountedSearch) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const formatDate = (date) => date.toISOString().split('T')[0];

        navigate('/search', {
          state: {
            destination: '',
            checkIn: formatDate(today),
            checkOut: formatDate(tomorrow),
            rooms: 1,
            adults: 1,
            children: 0,
          },
        });
      } else {
        navigate(slide.target);
      }
    }

    if (slide.action === 'scroll') {
      const el = document.querySelector(slide.target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-20">
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        interval={5000}
      >
        {slides.map((slide, index) => (
          <div key={index} className="relative">
            <img
              src={`/assets/${slide.image}`}
              alt={`Slide ${index + 1}`}
              className="h-[60vh] w-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30 text-white text-center px-4">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 drop-shadow-lg">
                {slide.text}
              </h2>
              {slide.button && (
                <button
                  className="bg-[#3A6EA5] hover:bg-[#325e8a] transition duration-200 text-white text-lg px-8 py-3 rounded-full font-semibold shadow-md"
                  onClick={() => handleClick(slide)}
                >
                  {slide.button}
                </button>
              )}
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
