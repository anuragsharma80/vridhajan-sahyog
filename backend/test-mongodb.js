require('dotenv').config();
const mongoose = require('mongoose');

const testDBConnection = async () => {
  console.log('🔄 Testing MongoDB connection...');
  const mongoUri = process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/vridhajan-sahyog';
  console.log('DATABASE_URI:', mongoUri);

  try {
    // Set a shorter timeout for testing
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    
    console.log('✅ MongoDB Connection Successful!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🔗 Host:', mongoose.connection.host);
    console.log('🚪 Port:', mongoose.connection.port);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.length > 0 ? collections.map(c => c.name) : 'No collections found');
    
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error:', err.message);
    
    if (err.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solution:');
      console.log('1. Make sure MongoDB is installed');
      console.log('2. Start MongoDB service:');
      console.log('   - Open Services (services.msc)');
      console.log('   - Find "MongoDB" and start it');
      console.log('   - OR run: net start MongoDB (as admin)');
      console.log('   - OR manually start: mongod.exe');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Disconnected from MongoDB.');
    }
    process.exit(0);
  }
};

testDBConnection();