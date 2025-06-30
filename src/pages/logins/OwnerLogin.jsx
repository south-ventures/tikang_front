import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/Navbar';

export default function OwnerLogin() {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 shadow-md backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <img
            src="/assets/logo.png"
            alt="Tikang Logo"
            className="h-10 w-auto bg-white p-1 rounded"
          />
        <Link to="/lessor-login">
          <button className="text-sm text-blue-600 border border-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-50">
            Sign in
          </button>
        </Link>
        </div>
      </header>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
        <div className="bg-white shadow-lg rounded-xl flex w-full max-w-5xl overflow-hidden">

        {/* Left - Logo and Slogan */}
        <div className="hidden md:flex flex-col items-center justify-center bg-[#71a3d9] text-white p-10 w-1/2">
        <img src="/assets/logo.png" alt="Tikang Logo" className="w-40 mb-2" />
        <h2 className="text-xl font-bold mb-1 text-center">Be a Owner and feature your place</h2>
        <p className="text-sm text-center">
            Your trusted rental platform for local and long stays in the Philippines.
        </p>
        </div>

          {/* Right - Login / Signup Form */}
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {isSignup ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {isSignup ? 'Sign up to start using Tikang' : 'Login to your Tikang account'}
            </p>

            <form className="space-y-4">
                <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {isSignup && (
                <>
                    <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                    type="number"
                    placeholder="Age"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                    type="text"
                    placeholder="Address"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </>
                )}

                <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
                >
                {isSignup ? 'Sign Up' : 'Log In'}
                </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-6">
              By {isSignup ? 'signing up' : 'logging in'}, I agree to Tikang's{' '}
              <Link to="#" className="text-blue-600 hover:underline">Terms of Use</Link> and{' '}
              <Link to="#" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>

            <p className="text-sm text-gray-600 text-center mt-4">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-blue-600 font-medium hover:underline"
              >
                {isSignup ? 'Log In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
