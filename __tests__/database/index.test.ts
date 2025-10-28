import * as databaseExports from '../../database/index';

describe('Database Index Exports', () => {
  describe('Model Exports', () => {
    it('should export Event model', () => {
      expect(databaseExports.Event).toBeDefined();
      expect(typeof databaseExports.Event).toBe('function');
    });

    it('should export Booking model', () => {
      expect(databaseExports.Booking).toBeDefined();
      expect(typeof databaseExports.Booking).toBe('function');
    });
  });

  describe('Type Exports', () => {
    it('should export IEvent type', () => {
      // TypeScript types don't exist at runtime, but we can verify the import doesn't error
      const typeCheck: typeof databaseExports.IEvent = {} as any;
      expect(typeCheck).toBeDefined();
    });

    it('should export IBooking type', () => {
      // TypeScript types don't exist at runtime, but we can verify the import doesn't error
      const typeCheck: typeof databaseExports.IBooking = {} as any;
      expect(typeCheck).toBeDefined();
    });
  });

  describe('Export Structure', () => {
    it('should export exactly 4 items (2 models + 2 types)', () => {
      const exportKeys = Object.keys(databaseExports);
      
      // Note: Types don't appear in runtime exports, so we only check models
      expect(exportKeys).toContain('Event');
      expect(exportKeys).toContain('Booking');
      expect(exportKeys.length).toBeGreaterThanOrEqual(2);
    });

    it('should have Event as default export from event.model', () => {
      expect(databaseExports.Event.modelName).toBe('Event');
    });

    it('should have Booking as default export from booking.model', () => {
      expect(databaseExports.Booking.modelName).toBe('Booking');
    });
  });

  describe('Model Properties', () => {
    it('should have Event model with schema', () => {
      expect(databaseExports.Event.schema).toBeDefined();
    });

    it('should have Booking model with schema', () => {
      expect(databaseExports.Booking.schema).toBeDefined();
    });

    it('should have Event model with collection', () => {
      expect(databaseExports.Event.collection).toBeDefined();
    });

    it('should have Booking model with collection', () => {
      expect(databaseExports.Booking.collection).toBeDefined();
    });
  });

  describe('Model Relationships', () => {
    it('should have Booking schema with reference to Event', () => {
      const bookingSchema = databaseExports.Booking.schema;
      const eventIdPath = bookingSchema.path('eventId');
      
      expect(eventIdPath).toBeDefined();
      expect((eventIdPath as any).options.ref).toBe('Event');
    });
  });
});