const Joi = require('joi');

const validateRegister = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(6)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
      .required()
      .messages({
        'string.pattern.base': 'Password must contain uppercase, lowercase, and number'
      }),
    name: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('Finder', 'Adopter').required(),
    location: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional()
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });
  return schema.validate(data);
};

const validateListing = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    type: Joi.string().valid('Dog', 'Cat', 'Bird', 'Rabbit', 'Other').required(),
    description: Joi.string().min(20).max(2000).required(),
    location: Joi.string().required(),
    photos: Joi.array().items(Joi.string().uri()).max(5),
    breed: Joi.string().max(50).optional(),
    age: Joi.string().max(20).optional(),
    gender: Joi.string().valid('Male', 'Female', 'Unknown').optional(),
    healthStatus: Joi.string().max(200).optional(),
    vaccinated: Joi.boolean().optional()
  });
  return schema.validate(data);
};

module.exports = { validateRegister, validateLogin, validateListing };