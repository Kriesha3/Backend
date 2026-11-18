const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose
 * Works with MongoDB Atlas or a local MongoDB instance.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.error('ERROR: MONGODB_URI is not defined in your .env file!');
      console.error('Please configure your .env file with your MongoDB Atlas or local connection string.');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Tip: Make sure your IP is whitelisted (0.0.0.0/0) in MongoDB Atlas and your credentials are correct.');
    process.exit(1);
  }
};

module.exports = connectDB;
