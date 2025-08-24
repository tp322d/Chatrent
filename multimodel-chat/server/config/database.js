const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MONGODB_URI from docker-compose, with fallback for local development
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/multimodel-chat';
    
    const conn = await mongoose.connect(mongoUri);
    
    console.log(`📦 MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`📋 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('🔍 Connection string:', process.env.MONGODB_URI ? '[CONFIGURED]' : '[DEFAULT LOCAL]');
    process.exit(1);
  }
};

module.exports = connectDB;