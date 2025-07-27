import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gmail_clone';
        
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            bufferMaxEntries: 0,
            retryWrites: true,
            w: 'majority'
        };

        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
        
        const conn = await mongoose.connect(mongoURI, options);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        
        // Provide helpful error messages
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n❌ MongoDB Connection Failed!');
            console.error('🔧 Possible solutions:');
            console.error('   1. Make sure MongoDB is running locally');
            console.error('   2. Start MongoDB with: mongod');
            console.error('   3. Or use MongoDB Atlas cloud database');
            console.error('   4. Check your MONGODB_URI in .env file\n');
        }
        
        // Exit process with failure
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected from MongoDB');
});

// Handle app termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed through app termination');
        process.exit(0);
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
    }
});

export default connectDB;
