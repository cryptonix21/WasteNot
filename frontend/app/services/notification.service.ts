import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    name: string;
  };
  type: 'DONATION_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_DENIED';
  donation: {
    _id: string;
    foodName: string;
  };
  message: string;
  isRead: boolean;
  status: 'pending' | 'accepted' | 'denied';
  createdAt: string;
}

export const notificationApi = {
  // Send a donation request
  sendDonationRequest: async (donationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_URL}/notifications/request/${donationId}`,
        { donationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending donation request:', error);
      throw error;
    }
  },

  // Respond to a donation request
  respondToRequest: async (notificationId: string, status: 'accepted' | 'denied') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${API_URL}/notifications/respond/${notificationId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error responding to request:', error);
      throw error;
    }
  },

  // Get user's notifications
  getNotifications: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    try {
      const response = await axios.post(
        `${API_URL}/notifications/clear-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  },
};
