const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

// Use a test token - you'll need to replace this with a valid token from your frontend
const TEST_TOKEN = 'YOUR_TEST_TOKEN_HERE';

async function testAddFoodDonation() {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('foodName', 'Test Food Item');
    formData.append('category', 'Fruits & Vegetables');
    formData.append('quantity', '2 kg');
    formData.append('description', 'Fresh vegetables for donation');
    formData.append('expiryDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
    formData.append('location', JSON.stringify({
      address: '123 Test Street, Test City',
      latitude: 40.7128,
      longitude: -74.0060,
      shareExactLocation: true
    }));

    // Add test image if available
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (fs.existsSync(testImagePath)) {
      formData.append('images', fs.createReadStream(testImagePath));
    }

    console.log('Sending test food donation request...');

    const response = await axios.post(`${API_URL}/add-food`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('Response:', {
      status: response.status,
      data: response.data
    });

    return response.data;
  } catch (error) {
    console.error('Test failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

// Run the test
testAddFoodDonation()
  .then(() => console.log('Test completed successfully'))
  .catch(() => console.log('Test failed'))
  .finally(() => process.exit());
