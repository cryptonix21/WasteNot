'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/auth.context';
import { foodDonationApi, AddFoodData } from '@/app/api/donations/api';
import LocationPicker from '@/app/components/LocationPicker';

const categories = [
  'Fruits & Vegetables',
  'Cooked Meals',
  'Baked Goods',
  'Dairy Products',
  'Canned Foods',
  'Beverages',
  'Other'
];

const units = ['kg', 'g', 'pieces', 'servings', 'liters', 'ml'];

export default function AddFood() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    foodName: '',
    category: '',
    quantity: '',
    unit: '',
    expiryDate: '',
  });

  const [location, setLocation] = useState<{
    type: 'Point';
    coordinates: [number, number];
    address: string;
    shareExactLocation: boolean;
  }>({
    type: 'Point',
    coordinates: [0, 0],
    address: '',
    shareExactLocation: true
  });

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedDonation = localStorage.getItem('pendingFoodDonation');
    if (savedDonation) {
      try {
        const { formData: savedFormData, location: savedLocation, previewUrl: savedPreviewUrl } = JSON.parse(savedDonation);
        setFormData(savedFormData);
        setLocation(savedLocation);
        setPreviewUrl(savedPreviewUrl);
        localStorage.removeItem('pendingFoodDonation');
      } catch (error) {
        console.error('Error restoring saved donation:', error);
        localStorage.removeItem('pendingFoodDonation');
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate foodName
    const trimmedFoodName = formData.foodName.trim();
    if (!trimmedFoodName) {
      newErrors.foodName = 'Food name is required';
    } else if (trimmedFoodName.length < 2) {
      newErrors.foodName = 'Food name must be at least 2 characters long';
    }
    
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.quantity || Number(formData.quantity) <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!formData.unit) newErrors.unit = 'Please select a unit';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!location.address && !location.coordinates[0]) newErrors.location = 'Location is required';
    if (!image) newErrors.image = 'Please upload an image';
    
    const expiryDate = new Date(formData.expiryDate);
    if (expiryDate <= new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    if (!user) {
      // Save form data to localStorage before redirecting
      const formState = {
        formData,
        location,
        previewUrl
      };
      localStorage.setItem('pendingFoodDonation', JSON.stringify(formState));
      toast.error('Please log in to submit your donation');
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);

      const foodData: AddFoodData = {
        foodName: formData.foodName.trim(),
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        expiryDate: formData.expiryDate,
        location: {
          type: 'Point',
          coordinates: location.coordinates,
          address: location.address.trim(),
          shareExactLocation: location.shareExactLocation
        }
      };

      await foodDonationApi.addFoodDonation(foodData, image || undefined);
      
      toast.success('Food donation submitted successfully!');
      router.push('/matches');

      // Reset form
      setFormData({
        foodName: '',
        category: '',
        quantity: '',
        unit: '',
        expiryDate: '',
      });
      setLocation({
        type: 'Point',
        coordinates: [0, 0],
        address: '',
        shareExactLocation: true
      });
      setImage(null);
      setPreviewUrl('');
      
    } catch (error: any) {
      console.error('Error submitting food donation:', error);
      toast.error(error.response?.data?.error || 'Error submitting food donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Add Food Donation</h1>
          <p className="mt-2 text-gray-600 text-lg">Share your surplus food with those in need</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Food Name */}
          <div className="transition-all duration-200 ease-in-out hover:translate-y-[-2px]">
            <label htmlFor="foodName" className="block text-sm font-semibold text-gray-700 mb-2">
              Food Name *
            </label>
            <input
              type="text"
              id="foodName"
              name="foodName"
              value={formData.foodName}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-4 py-3 rounded-xl border bg-gray-50 shadow-sm transition-all duration-200
                ${errors.foodName 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:border-green-500 focus:ring-green-500 hover:border-gray-300'} 
                focus:bg-white sm:text-sm`}
              placeholder="e.g., Fresh Vegetables"
            />
            {errors.foodName && (
              <p className="mt-2 text-sm text-red-600">{errors.foodName}</p>
            )}
          </div>

          {/* Category */}
          <div className="transition-all duration-200 ease-in-out hover:translate-y-[-2px]">
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-4 py-3 rounded-xl border bg-gray-50 shadow-sm transition-all duration-200
                ${errors.category 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:border-green-500 focus:ring-green-500 hover:border-gray-300'}
                focus:bg-white sm:text-sm`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-2 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-6">
            <div className="transition-all duration-200 ease-in-out hover:translate-y-[-2px]">
              <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                className={`mt-1 block w-full px-4 py-3 rounded-xl border bg-gray-50 shadow-sm transition-all duration-200
                  ${errors.quantity 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:border-green-500 focus:ring-green-500 hover:border-gray-300'}
                  focus:bg-white sm:text-sm`}
              />
              {errors.quantity && (
                <p className="mt-2 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>

            <div className="transition-all duration-200 ease-in-out hover:translate-y-[-2px]">
              <label htmlFor="unit" className="block text-sm font-semibold text-gray-700 mb-2">
                Unit *
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-4 py-3 rounded-xl border bg-gray-50 shadow-sm transition-all duration-200
                  ${errors.unit 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:border-green-500 focus:ring-green-500 hover:border-gray-300'}
                  focus:bg-white sm:text-sm`}
              >
                <option value="">Select a unit</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="mt-2 text-sm text-red-600">{errors.unit}</p>
              )}
            </div>
          </div>

          {/* Expiry Date */}
          <div className="transition-all duration-200 ease-in-out hover:translate-y-[-2px]">
            <label htmlFor="expiryDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Expiry Date *
            </label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className={`mt-1 block w-full px-4 py-3 rounded-xl border bg-gray-50 shadow-sm transition-all duration-200
                ${errors.expiryDate 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:border-green-500 focus:ring-green-500 hover:border-gray-300'}
                focus:bg-white sm:text-sm`}
            />
            {errors.expiryDate && (
              <p className="mt-2 text-sm text-red-600">{errors.expiryDate}</p>
            )}
          </div>

          {/* Location Picker */}
          <div className="transition-all duration-200 ease-in-out hover:translate-y-[-2px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location *
            </label>
            <LocationPicker
              value={location}
              onChange={setLocation}
              error={errors.location}
            />
          </div>

          {/* Image Upload */}
          <div className="transition-all duration-200 ease-in-out hover:translate-y-[-2px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Image *
            </label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl bg-gray-50
              transition-all duration-200 hover:border-green-500 hover:bg-green-50
              ${errors.image ? 'border-red-300' : 'border-gray-300'}`}>
              <div className="space-y-2 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 transition-colors duration-200 group-hover:text-green-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500 transition-colors duration-200"
                  >
                    <span>Upload a file</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
            {previewUrl && (
              <div className="mt-4 relative">
                <Image
                  src={previewUrl}
                  alt={`Preview of ${formData.foodName || 'food donation'}`}
                  width={200}
                  height={200}
                  className="rounded-xl object-cover shadow-md"
                />
              </div>
            )}
            {errors.image && (
              <p className="mt-2 text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-base font-medium text-white 
                transition-all duration-200
                ${isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-lg hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
