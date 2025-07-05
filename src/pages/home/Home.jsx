import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../../components/Navbar';
import SearchBox from './homeComponents/SearchBox';
import './Home.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Footer from '../../components/Footer';
import RecommendedHomes from './homeComponents/RecommendedHomes';
import 'react-datepicker/dist/react-datepicker.css';
import CarouselSection from './homeComponents/CarouselSection';
import TopCitiesSection from './homeComponents/TopCitiesSection';
import TopProperties from './homeComponents/TopPropertiesSection';
import { useAuth } from '../../context/AuthContext';

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const { storeToken, fetchUser, user } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    const autoLogin = async () => {
      try {
        if (!token) return;

        const res = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/validate-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Token validation failed');

        storeToken(token);     // ✅ store token to localStorage
        await fetchUser();     // ✅ fetch and set user from API
        navigate('/', { replace: true }); // ✅ clean URL
      } catch (err) {
        console.error('Auto-login failed:', err);
      }
    };

    autoLogin();
  }, [location.search, storeToken, fetchUser, navigate]);

  // ✅ Restore user on refresh if token exists but no user is loaded
  useEffect(() => {
    const token = localStorage.getItem('tikangToken');
    if (token && !user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  return (
    <div className="min-h-screen bg-[#F9FDFB]">
      <NavBar />
      <CarouselSection />
      <SearchBox />
      <TopCitiesSection />
      <TopProperties />
      <RecommendedHomes />
      <Footer />
    </div>
  );
}

export default Home;
