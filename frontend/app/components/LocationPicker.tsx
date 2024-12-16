'use client';

import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places']
});

interface LocationPickerProps {
  value: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
    shareExactLocation: boolean;
  };
  onChange: (location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
    shareExactLocation: boolean;
  }) => void;
  error?: string;
}

export default function LocationPicker({ value, onChange, error }: LocationPickerProps) {
  const [locationType, setLocationType] = useState<'gps' | 'address'>('address');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleLocationTypeChange = (type: 'gps' | 'address') => {
    setLocationType(type);
    if (type === 'gps') {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    setLoadError(null);

    if (!navigator.geolocation) {
      setLoadError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const address = await getAddressFromCoordinates(latitude, longitude);
          
          onChange({
            type: 'Point',
            coordinates: [longitude, latitude],
            address,
            shareExactLocation: true
          });
          
          setIsLoading(false);
        } catch (error) {
          setLoadError('Error getting location details');
          setIsLoading(false);
        }
      },
      (error) => {
        setLoadError(getGeolocationErrorMessage(error));
        setIsLoading(false);
      }
    );
  };

  const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location permission denied';
      case error.POSITION_UNAVAILABLE:
        return 'Location information unavailable';
      case error.TIMEOUT:
        return 'Location request timed out';
      default:
        return 'Error getting location';
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const google = await loader.load();
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({
        location: { lat: latitude, lng: longitude }
      });

      if (response.results[0]) {
        return response.results[0].formatted_address;
      } else {
        throw new Error('No results found');
      }
    } catch (error) {
      console.error('Error getting address:', error);
      throw new Error('Failed to get address from coordinates');
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    onChange({
      type: 'Point',
      coordinates: [0, 0],
      address,
      shareExactLocation: false
    });
  };

  return (
    <div className="space-y-4">
      {/* Location Type Selection */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => handleLocationTypeChange('address')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            locationType === 'address'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Enter Address
        </button>
        <button
          type="button"
          onClick={() => handleLocationTypeChange('gps')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            locationType === 'gps'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Use Current Location
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
          <span>Getting location...</span>
        </div>
      )}

      {/* Error Message */}
      {(error || loadError) && (
        <div className="text-red-600 text-sm">
          {error || loadError}
        </div>
      )}

      {/* Address Input - Only show when address type is selected */}
      {locationType === 'address' && (
        <div className="relative">
          <input
            type="text"
            value={value?.address || ''}
            onChange={handleAddressChange}
            placeholder="Enter your address"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
              error ? 'border-red-300' : ''
            }`}
          />
        </div>
      )}

      {/* Display selected location */}
      {value?.address && (
        <div className="text-sm text-gray-600">
          <p className="font-medium">Selected Location:</p>
          <p>{value.address}</p>
        </div>
      )}
    </div>
  );
}
