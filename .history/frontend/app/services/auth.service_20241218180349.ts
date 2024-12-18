import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Debug log to check API URL
console.log('API_URL:', API_URL);

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
}

export const signUp = async (userData: { email: string; password: string;fullName: string }): Promise<{
  message: string; token: string; user: User 
}> => {
  try {
    console.log('Sending signup data:', userData);
    const response = await axios.post(`${API_URL}/auth/signup`, userData);
    console.log('Signup response:', response.data);
    const data = response.data;

    // Store the token and user data
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error: any | { response?: { data?: { message?: string }, status?: number } }) {
    console.error('Signup error details:', {
      response: error.response?.data,
      status: error.response?.status,
      message: 'response' in error ? error.response?.data?.message : error.message,
      userData: userData
    });
    throw new Error('response' in error ? error.response?.data?.message || error.response?.data || 'Failed to sign up' : error.message);
  }
};

export const signIn = async (credentials: { email: string; password: string }): Promise<{ token: string; user: User }> => {
  try {
    const response = await axios.post(`${API_URL}/auth/signin`, credentials);
    console.log('Login response:', response.data);
    const data = response.data;

    // Store the token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Stored user data:', data.user);
    }

    return data;
  } catch (error: Error | { response?: { data?: { message?: string } } }) {
    console.error('Signin error:', 'response' in error ? error.response?.data : error.message);
    throw new Error('response' in error ? error.response?.data?.message || 'Failed to sign in' : error.message);
  }
};
