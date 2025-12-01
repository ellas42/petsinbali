const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('Connecting to MongoDB with URI:', process.env.MONGO_URI); // add this
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
