import React from 'react';

const RightFilter = ({
  propertyAmenities = [],
  selectedPropertyAmenities,
  setSelectedPropertyAmenities,
  roomAmenities = [],
  selectedRoomAmenities,
  setSelectedRoomAmenities,
  maxGuestOptions = [],
  selectedMaxGuests,
  setSelectedMaxGuests
}) => {
  const handleAmenityChange = (amenity, type) => {
    const setter = type === 'property' ? setSelectedPropertyAmenities : setSelectedRoomAmenities;
    const current = type === 'property' ? selectedPropertyAmenities : selectedRoomAmenities;

    setter(
      current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity]
    );
  };

  const handleMaxGuestChange = (guest) => {
    setSelectedMaxGuests((prev) =>
      prev.includes(guest) ? prev.filter((g) => g !== guest) : [...prev, guest]
    );
  };

  const Checkbox = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`
          appearance-none w-5 h-5 rounded-md border-2 border-gray-400
          checked:bg-blue-600 checked:border-blue-600
          transition duration-200
        `}
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  return (
    <div className="sticky top-24 p-6 border border-gray-300 rounded-2xl shadow-lg bg-white space-y-10">
      {/* Property Amenities */}
      <div>
        <h4 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">Property Amenities</h4>
        {propertyAmenities.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {propertyAmenities.map((amenity, index) => (
              <Checkbox
                key={index}
                label={amenity}
                checked={selectedPropertyAmenities.includes(amenity)}
                onChange={() => handleAmenityChange(amenity, 'property')}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No property amenities available.</p>
        )}
      </div>

      {/* Room Amenities */}
      <div>
        <h4 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">Room Amenities</h4>
        {roomAmenities.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {roomAmenities.map((amenity, index) => (
              <Checkbox
                key={index}
                label={amenity}
                checked={selectedRoomAmenities.includes(amenity)}
                onChange={() => handleAmenityChange(amenity, 'room')}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No room amenities available.</p>
        )}
      </div>

      {/* Max Guests */}
      <div>
        <h4 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">Max Guests</h4>
        {maxGuestOptions.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {maxGuestOptions.map((guest, index) => (
              <Checkbox
                key={index}
                label={guest}
                checked={selectedMaxGuests.includes(guest)}
                onChange={() => handleMaxGuestChange(guest)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No max guest options available.</p>
        )}
      </div>
    </div>
  );
};

export default RightFilter;
