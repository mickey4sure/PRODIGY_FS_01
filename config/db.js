const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Set connection timeout to 2 seconds
    mongoose.set('bufferCommands', false);
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auth_db', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDb = false;
  } catch (error) {
    console.warn(`\n⚠️ MongoDB connection failed: ${error.message}`);
    console.warn(`⚠️ Automatically falling back to a local JSON file-based database (data/users.json) so you can test the application offline.\n`);
    global.useMockDb = true;
  }
};

module.exports = connectDB;
