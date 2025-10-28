import * as DatabaseIndex from '../database/index';
import Event from '../database/event.model';
import Booking from '../database/booking.model';

describe('Database Index Module', () => {
  describe('Model Exports', () => {
    it('should export Event model', () => {
      expect(DatabaseIndex.Event).toBeDefined();
      expect(DatabaseIndex.Event).toBe(Event);
    });

    it('should export Booking model', () => {
      expect(DatabaseIndex.Booking).toBeDefined();
      expect(DatabaseIndex.Booking).toBe(Booking);
    });
  });

  describe('Type Exports', () => {
    it('should have IEvent type available for import', () => {
      // TypeScript compile-time check - if this compiles, the type is exported
      type TestType = DatabaseIndex.IEvent;
      const testFunc = (event: TestType) => event;
      expect(testFunc).toBeDefined();
    });

    it('should have IBooking type available for import', () => {
      // TypeScript compile-time check - if this compiles, the type is exported
      type TestType = DatabaseIndex.IBooking;
      const testFunc = (booking: TestType) => booking;
      expect(testFunc).toBeDefined();
    });
  });

  describe('Module Structure', () => {
    it('should export all expected members', () => {
      const exports = Object.keys(DatabaseIndex);
      expect(exports).toContain('Event');
      expect(exports).toContain('Booking');
    });

    it('should only export models and types', () => {
      const exports = Object.keys(DatabaseIndex);
      // Should only have Event and Booking as runtime exports
      // Types are compile-time only
      expect(exports.length).toBe(2);
    });
  });

  describe('Integration', () => {
    it('should allow creating Event through exported model', async () => {
      const eventData = {
        title: 'Integration Test Event',
        description: 'Testing exported Event model',
        overview: 'Testing overview',
        image: 'https://example.com/image.jpg',
        venue: 'Test Venue',
        location: 'Test Location',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online' as const,
        audience: 'Testers',
        agenda: ['Test Item'],
        organizer: 'Test Organizer',
        tags: ['test']
      };

      const event = new DatabaseIndex.Event(eventData);
      const savedEvent = await event.save();
      
      expect(savedEvent._id).toBeDefined();
      expect(savedEvent.title).toBe(eventData.title);
    });

    it('should allow creating Booking through exported model', async () => {
      // First create an event
      const event = await DatabaseIndex.Event.create({
        title: 'Booking Test Event',
        description: 'For booking test',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['test']
      });

      const bookingData = {
        eventId: event._id,
        email: '[email protected]'
      };

      const booking = new DatabaseIndex.Booking(bookingData);
      const savedBooking = await booking.save();
      
      expect(savedBooking._id).toBeDefined();
      expect(savedBooking.email).toBe(bookingData.email);
    });
  });
});