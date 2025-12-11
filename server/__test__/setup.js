// Load environment variables FIRST
require('dotenv').config();

// Test database setup
const { sequelize } = require('../models');

beforeAll(async () => {
  try {
    // Set to test environment
    process.env.NODE_ENV = 'test';
    
    // Set test JWT secret if not set
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
    }
    
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Test database synced');
  } catch (error) {
    console.error('❌ Test setup error:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Close database connection
    await sequelize.close();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.error('❌ Test cleanup error:', error);
  }
});
