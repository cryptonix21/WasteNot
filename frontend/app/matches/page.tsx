'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { foodDonationApi, FoodDonation } from '@/app/api/donations/api';
import DonationModal from '../components/DonationModal';

export default function Matches() {
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5); // 5km default radius

  const categories = [
    'All Categories',
    'Fruits & Vegetables',
    'Cooked Meals',
    'Baked Goods',
    'Dairy Products',
    'Canned Foods',
    'Beverages',
    'Other'
  ];

  useEffect(() => {
    fetchDonations();
  }, [searchRadius, fetchDonations]);

  const fetchDonations = async () => {
    interface SearchParams {
      radius?: number;
    }
    
    try {
      setLoading(true);
      const params: SearchParams = {
        radius: searchRadius
      };

      const response = await foodDonationApi.getFoodDonations(params);
      setDonations(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to load food donations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = loading || !donations ? [] : donations.filter(donation => {
    const matchesSearch = searchQuery === '' || 
      donation.foodName.toLowerCase().includes(searchQuery.toLowerCase());
 
    
    const matchesCategory = selectedCategory === '' || 
      selectedCategory === 'All Categories' || 
      donation.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-8 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Available Food Donations
          </h1>
          <p className="text-lg text-gray-600">
            Browse through available food donations in your area.
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by food name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={20}>Within 20 km</option>
                <option value={50}>Within 50 km</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={fetchDonations}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredDonations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No food donations found.</p>
            <Link
              href="/add-food"
              className="inline-block mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Share Food
            </Link>
          </div>
        )}

        {!loading && !error && filteredDonations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonations.map((donation) => (
              <div
                key={donation._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => setSelectedDonation(donation)}
              >
                {donation.images && donation.images.length > 0 && (
                  <div className="relative h-48 w-full mb-4">
                    <Image
                      src={donation.images[0]}
                      alt={donation.foodName}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 384px, 384px"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {donation.foodName}
                  </h3>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{donation.category}</span>
                    <span>{donation.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Donation Modal */}
        <DonationModal
          donation={selectedDonation}
          isOpen={!!selectedDonation}
          onClose={() => setSelectedDonation(null)}
        />
      </div>
    </div>
  );
}
