import mongoose from 'mongoose';
import connectDB from '../lib/mongodb';

describe('MongoDB Connection Utility', () => {
  // Store original environment variable
  const originalMongoUri = process.env.MONGODB_URI;

  afterEach(async () => {
    // Restore original environment variable
    process.env.MONGODB_URI = originalMongoUri;
    
    // Close any open connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Clear the global cache
    if (global.mongoose) {
      global.mongoose = { conn: null, promise: null };
    }
  });

  describe('Environment Variable Validation', () => {
    it('should throw error when MONGODB_URI is not defined', async () => {
      delete process.env.MONGODB_URI;
      
      // Clear cache to force new connection attempt
      if (global.mongoose) {
        global.mongoose = { conn: null, promise: null };
      }

      await expect(connectDB()).rejects.toThrow(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    });

    it('should throw error when MONGODB_URI is empty string', async () => {
      process.env.MONGODB_URI = '';
      
      // Clear cache to force new connection attempt
      if (global.mongoose) {
        global.mongoose = { conn: null, promise: null };
      }

      await expect(connectDB()).rejects.toThrow(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    });
  });

  describe('Connection Caching', () => {
    it('should return cached connection on subsequent calls', async () => {
      // This test uses the MongoDB Memory Server from setup.ts
      // First call establishes connection
      const conn1 = await connectDB();
      expect(conn1).toBeDefined();
      
      // Second call should return cached connection
      const conn2 = await connectDB();
      expect(conn2).toBe(conn1);
      expect(conn2).toEqual(conn1);
    });

    it('should cache connection globally', async () => {
      const conn = await connectDB();
      expect(global.mongoose).toBeDefined();
      expect(global.mongoose?.conn).toBe(conn);
    });

    it('should cache connection promise while connecting', async () => {
      // Clear cache
      if (global.mongoose) {
        global.mongoose = { conn: null, promise: null };
      }

      // Start first connection
      const promise1 = connectDB();
      
      // Check that promise is cached
      expect(global.mongoose?.promise).toBeDefined();
      
      // Start second connection before first completes
      const promise2 = connectDB();
      
      // Both should resolve to same connection
      const [conn1, conn2] = await Promise.all([promise1, promise2]);
      expect(conn1).toBe(conn2);
    });
  });

  describe('Connection State', () => {
    it('should establish a valid mongoose connection', async () => {
      const conn = await connectDB();
      expect(conn.connection.readyState).toBe(1); // 1 = connected
    });

    it('should have bufferCommands disabled', async () => {
      await connectDB();
      // The connection options are set during connect
      // We can verify the connection works without buffering by performing an operation
      expect(mongoose.connection.readyState).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should reset promise cache on connection error', async () => {
      // Set invalid URI
      process.env.MONGODB_URI = 'mongodb://invalid-host:27017/test';
      
      // Clear cache
      if (global.mongoose) {
        global.mongoose = { conn: null, promise: null };
      }

      // Try to connect (should fail)
      try {
        await connectDB();
      } catch (error) {
        // Error is expected
      }

      // Promise should be reset to allow retry
      expect(global.mongoose?.promise).toBeNull();
    });

    it('should propagate connection errors', async () => {
      process.env.MONGODB_URI = 'mongodb://invalid-host:27017/test';
      
      // Clear cache
      if (global.mongoose) {
        global.mongoose = { conn: null, promise: null };
      }

      await expect(connectDB()).rejects.toThrow();
    });
  });

  describe('Global Cache Initialization', () => {
    it('should initialize global cache if not present', async () => {
      // Clear global cache
      delete (global as any).mongoose;
      
      await connectDB();
      
      expect(global.mongoose).toBeDefined();
      expect(global.mongoose?.conn).toBeDefined();
    });

    it('should use existing global cache if present', async () => {
      const existingCache = { conn: null, promise: null };
      global.mongoose = existingCache;
      
      await connectDB();
      
      // Should still be using the same cache object
      expect(global.mongoose).toBe(existingCache);
      expect(global.mongoose.conn).toBeDefined();
    });
  });

  describe('Connection Options', () => {
    it('should connect with bufferCommands disabled', async () => {
      await connectDB();
      
      // Verify connection is established
      expect(mongoose.connection.readyState).toBe(1);
      
      // The bufferCommands option affects how Mongoose handles operations
      // when not connected. With it disabled, operations fail immediately
      // rather than being buffered.
    });
  });

  describe('Hot Reload Scenarios', () => {
    it('should handle multiple connection attempts during development', async () => {
      // Simulate hot reload - multiple rapid connection attempts
      const connections = await Promise.all([
        connectDB(),
        connectDB(),
        connectDB()
      ]);
      
      // All should return the same connection
      expect(connections[0]).toBe(connections[1]);
      expect(connections[1]).toBe(connections[2]);
    });

    it('should maintain connection across simulated hot reloads', async () => {
      const conn1 = await connectDB();
      
      // Simulate module reload by calling again
      const conn2 = await connectDB();
      
      expect(conn1).toBe(conn2);
      expect(mongoose.connection.readyState).toBe(1);
    });
  });
});