const Joi = require('joi');
//for login validation
const bcrypt = require('bcryptjs');
const user = require('../models/User.js');

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

//memorial kebodohan

//const validateLogin = (data) => {
  //const schema = Joi.object({
    //email: Joi.string().email().required(),
    //password: Joi.string() ????????
  //});
  //return schema.validate(data);
//};


//validation login
export const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  // compare
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  res.json({ message: "Login successful" });
};


const validateListing = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    type: Joi.string().valid('Dog', 'Cat', 'Bird', 'Rabbit', 'Other').required(),
    description: Joi.string().min(20).max(2000).required(),
    location: Joi.string().required(),
    photos: Joi.array().items(Joi.string().uri()).max(7),
    breed: Joi.string().max(50).optional(),
    age: Joi.string().max(20).optional(),
    gender: Joi.string().valid('Male', 'Female', 'Unknown').optional(),
    healthStatus: Joi.string().max(200).optional(),
    vaccinated: Joi.boolean().optional()
  });
  return schema.validate(data);
};

module.exports = { validateRegister, validateLogin, validateListing };