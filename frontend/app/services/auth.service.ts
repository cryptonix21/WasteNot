import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';



export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message: string;
}

export const signUp = async (userData: { email: string; password: string;fullName: string }): Promise<{
  message: string; token: string; user: User 
}> => {
  try {
   
    const response = await axios.post(`${API_URL}/auth/signup`, userData);
    
    const data = response.data;

    // Store the token and user data
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error: unknown) {
    const err = error as ApiError;
    console.error('Signup error details:', {
      response: err.response?.data,
      status: err.response?.status,
      message: 'response' in err ? err.response?.data?.message : err.message,
      userData: userData
    });
    throw new Error('response' in err ? 
      (err.response?.data?.message || 
       (typeof err.response?.data === 'string' ? err.response.data : 'Failed to sign up')
      ) : err.message || 'Unknown error');
  }
};

export const signIn = async (credentials: { email: string; password: string }): Promise<{ token: string; user: User }> => {
  try {
    const response = await axios.post(`${API_URL}/auth/signin`, credentials);
   
    const data = response.data;

    // Store the token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
    }

    return data;
  } catch (error: unknown) {
    const err = error as ApiError;
    console.error('Signin error:', 'response' in err ? err.response?.data : err.message);
    throw new Error('response' in err ? err.response?.data?.message || 'Failed to sign in' : err.message);
  }
};
