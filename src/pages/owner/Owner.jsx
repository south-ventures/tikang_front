import React from 'react';
import './Owner.css';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import Bg from '../../assets/lessor-signin-bg.gif';

function Owner() {
  return (
    <div className="text-gray-800">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 shadow-md backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <img
            src="/assets/logo.png"
            alt="Tikang Logo"
            className="h-10 w-auto bg-white p-1 rounded"
          />
        <a
            href="http://localhost:3000/login"
            className="text-sm text-blue-600 border border-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-50">
            Sign in
          </a>
        </div>
      </header>

      {/* HERO with background */}
      <section
        className="relative h-[90vh] bg-cover bg-center bg-no-repeat flex flex-col"
        style={{ backgroundImage: `url(${Bg})` }}
      >
        {/* Overlay and content */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-6 flex-grow">
          <p className="text-base md:text-lg font-medium mb-2">
            Homes • Hotels • Apartments & more
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            List your property on Tikang
          </h1>
          <ul className="text-lg md:text-xl font-light mb-6 space-y-2">
            <li>✅ Reach 9M+ travelers nationwide</li>
            <li>✅ Get your first booking within a week</li>
          </ul>
          <a
            href="http://localhost:3000/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition inline-block"
          >
            List your property
          </a>
        </div>
      </section>

      {/* All You Have to Do */}
      <section className="bg-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">All you have to do</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-screen-lg mx-auto">
          {[
            "Sign in or sign up for a Tikang account",
            "Upload your property details and photos",
            "Set your prices and available dates",
            "See your property go live in front of millions of travelers within 30 mins"
          ].map((step, index) => (
            <div key={index} className="border rounded-lg p-6 text-left shadow-sm">
              <div className="w-6 h-6 rounded-full border border-black text-center text-sm font-bold mb-2">{index + 1}</div>
              <p className="text-sm">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Tikang Section */}
      <section className="bg-gray-100 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Why Tikang?</h2>
        <div className="space-y-10 max-w-5xl mx-auto">
          {[
            {
              img: '/assets/why-support.png',
              title: 'Multi-lingual support 24/7',
              text: 'Tikang offers real-time support in 38 languages, ensuring seamless property management around the clock.'
            },
            {
              img: '/assets/why-global.png',
              title: '2+ million properties already joined',
              text: 'Stay competitive, benefit from our partner network, and maximize bookings.'
            },
            {
              img: '/assets/why-analytics.png',
              title: 'Data-rich analytics',
              text: 'Access detailed performance insights to refine your strategy and stay competitive.'
            },
            {
              img: '/assets/why-mobile.png',
              title: 'Easy-to-use mobile app',
              text: 'Manage bookings, availability, and guest communications from your phone.'
            },
          ].map((item, index) => (
            <div key={index} className="flex flex-col md:flex-row items-center gap-8 bg-white p-6 rounded-lg shadow">
              <img src={item.img} alt="" className="h-32 w-auto" />
              <div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently asked questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            "What property types can be listed on Tikang?",
            "How will I get paid?",
            "How do I sign my contract?",
            "How much does Tikang charge?",
            "What solutions does Tikang provide to help me grow my business?"
          ].map((q, i) => (
            <details key={i} className="border px-4 py-3 rounded cursor-pointer">
              <summary className="font-medium">{q}</summary>
            </details>
          ))}
        </div>
      </section>

      {/* Contact Block */}
      <section className="bg-white py-12 px-6">
        <div className="max-w-4xl mx-auto border rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-grow">
            <h3 className="text-lg font-semibold">Still have questions? We're here for you!</h3>
            <p className="text-sm text-gray-600 mt-1">
              If you haven't found what you're looking for, reach out to us.
            </p>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold">
              Contact us
            </button>
          </div>
          <img src="/assets/contact-bubble.png" alt="Contact illustration" className="h-24" />
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Owner;
