import { NextResponse } from 'next/server';
import axios from 'axios';

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
  } catch (error: any) {
    console.error('Error in donations API route:', error);
    
    // More detailed error logging
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
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
