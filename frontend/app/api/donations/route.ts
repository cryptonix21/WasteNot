import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Get the backend API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('Backend API URL is not configured');
    }

    // Forward the request to the backend API
    const response = await axios.post(
      `${apiUrl}/donations`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Error in donations API route:', error);
    
    if (error instanceof AxiosError) {
      // Handle Axios error with response
      if (error.response) {
        console.error('Backend response error:', {
          status: error.response.status,
          data: error.response.data,
        });
        return NextResponse.json(
          { message: error.response.data.message || 'Server error' },
          { status: error.response.status }
        );
      }
      
      // Handle Axios error without response (network error, etc.)
      return NextResponse.json(
        { message: error.message || 'Network error' },
        { status: 500 }
      );
    }
    
    // Handle non-Axios errors
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
