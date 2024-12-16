'use client';

import { FoodDonation, notificationApi } from '@/app/api/donations/api';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface DonationModalProps {
  donation: FoodDonation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ donation, isOpen, onClose }: DonationModalProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in by looking for token
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleContactDonor = async () => {
    if (!donation) return;
    
    try {
      setIsLoading(true);
      await notificationApi.sendDonationRequest(donation._id);
      toast.success('Request sent to donor successfully!');
      onClose();
    } catch (error) {
      console.error('Error sending donation request:', error);
      toast.error('Failed to send request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !donation) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            {donation.images && donation.images.length > 0 && (
              <div className="relative w-full h-64 sm:h-96">
                <img
                  src={donation.images[0]}
                  alt={donation.foodName}
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {donation.foodName}
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Category</h4>
                  <p className="mt-1 text-lg text-gray-900">{donation.category}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Quantity</h4>
                  <p className="mt-1 text-lg text-gray-900">{donation.quantity}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Expiry Date</h4>
                  <p className="mt-1 text-lg text-gray-900">
                    {donation.expiryDate ? format(new Date(donation.expiryDate), 'PPP') : 'Not specified'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Location</h4>
                  <p className="mt-1 text-lg text-gray-900">
                    {donation.location?.address || 'Location not provided'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p className="mt-1 text-lg capitalize text-gray-900">
                    {donation.status}
                  </p>
                </div>
              </div>

              {/* Contact button or Login prompt */}
              <div className="mt-8">
                {isLoggedIn ? (
                  <button
                    className={`w-full px-6 py-3 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      donation.status === 'available' 
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    disabled={donation.status !== 'available' || isLoading}
                    onClick={handleContactDonor}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Request...
                      </span>
                    ) : donation.status === 'available' ? (
                      'Contact Donor'
                    ) : (
                      'Not Available'
                    )}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full px-6 py-3 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Log in to Contact Donor
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
