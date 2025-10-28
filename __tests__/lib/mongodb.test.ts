import mongoose from 'mongoose';
import connectDB from '../../lib/mongodb';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    readyState: 0,
  },
}));

describe('MongoDB Connection Utility', () => {
  const originalEnv = process.env;
  let mockConnect: jest.MockedFunction<typeof mongoose.connect>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Reset the global mongoose cache
    if (global.mongoose) {
      global.mongoose = { conn: null, promise: null };
    }
    
    process.env = { ...originalEnv };
    mockConnect = mongoose.connect as jest.MockedFunction<typeof mongoose.connect>;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Connection Establishment', () => {
    it('should successfully connect to MongoDB with valid URI', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      mockConnect.mockResolvedValueOnce(mongoose as any);

      const result = await connectDB();

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockConnect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/testdb',
        { bufferCommands: false }
      );
      expect(result).toBe(mongoose);
    });

    it('should throw error when MONGODB_URI is not defined', async () => {
      delete process.env.MONGODB_URI;

      await expect(connectDB()).rejects.toThrow(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
      expect(mockConnect).not.toHaveBeenCalled();
    });

    it('should throw error when MONGODB_URI is empty string', async () => {
      process.env.MONGODB_URI = '';

      await expect(connectDB()).rejects.toThrow(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
      expect(mockConnect).not.toHaveBeenCalled();
    });

    it('should connect with bufferCommands disabled', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      mockConnect.mockResolvedValueOnce(mongoose as any);

      await connectDB();

      expect(mockConnect).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ bufferCommands: false })
      );
    });
  });

  describe('Connection Caching', () => {
    it('should cache the connection after first connect', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      mockConnect.mockResolvedValue(mongoose as any);

      const result1 = await connectDB();
      const result2 = await connectDB();

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(result1).toBe(result2);
    });

    it('should return cached connection without calling connect again', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      mockConnect.mockResolvedValue(mongoose as any);

      await connectDB();
      mockConnect.mockClear();
      
      const result = await connectDB();

      expect(mockConnect).not.toHaveBeenCalled();
      expect(result).toBe(mongoose);
    });

    it('should use global cache to persist across hot reloads', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      mockConnect.mockResolvedValue(mongoose as any);

      // First connection
      await connectDB();
      
      // Simulate module hot reload by requiring the module again
      jest.resetModules();
      const connectDB2 = require('../../lib/mongodb').default;
      
      mockConnect.mockClear();
      const result = await connectDB2();

      // Should use cached connection
      expect(mockConnect).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('Concurrent Connection Attempts', () => {
    it('should handle concurrent connection attempts gracefully', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      
      // Simulate slow connection
      mockConnect.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve(mongoose as any), 100))
      );

      // Make multiple concurrent connection attempts
      const promises = [
        connectDB(),
        connectDB(),
        connectDB(),
      ];

      const results = await Promise.all(promises);

      // Should only call connect once
      expect(mockConnect).toHaveBeenCalledTimes(1);
      
      // All should return the same connection
      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);
    });

    it('should reuse connection promise when connection is in progress', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      let resolveConnect: any;
      
      mockConnect.mockImplementation(() => 
        new Promise((resolve) => {
          resolveConnect = () => resolve(mongoose as any);
        })
      );

      // Start first connection (don't await)
      const promise1 = connectDB();
      
      // Start second connection while first is pending
      const promise2 = connectDB();

      // Resolve the connection
      resolveConnect();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(result1).toBe(result2);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when connection fails', async () => {
      process.env.MONGODB_URI = 'mongodb://invalid-host:27017/testdb';
      const connectionError = new Error('Connection failed');
      mockConnect.mockRejectedValueOnce(connectionError);

      await expect(connectDB()).rejects.toThrow('Connection failed');
    });

    it('should reset promise cache on connection failure', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      mockConnect.mockRejectedValueOnce(new Error('Connection failed'));

      // First attempt should fail
      await expect(connectDB()).rejects.toThrow('Connection failed');

      // Second attempt should try to connect again
      mockConnect.mockResolvedValueOnce(mongoose as any);
      const result = await connectDB();

      expect(mockConnect).toHaveBeenCalledTimes(2);
      expect(result).toBe(mongoose);
    });

    it('should handle network timeout errors', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      mockConnect.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(connectDB()).rejects.toThrow('Network timeout');
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should handle authentication errors', async () => {
      process.env.MONGODB_URI = 'mongodb://user:pass@localhost:27017/testdb';
      mockConnect.mockRejectedValueOnce(new Error('Authentication failed'));

      await expect(connectDB()).rejects.toThrow('Authentication failed');
    });
  });

  describe('Connection String Variations', () => {
    it('should handle MongoDB Atlas connection string', async () => {
      process.env.MONGODB_URI = 'mongodb+srv://user:pass@cluster.mongodb.net/dbname';
      mockConnect.mockResolvedValueOnce(mongoose as any);

      await connectDB();

      expect(mockConnect).toHaveBeenCalledWith(
        'mongodb+srv://user:pass@cluster.mongodb.net/dbname',
        expect.any(Object)
      );
    });

    it('should handle connection string with options', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb?retryWrites=true';
      mockConnect.mockResolvedValueOnce(mongoose as any);

      await connectDB();

      expect(mockConnect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/testdb?retryWrites=true',
        expect.any(Object)
      );
    });

    it('should handle localhost connection', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/local-db';
      mockConnect.mockResolvedValueOnce(mongoose as any);

      await connectDB();

      expect(mockConnect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/local-db',
        expect.any(Object)
      );
    });

    it('should handle 127.0.0.1 connection', async () => {
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/testdb';
      mockConnect.mockResolvedValueOnce(mongoose as any);

      await connectDB();

      expect(mockConnect).toHaveBeenCalledWith(
        'mongodb://127.0.0.1:27017/testdb',
        expect.any(Object)
      );
    });
  });

  describe('Global Cache Initialization', () => {
    it('should initialize global cache if not exists', async () => {
      delete (global as any).mongoose;
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      mockConnect.mockResolvedValueOnce(mongoose as any);

      await connectDB();

      expect((global as any).mongoose).toBeDefined();
      expect((global as any).mongoose.conn).toBe(mongoose);
    });

    it('should use existing global cache if available', async () => {
      const existingCache = { conn: mongoose, promise: null };
      (global as any).mongoose = existingCache;
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';

      const result = await connectDB();

      expect(mockConnect).not.toHaveBeenCalled();
      expect(result).toBe(mongoose);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined environment variable gracefully', async () => {
      process.env.MONGODB_URI = undefined;

      await expect(connectDB()).rejects.toThrow(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    });

    it('should handle null as connection result', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      mockConnect.mockResolvedValueOnce(null as any);

      const result = await connectDB();

      expect(result).toBeNull();
    });

    it('should handle whitespace-only MONGODB_URI', async () => {
      process.env.MONGODB_URI = '   ';

      await expect(connectDB()).rejects.toThrow(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    });
  });
});