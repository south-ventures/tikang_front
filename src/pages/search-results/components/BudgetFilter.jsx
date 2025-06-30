import React, { useEffect, useState } from 'react';
import ReactSlider from 'react-slider';

const BudgetFilter = ({ budget, setBudget, selectedTypes, setSelectedTypes, types }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsCollapsed(window.scrollY > 150);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="transition-all duration-300 ease-in-out bg-white p-6 rounded-2xl shadow-lg border border-blue-100 w-full">
      {isCollapsed ? (
        <div className="space-y-4">
          <h3 className="font-bold text-[#1C2241] text-base">Active Filters</h3>
          <div className="text-sm text-gray-700">
            <p>
              <span className="font-medium">Budget:</span>{' '}
              ₱{budget[0].toLocaleString()} - ₱{budget[1].toLocaleString()}
            </p>
            <p className="mt-2">
              <span className="font-medium">Types:</span>{' '}
              {selectedTypes.length > 0
                ? selectedTypes.map(capitalize).join(', ')
                : 'None selected'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-bold text-[#1C2241] mb-4 text-lg">Your Budget (per night)</h3>
          <ReactSlider
            className="horizontal-slider w-full h-2 bg-blue-100 rounded"
            thumbClassName="thumb"
            trackClassName="track"
            min={0}
            max={50000}
            value={budget}
            onChange={setBudget}
            pearling
            minDistance={1000}
            renderThumb={(props) => (
              <div
                {...props}
                className="w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-pointer -mt-1"
              />
            )}
          />
          <div className="flex justify-between mt-6 text-sm font-semibold text-gray-700">
            <div className="text-center">
              <p className="text-gray-500">MIN</p>
              <div className="mt-1 border px-3 py-1 rounded w-24 text-center bg-gray-100">
                ₱{budget[0].toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-500">MAX</p>
              <div className="mt-1 border px-3 py-1 rounded w-24 text-center bg-gray-100">
                ₱{budget[1].toLocaleString()}
              </div>
            </div>
          </div>

          <h2 className="font-bold text-[#1C2241] mt-8 mb-3">Property Type</h2>
          <div className="space-y-2">
            {types.map((type) => {
              const isChecked = selectedTypes.includes(type);
              return (
                <label
                  key={type}
                  className={`flex items-center px-3 py-2 rounded-lg border text-[13px] font-medium cursor-pointer
                    ${
                      isChecked
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-800'
                    } hover:shadow-sm transition`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleType(type)}
                    className="accent-blue-600 mr-3 w-4 h-4 min-w-[16px] min-h-[16px]"
                  />
                  <span
                    className="block text-[12px] leading-tight font-medium break-words w-full"
                    title={capitalize(type)}
                  >
                    {capitalize(type)}
                  </span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetFilter;
