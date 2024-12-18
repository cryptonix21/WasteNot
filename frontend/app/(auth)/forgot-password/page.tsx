'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/auth/forgotpassword`, { email });
      console.log('Forgot password response:', response.data);
      
      if (response.data.success) {
        setResetToken(response.data.token);
        setStep('reset');
        toast.success('Reset token sent successfully');
      } else {
        toast.error(response.data.message || 'Failed to send reset token');
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Forgot password error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to send reset token');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/auth/resetpassword`, {
        email,
        token: resetToken,
        newPassword
      });

      if (response.data.success) {
        toast.success('Password reset completed successfully');
        router.push('/login');
      } else {
        toast.error(response.data.message || 'Failed to reset password');
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Reset password error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
        </div>

        {step === 'email' ? (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[rgb(22,163,74)] hover:bg-[rgb(20,184,61)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(5,150,105)]"
              >
                {isLoading ? 'Processing...' : 'Reset Password'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(22,163,74)] focus:border-[rgb(22,163,74)] transition-colors duration-200 ease-in-out sm:text-sm"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <div className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long
                </div>
              </div>
              
              <div className="relative">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(22,163,74)] focus:border-[rgb(22,163,74)] transition-colors duration-200 ease-in-out sm:text-sm"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[rgb(22,163,74)] hover:bg-[rgb(20,184,61)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(5,150,105)] transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        <div className="text-sm text-center">
          <Link href="/login" className="font-medium text-[rgb(22,163,74)] hover:text-[rgb(20,184,61)]">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
