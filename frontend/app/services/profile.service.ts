import { User } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ProfileUpdateData {
  name?: string;
  email?: string;
  avatar?: string;
}

interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export const getProfile = async (): Promise<User> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch profile');
  }

  const data = await response.json();
  
  // Ensure we have the correct field mapping
  return {
    id: data.id,
    email: data.email,
    fullName: data.fullName || data.name || '', // Try both fullName and name fields
    avatar: data.avatar
  };
};

export const updateProfile = async (data: ProfileUpdateData): Promise<User> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  return response.json();
};

export const updatePassword = async (data: PasswordUpdateData): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/auth/profile/password`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update password');
  }
};

export const uploadProfilePicture = async (file: File): Promise<{ url: string }> => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('profilePicture', file);

  const response = await fetch(`${API_URL}/auth/profile/picture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload profile picture');
  }

  return response.json();
};
