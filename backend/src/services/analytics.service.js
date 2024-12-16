const Food = require('../models/FoodDonation');

const getAnalytics = async () => {
  try {
    // Get total number of donations
    const totalDonations = await Food.countDocuments();

    // Calculate total quantity of food donated
    const foodQuantities = await Food.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          categoryCounts: {
            $push: {
              category: '$category',
              quantity: '$quantity'
            }
          }
        }
      }
    ]);

    // Calculate category distribution
    const categoryDistribution = {};
    if (foodQuantities.length > 0) {
      foodQuantities[0].categoryCounts.forEach(item => {
        categoryDistribution[item.category] = (categoryDistribution[item.category] || 0) + item.quantity;
      });
    }

    // Estimate number of people served (rough estimation: 1kg = 2 people served)
    const totalQuantity = foodQuantities.length > 0 ? foodQuantities[0].totalQuantity : 0;
    const estimatedPeopleServed = Math.floor(totalQuantity * 2);

    // Calculate CO2 saved (rough estimation: 1kg food = 2.5kg CO2 saved)
    const estimatedCO2Saved = totalQuantity * 2.5;

    return {
      totalDonations,
      totalQuantity,
      estimatedPeopleServed,
      estimatedCO2Saved,
      categoryDistribution
    };
  } catch (error) {
    throw new Error('Error fetching analytics data: ' + error.message);
  }
};

module.exports = {
  getAnalytics
};
