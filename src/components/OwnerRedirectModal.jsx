import React, { useEffect, useState } from 'react';

export default function OwnerRedirectModal({ isOpen, onClose, otherRoles, userType, userId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  useEffect(() => {
    const hasOwnerAccess =
      (typeof otherRoles === 'string' && otherRoles.includes('owner')) ||
      userType === 'owner';
    setIsOwner(hasOwnerAccess);
  }, [otherRoles, userType]);
  

  if (!isOpen) return null;

  const handleClick = async () => {
    setIsLoading(true);

    const apiUrl = process.env.REACT_APP_API_URL; // backend server
    const ownerRedirectBase = process.env.REACT_APP_API_URL_HOMEOWNER; // homeowner frontend

    try {
      const endpoint = isOwner ? '/api/auto-login' : '/api/auto-login/register';

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId }),
      });

      if (!res.ok) throw new Error('Failed request');

      const data = await res.json();
      const { token } = data;
      console.log(token);
      if (!token) throw new Error('No token returned');

      window.location.href = `${ownerRedirectBase}/dashboard?token=${encodeURIComponent(token)}`;
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-80 text-center shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {isOwner ? 'Welcome back!' : 'Become a Homeowner'}
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          {isOwner
            ? 'You’re already a homeowner. Continue to your dashboard.'
            : 'Start listing your property and reach more travelers.'}
        </p>
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={`px-4 py-2 rounded-full w-full font-semibold text-white ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading
            ? 'Redirecting...'
            : isOwner
            ? 'Go to Homeowner Centre'
            : 'Register as Homeowner'}
        </button>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="mt-4 text-sm text-gray-500 underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
