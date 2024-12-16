import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate instance for public routes (no auth required)
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  donations?: FoodDonation[];
  reservations?: FoodDonation[];
}

export interface FoodDonation {
  _id: string;
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  location: {
    type: string;
    coordinates: [number, number];
    address: string;
    shareExactLocation: boolean;
  };
  images: string[];
  status: 'available' | 'reserved' | 'completed';
  donor: User;
  recipient?: User;
  createdAt: string;
  updatedAt: string;
}

export interface AddFoodData {
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  location: {
    type: string;
    coordinates: [number, number];
    address: string;
    shareExactLocation: boolean;
  };
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: string;
  type: 'DONATION_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED';
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  totalDonations: number;
  totalQuantity: number;
  estimatedPeopleServed: number;
  estimatedCO2Saved: number;
  categoryDistribution: Record<string, number>;
}

// Auth API
export const authApi = {
  signIn: async (credentials: { email: string; password: string }): Promise<{ token: string; user: User }> => {
    try {
      const response = await api.post('/auth/signin', credentials);
      const data = response.data;

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error: any) {
      console.error('Signin error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to sign in');
    }
  },

  signUp: async (userData: { email: string; password: string; name: string }): Promise<{ token: string; user: User }> => {
    try {
      const response = await api.post('/auth/signup', userData);
      const data = response.data;

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error: any) {
      console.error('Signup error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to sign up');
    }
  },

  signOut: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  forgotPassword: async (email: string) => {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      await api.post('/auth/reset-password', { token, password });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  }
};

// Food Donation API
export const foodDonationApi = {
  // Add new food donation
  addFoodDonation: async (data: AddFoodData, image?: File): Promise<FoodDonation> => {
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      
      if (image) {
        formData.append('image', image);
      }

      const response = await api.post<FoodDonation>('/donations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error adding food donation:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get food donations with filters
  getFoodDonations: async (params?: {
    category?: string;
    radius?: number;
    latitude?: number;
    longitude?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    data: FoodDonation[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  }> => {
    try {
      const response = await api.get('/donations', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error getting food donations:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a single food donation by ID
  getFoodDonation: async (id: string): Promise<FoodDonation> => {
    try {
      const response = await api.get(`/donations/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting food donation:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update a food donation
  updateFoodDonation: async (id: string, data: Partial<AddFoodData>, image?: File): Promise<FoodDonation> => {
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      
      if (image) {
        formData.append('image', image);
      }

      const response = await api.put(`/donations/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error updating food donation:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a food donation
  deleteFoodDonation: async (id: string): Promise<void> => {
    try {
      await api.delete(`/donations/${id}`);
    } catch (error: any) {
      console.error('Error deleting food donation:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Profile API
export const profileApi = {
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error getting profile:', error.response?.data || error.message);
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await api.put('/profile', data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile:', error.response?.data || error.message);
      throw error;
    }
  },

  updateAvatar: async (image: File): Promise<User> => {
    try {
      const formData = new FormData();
      formData.append('avatar', image);

      const response = await api.put('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error updating avatar:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Notification API
export const notificationApi = {
  // Get user's notifications
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error: any) {
      console.error('Error getting notifications:', error.response?.data || error.message);
      throw error;
    }
  },

  // Send a donation request
  sendDonationRequest: async (donationId: string): Promise<void> => {
    try {
      await api.post(`/notifications/request/${donationId}`);
    } catch (error: any) {
      console.error('Error sending donation request:', error.response?.data || error.message);
      throw error;
    }
  },

  // Respond to a donation request
  respondToRequest: async (notificationId: string, status: 'accepted' | 'rejected'): Promise<void> => {
    try {
      await api.put(`/notifications/respond/${notificationId}`, { status });
    } catch (error: any) {
      console.error('Error responding to request:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error: any) {
      console.error('Error marking notification as read:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Analytics API
export const analyticsApi = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    try {
      const response = await publicApi.get('/analytics');
      return response.data;
    } catch (error: any) {
      console.error('Error getting analytics:', error.response?.data || error.message);
      throw error;
    }
  }
};
