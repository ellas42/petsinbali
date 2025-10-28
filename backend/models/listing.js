const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  finder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'],
    required: true
  },
  breed: {
    type: String,
    trim: true
  },
  age: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Unknown']
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  photos: [{
    type: String // cloudinary urls
  }],
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Available', 'Pending', 'Adopted'],
    default: 'Available'
  },
  healthStatus: {
    type: String,
    trim: true
  },
  vaccinated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Listing', listingSchema);