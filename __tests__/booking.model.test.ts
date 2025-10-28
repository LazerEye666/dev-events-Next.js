import mongoose from 'mongoose';
import Booking, { IBooking } from '../database/booking.model';
import Event from '../database/event.model';

describe('Booking Model', () => {
  let testEvent: any;

  beforeEach(async () => {
    // Create a test event for booking tests
    testEvent = await Event.create({
      title: 'Test Event',
      description: 'Test Description',
      overview: 'Test Overview',
      image: 'https://example.com/image.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-12-15',
      time: '09:00',
      mode: 'online',
      audience: 'Test Audience',
      agenda: ['Item 1'],
      organizer: 'Test Organizer',
      tags: ['test']
    });
  });

  describe('Schema Validation', () => {
    it('should create a valid booking with required fields', async () => {
      const bookingData = {
        eventId: testEvent._id,
        email: '[email protected]'
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();

      expect(savedBooking._id).toBeDefined();
      expect(savedBooking.eventId.toString()).toBe(testEvent._id.toString());
      expect(savedBooking.email).toBe('[email protected]');
      expect(savedBooking.createdAt).toBeDefined();
      expect(savedBooking.updatedAt).toBeDefined();
    });

    it('should fail validation when eventId is missing', async () => {
      const bookingData = {
        email: '[email protected]'
      };

      const booking = new Booking(bookingData);
      await expect(booking.save()).rejects.toThrow();
    });

    it('should fail validation when email is missing', async () => {
      const bookingData = {
        eventId: testEvent._id
      };

      const booking = new Booking(bookingData);
      await expect(booking.save()).rejects.toThrow();
    });
  });

  describe('Email Validation', () => {
    it('should accept valid email addresses', async () => {
      const validEmails = [
        '[email protected]',
        '[email protected]',
        '[email protected]',
        '[email protected]',
        '[email protected]'
      ];

      for (const email of validEmails) {
        const booking = new Booking({
          eventId: testEvent._id,
          email: email
        });
        const savedBooking = await booking.save();
        expect(savedBooking.email).toBe(email.toLowerCase());
        await Booking.deleteOne({ _id: savedBooking._id });
      }
    });

    it('should convert email to lowercase', async () => {
      const bookingData = {
        eventId: testEvent._id,
        email: 'USER@EXAMPLE.COM'
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();
      expect(savedBooking.email).toBe('user@example.com');
    });

    it('should trim whitespace from email', async () => {
      const bookingData = {
        eventId: testEvent._id,
        email: '  [email protected]  '
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();
      expect(savedBooking.email).toBe('[email protected]');
    });

    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user name@example.com',
        'user@example',
        ''
      ];

      for (const email of invalidEmails) {
        const booking = new Booking({
          eventId: testEvent._id,
          email: email
        });
        await expect(booking.save()).rejects.toThrow();
      }
    });

    it('should accept emails with special characters', async () => {
      const specialEmails = [
        '[email protected]',
        '[email protected]',
        "[email protected]",
        '[email protected]'
      ];

      for (const email of specialEmails) {
        const booking = new Booking({
          eventId: testEvent._id,
          email: email
        });
        const savedBooking = await booking.save();
        expect(savedBooking.email).toBe(email.toLowerCase());
        await Booking.deleteOne({ _id: savedBooking._id });
      }
    });
  });

  describe('Pre-save Hook - Event Existence Validation', () => {
    it('should allow booking creation when event exists', async () => {
      const bookingData = {
        eventId: testEvent._id,
        email: '[email protected]'
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();
      expect(savedBooking._id).toBeDefined();
    });

    it('should reject booking when event does not exist', async () => {
      const nonExistentEventId = new mongoose.Types.ObjectId();
      const bookingData = {
        eventId: nonExistentEventId,
        email: '[email protected]'
      };

      const booking = new Booking(bookingData);
      await expect(booking.save()).rejects.toThrow(/Event with ID .* does not exist/);
    });

    it('should reject booking with invalid event ID format', async () => {
      const bookingData = {
        eventId: 'invalid-id-format',
        email: '[email protected]'
      };

      const booking = new Booking(bookingData as any);
      await expect(booking.save()).rejects.toThrow();
    });

    it('should validate event existence only when eventId is modified', async () => {
      const bookingData = {
        eventId: testEvent._id,
        email: '[email protected]'
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();

      // Modify email (not eventId) and save again
      savedBooking.email = '[email protected]';
      const updatedBooking = await savedBooking.save();
      expect(updatedBooking.email).toBe('[email protected]');
    });

    it('should validate event existence when eventId is changed', async () => {
      const bookingData = {
        eventId: testEvent._id,
        email: '[email protected]'
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();

      // Change to non-existent event
      const nonExistentEventId = new mongoose.Types.ObjectId();
      savedBooking.eventId = nonExistentEventId;
      await expect(savedBooking.save()).rejects.toThrow(/Event with ID .* does not exist/);
    });
  });

  describe('Unique Constraint - One Booking Per Event Per Email', () => {
    it('should allow first booking for an event and email combination', async () => {
      const bookingData = {
        eventId: testEvent._id,
        email: '[email protected]'
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();
      expect(savedBooking._id).toBeDefined();
    });

    it('should prevent duplicate bookings for same event and email', async () => {
      const bookingData = {
        eventId: testEvent._id,
        email: '[email protected]'
      };

      const booking1 = new Booking(bookingData);
      await booking1.save();

      const booking2 = new Booking(bookingData);
      await expect(booking2.save()).rejects.toThrow();
    });

    it('should allow same email to book different events', async () => {
      const event2 = await Event.create({
        title: 'Test Event 2',
        description: 'Test Description 2',
        overview: 'Test Overview 2',
        image: 'https://example.com/image2.jpg',
        venue: 'Test Venue 2',
        location: 'Test Location 2',
        date: '2024-12-16',
        time: '10:00',
        mode: 'offline',
        audience: 'Test Audience 2',
        agenda: ['Item 2'],
        organizer: 'Test Organizer 2',
        tags: ['test2']
      });

      const booking1 = new Booking({
        eventId: testEvent._id,
        email: '[email protected]'
      });
      await booking1.save();

      const booking2 = new Booking({
        eventId: event2._id,
        email: '[email protected]'
      });
      const savedBooking2 = await booking2.save();
      expect(savedBooking2._id).toBeDefined();
    });

    it('should allow different emails to book the same event', async () => {
      const booking1 = new Booking({
        eventId: testEvent._id,
        email: '[email protected]'
      });
      await booking1.save();

      const booking2 = new Booking({
        eventId: testEvent._id,
        email: '[email protected]'
      });
      const savedBooking2 = await booking2.save();
      expect(savedBooking2._id).toBeDefined();
    });
  });

  describe('Indexes', () => {
    it('should create an index on eventId', async () => {
      const indexes = await Booking.collection.getIndexes();
      const eventIdIndex = Object.values(indexes).find((index: any) => 
        index && typeof index === 'object' && 'eventId' in index && index.eventId === 1
      );
      expect(eventIdIndex).toBeDefined();
    });

    it('should create an index on email', async () => {
      const indexes = await Booking.collection.getIndexes();
      const emailIndex = Object.values(indexes).find((index: any) => 
        index && typeof index === 'object' && 'email' in index && index.email === 1
      );
      expect(emailIndex).toBeDefined();
    });

    it('should create a compound index on eventId and createdAt', async () => {
      const indexes = await Booking.collection.getIndexes();
      const compoundIndex = Object.values(indexes).find((index: any) => 
        index && typeof index === 'object' && 'eventId' in index && 'createdAt' in index
      );
      expect(compoundIndex).toBeDefined();
    });

    it('should create a unique compound index on eventId and email', async () => {
      const indexes = await Booking.collection.getIndexes();
      expect(indexes.uniq_event_email).toBeDefined();
    });
  });

  describe('Timestamps', () => {
    it('should automatically generate createdAt and updatedAt timestamps', async () => {
      const bookingData = {
        eventId: testEvent._id,
        email: '[email protected]'
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();
      
      expect(savedBooking.createdAt).toBeDefined();
      expect(savedBooking.updatedAt).toBeDefined();
      expect(savedBooking.createdAt).toBeInstanceOf(Date);
      expect(savedBooking.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt timestamp on modification', async () => {
      const bookingData = {
        eventId: testEvent._id,
        email: '[email protected]'
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();
      const originalUpdatedAt = savedBooking.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedBooking.email = '[email protected]';
      const updatedBooking = await savedBooking.save();

      expect(updatedBooking.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Reference to Event', () => {
    it('should populate event details from eventId reference', async () => {
      const bookingData = {
        eventId: testEvent._id,
        email: '[email protected]'
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();

      const populatedBooking = await Booking.findById(savedBooking._id).populate('eventId');
      expect(populatedBooking?.eventId).toBeDefined();
      const eventData = populatedBooking?.eventId as any;
      expect(eventData.title).toBe('Test Event');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long email addresses', async () => {
      const longLocalPart = 'a'.repeat(64);
      const longEmail = `${longLocalPart}@example.com`;
      
      const bookingData = {
        eventId: testEvent._id,
        email: longEmail
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();
      expect(savedBooking.email).toBe(longEmail);
    });

    it('should handle email with subdomain', async () => {
      const bookingData = {
        eventId: testEvent._id,
        email: '[email protected]'
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();
      expect(savedBooking.email).toBe('[email protected]');
    });

    it('should handle email with numbers', async () => {
      const bookingData = {
        eventId: testEvent._id,
        email: '[email protected]'
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();
      expect(savedBooking.email).toBe('[email protected]');
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      // Create multiple bookings for testing
      await Booking.create([
        { eventId: testEvent._id, email: '[email protected]' },
        { eventId: testEvent._id, email: '[email protected]' },
        { eventId: testEvent._id, email: '[email protected]' }
      ]);
    });

    it('should find all bookings for a specific event', async () => {
      const bookings = await Booking.find({ eventId: testEvent._id });
      expect(bookings).toHaveLength(3);
    });

    it('should find booking by email', async () => {
      const booking = await Booking.findOne({ email: '[email protected]' });
      expect(booking).toBeDefined();
      expect(booking?.email).toBe('[email protected]');
    });

    it('should count bookings for an event', async () => {
      const count = await Booking.countDocuments({ eventId: testEvent._id });
      expect(count).toBe(3);
    });

    it('should sort bookings by creation date', async () => {
      const bookings = await Booking.find({ eventId: testEvent._id }).sort({ createdAt: -1 });
      expect(bookings).toHaveLength(3);
      // Most recent first
      expect(bookings[0].createdAt.getTime()).toBeGreaterThanOrEqual(bookings[1].createdAt.getTime());
    });
  });
});