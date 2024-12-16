const Notification = require('../models/Notification');
const User = require('../models/User');
const FoodDonation = require('../models/FoodDonation');

const createDonationRequest = async (senderId, donationId) => {
  try {
    // Get the donation and check if it exists
    const donation = await FoodDonation.findById(donationId);
    if (!donation) {
      throw new Error('Donation not found');
    }

    // Get sender details
    const sender = await User.findById(senderId);
    if (!sender) {
      throw new Error('User not found');
    }

    // Get donor details
    const donor = await User.findById(donation.userId);
    if (!donor) {
      throw new Error('Donor not found');
    }

    // Create notification for the donor
    const notification = new Notification({
      recipient: donor._id,
      sender: senderId,
      type: 'DONATION_REQUEST',
      donation: donationId,
      message: `${sender.name || 'Someone'} is interested in your food donation: "${donation.foodName}"`,
      status: 'pending'
    });

    await notification.save();
    return notification;
  } catch (error) {
    throw error;
  }
};

const respondToDonationRequest = async (notificationId, status) => {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    // Update the notification status
    notification.status = status;
    notification.isRead = true; // Mark as read when responded
    await notification.save();

    // Create a new notification for the sender
    const responseNotification = new Notification({
      recipient: notification.sender,
      sender: notification.recipient,
      type: status === 'accepted' ? 'REQUEST_ACCEPTED' : 'REQUEST_REJECTED',
      donation: notification.donation,
      message: `Your request for food receiving has been ${status} by "${notification.message.split('"')[1]}"`,
      status: status,
      isRead: false
    });

    await responseNotification.save();
    return { success: true, message: 'Response sent successfully' };
  } catch (error) {
    throw error;
  }
};

const getUserNotifications = async (userId) => {
  try {
    return await Notification.find({ recipient: userId })
      .populate('sender', 'name')
      .populate('donation', 'foodName')
      .sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

const markNotificationAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    return notification;
  } catch (error) {
    throw error;
  }
};

const clearAllNotifications = async (userId) => {
  try {
    // Delete all notifications for the user instead of just marking them as read
    await Notification.deleteMany({ recipient: userId });
    return { success: true, message: 'All notifications cleared' };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createDonationRequest,
  respondToDonationRequest,
  getUserNotifications,
  markNotificationAsRead,
  clearAllNotifications
};
