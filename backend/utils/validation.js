const Joi = require('joi');

exports.validateFoodDonation = (data) => {
  const schema = Joi.object({
    foodName: Joi.string().min(2).required().messages({
      'string.empty': 'Food name is required',
      'string.min': 'Food name must be at least 2 characters long'
    }),
    category: Joi.string().valid(
      'Fruits & Vegetables',
      'Cooked Meals',
      'Baked Goods',
      'Dairy Products',
      'Canned Foods',
      'Beverages',
      'Other'
    ).required().messages({
      'any.required': 'Category is required',
      'any.only': 'Invalid category selected'
    }),
    quantity: Joi.number().min(1).required().messages({
      'number.base': 'Quantity must be a number',
      'number.min': 'Quantity must be at least 1',
      'any.required': 'Quantity is required'
    }),
    unit: Joi.string().valid('kg', 'g', 'pieces', 'servings', 'liters', 'ml').required().messages({
      'any.required': 'Unit is required',
      'any.only': 'Invalid unit selected'
    }),
    description: Joi.string().min(10).required().messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters long'
    }),
    expiryDate: Joi.date().greater('now').required().messages({
      'date.base': 'Invalid expiry date',
      'date.greater': 'Expiry date must be in the future',
      'any.required': 'Expiry date is required'
    }),
    location: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
      address: Joi.string().required().messages({
        'string.empty': 'Address is required'
      }),
      shareExactLocation: Joi.boolean().default(true)
    }).required().messages({
      'any.required': 'Location is required'
    })
  });

  return schema.validate(data);
};
