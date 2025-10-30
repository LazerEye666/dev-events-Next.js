import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { connect, connection, Types } from 'mongoose';
import Booking, { IBooking } from './booking.model';
import Event, { IEvent } from './event.model';

// MongoDB Memory Server setup (optional - can use real test DB)
let mongoUri: string;

beforeAll(async () => {
  // Connect to test database
  // Replace with your test MongoDB URI
  mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_db';
  await connect(mongoUri);
});

afterAll(async () => {
  // Cleanup
  await connection.dropDatabase();
  await connection.close();
});

beforeEach(async () => {
  // Clear collections before each test
  await Booking.deleteMany({});
  await Event.deleteMany({});
});

describe('Booking Model Tests', () => {
  describe('Email Validation', () => {
    let testEvent: IEvent;

    beforeEach(async () => {
      // Create a test event for bookings
      testEvent = await Event.create({
        title: 'Test Event',
        description: 'Test Description',
        overview: 'Test Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Test Venue',
        location: 'Test Location',
        date: '2024-12-31',
        time: '14:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Test Organizer',
        tags: ['test'],
      });
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.com',
        'user+tag@example.co.uk',
        'test123@test-domain.com',
        'a@b.c',
      ];

      for (const email of validEmails) {
        const booking = new Booking({
          eventId: testEvent._id,
          email,
        });
        
        await expect(booking.save()).resolves.toBeDefined();
        expect(booking.email).toBe(email.toLowerCase());
      }
    });

    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'invalid.email',
        '@example.com',
        'user@',
        'user @example.com',
        'user@domain',
        '',
        'user@@example.com',
      ];

      for (const email of invalidEmails) {
        const booking = new Booking({
          eventId: testEvent._id,
          email,
        });

        await expect(booking.save()).rejects.toThrow();
      }
    });

    it('should normalize email to lowercase', async () => {
      const booking = await Booking.create({
        eventId: testEvent._id,
        email: 'TEST@EXAMPLE.COM',
      });

      expect(booking.email).toBe('test@example.com');
    });

    it('should trim whitespace from email', async () => {
      const booking = await Booking.create({
        eventId: testEvent._id,
        email: '  test@example.com  ',
      });

      expect(booking.email).toBe('test@example.com');
    });
  });

  describe('Event ID Validation', () => {
    it('should prevent saving with non-existent eventId', async () => {
      const nonExistentId = new Types.ObjectId();
      
      const booking = new Booking({
        eventId: nonExistentId,
        email: 'test@example.com',
      });

      await expect(booking.save()).rejects.toThrow(/does not exist/);
    });

    it('should allow saving with valid eventId', async () => {
      const event = await Event.create({
        title: 'Valid Event',
        description: 'Test Description',
        overview: 'Test Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Test Venue',
        location: 'Test Location',
        date: '2024-12-31',
        time: '14:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Test Organizer',
        tags: ['test'],
      });

      const booking = await Booking.create({
        eventId: event._id,
        email: 'test@example.com',
      });

      expect(booking.eventId.toString()).toBe(event._id.toString());
    });

    it('should reject invalid ObjectId format', async () => {
      const booking = new Booking({
        eventId: 'invalid-id' as any,
        email: 'test@example.com',
      });

      await expect(booking.save()).rejects.toThrow();
    });
  });
});

describe('Event Model Tests', () => {
  describe('Slug Generation', () => {
    it('should generate correct slug from title', async () => {
      const testCases = [
        { title: 'Tech Conference 2024', expectedSlug: 'tech-conference-2024' },
        { title: 'JavaScript Workshop!', expectedSlug: 'javascript-workshop' },
        { title: 'Web Dev   Meet-Up', expectedSlug: 'web-dev-meet-up' },
        { title: 'React@Scale', expectedSlug: 'reactscale' },
        { title: '  Leading Spaces  ', expectedSlug: 'leading-spaces' },
        { title: 'Multiple---Hyphens', expectedSlug: 'multiple-hyphens' },
        { title: 'Special!@#$%Chars&*()', expectedSlug: 'specialchars' },
      ];

      for (const testCase of testCases) {
        const event = await Event.create({
          title: testCase.title,
          description: 'Test Description',
          overview: 'Test Overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2024-12-31',
          time: '14:00',
          mode: 'online',
          audience: 'Everyone',
          agenda: ['Item 1'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        expect(event.slug).toBe(testCase.expectedSlug);
      }
    });

    it('should regenerate slug when title changes', async () => {
      const event = await Event.create({
        title: 'Original Title',
        description: 'Test Description',
        overview: 'Test Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Test Venue',
        location: 'Test Location',
        date: '2024-12-31',
        time: '14:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Test Organizer',
        tags: ['test'],
      });

      expect(event.slug).toBe('original-title');

      event.title = 'Updated Title';
      await event.save();

      expect(event.slug).toBe('updated-title');
    });
  });

  describe('Date Normalization', () => {
    it('should normalize date to ISO format (YYYY-MM-DD)', async () => {
      const dateFormats = [
        { input: '2024-12-31', expected: '2024-12-31' },
        { input: 'December 31, 2024', expected: '2024-12-31' },
        { input: '12/31/2024', expected: '2024-12-31' },
        { input: '2024-01-01T10:30:00.000Z', expected: '2024-01-01' },
      ];

      for (const dateFormat of dateFormats) {
        const event = await Event.create({
          title: `Event ${dateFormat.input}`,
          description: 'Test Description',
          overview: 'Test Overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: dateFormat.input,
          time: '14:00',
          mode: 'online',
          audience: 'Everyone',
          agenda: ['Item 1'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        expect(event.date).toBe(dateFormat.expected);
      }
    });

    it('should throw error for invalid date format', async () => {
      const event = new Event({
        title: 'Test Event',
        description: 'Test Description',
        overview: 'Test Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Test Venue',
        location: 'Test Location',
        date: 'invalid-date',
        time: '14:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Test Organizer',
        tags: ['test'],
      });

      await expect(event.save()).rejects.toThrow(/Invalid date format/);
    });
  });

  describe('Time Normalization', () => {
    it('should normalize time to HH:MM format', async () => {
      const timeFormats = [
        { input: '2:30 PM', expected: '14:30' },
        { input: '02:30 PM', expected: '14:30' },
        { input: '12:00 PM', expected: '12:00' },
        { input: '12:00 AM', expected: '00:00' },
        { input: '1:00 AM', expected: '01:00' },
        { input: '11:59 PM', expected: '23:59' },
        { input: '14:30', expected: '14:30' },
        { input: '9:15', expected: '09:15' },
      ];

      for (const timeFormat of timeFormats) {
        const event = await Event.create({
          title: `Event ${timeFormat.input}`,
          description: 'Test Description',
          overview: 'Test Overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2024-12-31',
          time: timeFormat.input,
          mode: 'online',
          audience: 'Everyone',
          agenda: ['Item 1'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        expect(event.time).toBe(timeFormat.expected);
      }
    });

    it('should throw error for invalid time format', async () => {
      const invalidTimes = [
        'invalid-time',
        '25:00',
        '12:60',
        '12:30:45',
        '',
      ];

      for (const invalidTime of invalidTimes) {
        const event = new Event({
          title: 'Test Event',
          description: 'Test Description',
          overview: 'Test Overview',
          image: 'https://example.com/image.jpg',
          venue: 'Test Venue',
          location: 'Test Location',
          date: '2024-12-31',
          time: invalidTime,
          mode: 'online',
          audience: 'Everyone',
          agenda: ['Item 1'],
          organizer: 'Test Organizer',
          tags: ['test'],
        });

        await expect(event.save()).rejects.toThrow();
      }
    });
  });
});
