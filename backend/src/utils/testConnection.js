import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log(`Using connection string: ${process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to MongoDB:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error Code:', error.code);
    }
    
    process.exit(1);
  }
};

testConnection();
