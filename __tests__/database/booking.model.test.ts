import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Booking, { IBooking } from '../../database/booking.model';
import Event, { IEvent } from '../../database/event.model';

let mongoServer: MongoMemoryServer;
let testEvent: IEvent;

const validBookingData = {
  eventId: new mongoose.Types.ObjectId(),
  email: 'test@example.com',
};

const validEventData = {
  title: 'Test Event',
  description: 'Test event description',
  overview: 'Test overview',
  image: 'https://example.com/image.jpg',
  venue: 'Test Venue',
  location: 'Test Location',
  date: '2024-12-15',
  time: '10:00',
  mode: 'online',
  audience: 'Everyone',
  agenda: ['Item 1'],
  organizer: 'Test Organizer',
  tags: ['test'],
};

describe('Booking Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Create a test event for bookings
    const event = new Event(validEventData);
    testEvent = await event.save();
  });

  afterEach(async () => {
    await Booking.deleteMany({});
    await Event.deleteMany({});
  });

  describe('Validation - Happy Paths', () => {
    it('should create a valid booking with all required fields', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'user@example.com',
      });
      const savedBooking = await booking.save();

      expect(savedBooking._id).toBeDefined();
      expect(savedBooking.eventId.toString()).toBe(testEvent._id.toString());
      expect(savedBooking.email).toBe('user@example.com');
      expect(savedBooking.createdAt).toBeInstanceOf(Date);
      expect(savedBooking.updatedAt).toBeInstanceOf(Date);
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
        '123@example.com',
      ];

      for (const email of validEmails) {
        const booking = new Booking({
          eventId: testEvent._id,
          email,
        });
        const savedBooking = await booking.save();
        expect(savedBooking.email).toBe(email.toLowerCase());
        
        // Clean up for unique constraint
        await Booking.deleteOne({ _id: savedBooking._id });
      }
    });
  });

  describe('Validation - Required Fields', () => {
    it('should fail without eventId', async () => {
      const bookingData = { email: 'test@example.com' };
      const booking = new Booking(bookingData);

      await expect(booking.save()).rejects.toThrow(/Event ID is required/);
    });

    it('should fail without email', async () => {
      const bookingData = { eventId: testEvent._id };
      const booking = new Booking(bookingData);

      await expect(booking.save()).rejects.toThrow(/Email is required/);
    });
  });

  describe('Email Validation', () => {
    it('should reject invalid email format - no @ symbol', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'invalid-email',
      });

      await expect(booking.save()).rejects.toThrow(/Please provide a valid email address/);
    });

    it('should reject invalid email format - no domain', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'test@',
      });

      await expect(booking.save()).rejects.toThrow(/Please provide a valid email address/);
    });

    it('should reject invalid email format - no local part', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: '@example.com',
      });

      await expect(booking.save()).rejects.toThrow(/Please provide a valid email address/);
    });

    it('should reject invalid email format - spaces', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'test user@example.com',
      });

      await expect(booking.save()).rejects.toThrow(/Please provide a valid email address/);
    });

    it('should reject invalid email format - invalid characters', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'test<>@example.com',
      });

      await expect(booking.save()).rejects.toThrow(/Please provide a valid email address/);
    });

    it('should reject empty email', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: '',
      });

      await expect(booking.save()).rejects.toThrow();
    });
  });

  describe('Email Normalization', () => {
    it('should convert email to lowercase', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'TEST@EXAMPLE.COM',
      });
      const savedBooking = await booking.save();

      expect(savedBooking.email).toBe('test@example.com');
    });

    it('should convert mixed case email to lowercase', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'Test.User@Example.Com',
      });
      const savedBooking = await booking.save();

      expect(savedBooking.email).toBe('test.user@example.com');
    });

    it('should trim whitespace from email', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: '  test@example.com  ',
      });
      const savedBooking = await booking.save();

      expect(savedBooking.email).toBe('test@example.com');
    });

    it('should trim and lowercase email', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: '  TEST@EXAMPLE.COM  ',
      });
      const savedBooking = await booking.save();

      expect(savedBooking.email).toBe('test@example.com');
    });
  });

  describe('Event Reference Validation', () => {
    it('should fail when referenced event does not exist', async () => {
      const nonExistentEventId = new mongoose.Types.ObjectId();
      const booking = new Booking({
        eventId: nonExistentEventId,
        email: 'test@example.com',
      });

      await expect(booking.save()).rejects.toThrow(/does not exist/);
    });

    it('should fail with invalid ObjectId format', async () => {
      const booking = new Booking({
        eventId: 'invalid-id' as any,
        email: 'test@example.com',
      });

      await expect(booking.save()).rejects.toThrow();
    });

    it('should validate eventId on creation', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();

      expect(savedBooking.eventId.toString()).toBe(testEvent._id.toString());
    });

    it('should validate eventId when modified', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'test@example.com',
      });
      await booking.save();

      const nonExistentEventId = new mongoose.Types.ObjectId();
      booking.eventId = nonExistentEventId;

      await expect(booking.save()).rejects.toThrow(/does not exist/);
    });

    it('should not validate eventId when not modified', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();

      // Update email only
      savedBooking.email = 'newemail@example.com';
      
      // Delete the event
      await Event.deleteOne({ _id: testEvent._id });
      
      // Should still save since eventId wasn't modified
      await expect(savedBooking.save()).resolves.toBeDefined();
    });
  });

  describe('Unique Constraint - Event and Email', () => {
    it('should enforce unique booking per event per email', async () => {
      const booking1 = new Booking({
        eventId: testEvent._id,
        email: 'test@example.com',
      });
      await booking1.save();

      const booking2 = new Booking({
        eventId: testEvent._id,
        email: 'test@example.com',
      });

      await expect(booking2.save()).rejects.toThrow();
    });

    it('should allow same email for different events', async () => {
      const event2 = new Event({ ...validEventData, title: 'Another Event' });
      const savedEvent2 = await event2.save();

      const booking1 = new Booking({
        eventId: testEvent._id,
        email: 'test@example.com',
      });
      await booking1.save();

      const booking2 = new Booking({
        eventId: savedEvent2._id,
        email: 'test@example.com',
      });
      const savedBooking2 = await booking2.save();

      expect(savedBooking2._id).toBeDefined();
    });

    it('should allow different emails for same event', async () => {
      const booking1 = new Booking({
        eventId: testEvent._id,
        email: 'user1@example.com',
      });
      await booking1.save();

      const booking2 = new Booking({
        eventId: testEvent._id,
        email: 'user2@example.com',
      });
      const savedBooking2 = await booking2.save();

      expect(savedBooking2._id).toBeDefined();
    });

    it('should treat case-insensitive emails as duplicates', async () => {
      const booking1 = new Booking({
        eventId: testEvent._id,
        email: 'test@example.com',
      });
      await booking1.save();

      const booking2 = new Booking({
        eventId: testEvent._id,
        email: 'TEST@EXAMPLE.COM',
      });

      await expect(booking2.save()).rejects.toThrow();
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt on creation', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();

      expect(savedBooking.createdAt).toBeInstanceOf(Date);
      expect(savedBooking.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should automatically set updatedAt on creation', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();

      expect(savedBooking.updatedAt).toBeInstanceOf(Date);
      expect(savedBooking.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should update updatedAt on document update', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();
      const originalUpdatedAt = savedBooking.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      savedBooking.email = 'updated@example.com';
      await savedBooking.save();

      expect(savedBooking.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not change createdAt on update', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();
      const originalCreatedAt = savedBooking.createdAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      savedBooking.email = 'updated@example.com';
      await savedBooking.save();

      expect(savedBooking.createdAt.getTime()).toBe(originalCreatedAt.getTime());
    });
  });

  describe('Index Verification', () => {
    it('should have index on eventId', async () => {
      const indexes = await Booking.collection.getIndexes();
      
      expect(indexes).toHaveProperty('eventId_1');
    });

    it('should have index on email', async () => {
      const indexes = await Booking.collection.getIndexes();
      
      expect(indexes).toHaveProperty('email_1');
    });

    it('should have compound index on eventId and createdAt', async () => {
      const indexes = await Booking.collection.getIndexes();
      
      const hasCompoundIndex = Object.keys(indexes).some(key => 
        key.includes('eventId') && key.includes('createdAt')
      );
      
      expect(hasCompoundIndex).toBe(true);
    });

    it('should have unique compound index on eventId and email', async () => {
      const indexes = await Booking.collection.getIndexes();
      
      expect(indexes).toHaveProperty('uniq_event_email');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long email addresses', async () => {
      const longEmail = 'verylongemailaddress' + 'a'.repeat(50) + '@example.com';
      const booking = new Booking({
        eventId: testEvent._id,
        email: longEmail,
      });
      const savedBooking = await booking.save();

      expect(savedBooking.email).toBe(longEmail.toLowerCase());
    });

    it('should handle email with multiple subdomains', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'user@mail.subdomain.example.com',
      });
      const savedBooking = await booking.save();

      expect(savedBooking.email).toBe('user@mail.subdomain.example.com');
    });

    it('should handle email with numbers', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'user123@example456.com',
      });
      const savedBooking = await booking.save();

      expect(savedBooking.email).toBe('user123@example456.com');
    });

    it('should handle email with special allowed characters', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'user.name+tag@example.com',
      });
      const savedBooking = await booking.save();

      expect(savedBooking.email).toBe('user.name+tag@example.com');
    });
  });

  describe('Query Operations', () => {
    it('should find bookings by eventId', async () => {
      await new Booking({ eventId: testEvent._id, email: 'user1@example.com' }).save();
      await new Booking({ eventId: testEvent._id, email: 'user2@example.com' }).save();

      const bookings = await Booking.find({ eventId: testEvent._id });

      expect(bookings).toHaveLength(2);
    });

    it('should find bookings by email', async () => {
      const event2 = new Event({ ...validEventData, title: 'Event 2' });
      await event2.save();

      await new Booking({ eventId: testEvent._id, email: 'user@example.com' }).save();
      await new Booking({ eventId: event2._id, email: 'user@example.com' }).save();

      const bookings = await Booking.find({ email: 'user@example.com' });

      expect(bookings).toHaveLength(2);
    });

    it('should populate event details', async () => {
      const booking = new Booking({
        eventId: testEvent._id,
        email: 'user@example.com',
      });
      await booking.save();

      const populatedBooking = await Booking.findById(booking._id).populate('eventId');

      expect(populatedBooking?.eventId).toBeDefined();
      expect((populatedBooking?.eventId as any).title).toBe('Test Event');
    });
  });
});