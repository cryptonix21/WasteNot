'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../context/auth.context';
import { getProfile } from '../services/profile.service';
import userIcon from "../../public/usericon.png";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profileData = await getProfile();
      setUser(profileData);
    } catch (err: Error) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-32 bg-green-600">
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <Image
                  src={user?.avatar || userIcon}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="rounded-full border-4 border-white"
                />
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="mt-20 px-6 py-6">
            {isLoading ? (
              <div className="text-center">Loading...</div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : user ? (
              <div className="space-y-6">
                <div className="grid gap-6">
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                    <div className="text-lg font-semibold text-gray-900 p-2 bg-white rounded border border-gray-200">
                      {user.name}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                    <div className="text-lg font-semibold text-gray-900 p-2 bg-white rounded border border-gray-200">
                      {user.email}
                    </div>
                  </div>
                </div>

                {((user?.donations?.length ?? 0) > 0 || (user?.reservations?.length ?? 0) > 0) && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Activity</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="font-medium text-green-800">Donations</p>
                        <p className="text-2xl font-bold text-green-600">{user?.donations?.length ?? 0}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="font-medium text-blue-800">Reservations</p>
                        <p className="text-2xl font-bold text-blue-600">{user?.reservations?.length ?? 0}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">Please sign in to view your profile</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
