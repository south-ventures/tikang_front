import { createContext, useContext, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false); // Helps avoid rendering prematurely

  const storeToken = (token) => {
    localStorage.setItem('tikangToken', token);
  };

  const removeToken = () => {
    localStorage.removeItem('tikangToken');
  };

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('tikangToken');
    if (!token) {
      setUser(null);
      setUserLoaded(true);
      return null;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Invalid or expired token');

      const data = await res.json();
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('fetchUser error:', err);
      removeToken();
      setUser(null);
      return null;
    } finally {
      setUserLoaded(true);
    }
  }, []);

  const validateToken = async () => {
    const token = localStorage.getItem('tikangToken');
    const pathname = window.location.pathname;

    const isPublicPage = [
      '/',
      '/login',
      '/register',
      '/forgot-password',
      '/book',
      '/search',
      '/top-city-search',
      '/owner-login',
      '/owner',
      '/favorites',
    ].includes(pathname) || /^\/property\/[^/]+$/.test(pathname);

    if (!token) {
      if (!isPublicPage) window.location.href = '/login';
      return null;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Invalid token');

      const data = await res.json();
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('validateToken failed:', err);
      removeToken();
      setUser(null);
      if (!isPublicPage) window.location.href = '/login';
      return null;
    }
  };

  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (decoded?.full_name && decoded?.email) {
        storeToken(token);
        setUser(decoded);
      } else {
        throw new Error('Token missing required fields');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setUser(null);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('tikangToken');

    try {
      await fetch(`${process.env.REACT_APP_API_URL_GUEST}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }

    removeToken();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        fetchUser,
        validateToken,
        storeToken,
        userLoaded, // ✅ Export this for UI guards
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
