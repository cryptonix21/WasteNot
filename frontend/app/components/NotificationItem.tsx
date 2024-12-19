'use client';

import { Notification } from '../services/notification.service';
import { notificationApi } from '../services/notification.service';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onStatusUpdate: (status: 'pending' | 'accepted' | 'denied') => void;
}

export default function NotificationItem({ notification, onClick, onStatusUpdate }: NotificationItemProps) {
  const handleResponse = async (status: 'accepted' | 'denied') => {
    try {
      await notificationApi.respondToRequest(notification._id, status);
      onStatusUpdate(status);
      toast.success(`Request ${status} successfully`);
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Failed to respond to request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600';
      case 'denied':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'denied':
        return 'Denied';
      default:
        return 'Pending';
    }
  };

  const isActionable = notification.type === 'DONATION_REQUEST' && notification.status === 'pending';

  return (
    <div 
      className={`p-4 rounded-lg transition-colors ${
        notification.isRead ? 'bg-gray-50' : 'bg-blue-50'
      } hover:bg-gray-100 cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex flex-col space-y-2">
        <p className="text-sm text-gray-800">{notification.message}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
          </span>
          <span className={`text-xs font-medium ${getStatusColor(notification.status)}`}>
            {getStatusText(notification.status)}
          </span>
        </div>
        
        {isActionable && (
          <div className="flex space-x-2 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResponse('accepted');
              }}
              className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
            >
              Accept
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResponse('denied');
              }}
              className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
