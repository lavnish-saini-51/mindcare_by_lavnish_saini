const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const thoughtRoutes = require('./routes/thoughts');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
if (process.env.MONGO_URI && process.env.MONGO_URI !== 'mongodb+srv://username:password@cluster.mongodb.net/mindcare?retryWrites=true&w=majority')  {

  mongoose.connect('mongodb+srv://lavnishsaini51:sainisahab@lavnishsaininandpur.gevukdy.mongodb.net/?retryWrites=true&w=majority&appName=lavnishsaininandpur')
    .then(() => {
      console.log('✅ Connected to MongoDB Atlas');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      console.log('⚠️  Server will continue without database connection. Please set MONGO_URI in your .env file.');
    });
} else {
  console.log('⚠️  MONGO_URI not configured. Server will run without database connection.');
  console.log('📝 Please create a .env file with your MongoDB connection string.');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/thoughts', thoughtRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MindCare API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 MindCare server running on port ${PORT}`);
  console.log(`📱 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔗 API: http://localhost:${PORT}`);
});

