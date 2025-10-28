// Set test timeout
jest.setTimeout(10000);

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';