const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('Mongo URI:', process.env.MONGO_URI);

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');


const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const messageRoutes = require('./routes/messages');

const app = express();
app.use(helmet());

connectDB();

// MIDDLEWAREEEEEEEEEEEEEEE
app.use(cors({
  origin: '*',  // allowing ALL origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
app.use(express.json());
app.use(mongoSanitize());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// ROUTEEEEEEEEEEEEES
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/messages', require('./routes/messages'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error' });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({ error: 'Duplicate entry' });
  }

  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Something went wrong' 
  });
});


///DEBUG TEST WOOOOOHOOOO WALLAHI
app.get('/api/test-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const status = mongoose.connection.readyState;
    
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({ 
      mongoStatus: states[status],
      message: status === 1 ? '✅ Database connected' : '❌ Database not connected'
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});


//PUT THIS AT THE END
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});