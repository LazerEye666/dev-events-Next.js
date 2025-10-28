import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Event, { IEvent } from '../../database/event.model';

let mongoServer: MongoMemoryServer;

// Sample valid event data
const validEventData = {
  title: 'Tech Conference 2024',
  description: 'Annual tech conference covering latest trends in software development',
  overview: 'Join us for a day of learning and networking',
  image: 'https://example.com/images/event.jpg',
  venue: 'Convention Center',
  location: 'San Francisco, CA',
  date: '2024-12-15',
  time: '09:00',
  mode: 'hybrid',
  audience: 'Developers and Tech Enthusiasts',
  agenda: ['Keynote Speech', 'Technical Sessions', 'Networking'],
  organizer: 'Tech Events Inc',
  tags: ['technology', 'conference', 'networking'],
};

describe('Event Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Event.deleteMany({});
  });

  describe('Validation - Happy Paths', () => {
    it('should create a valid event with all required fields', async () => {
      const event = new Event(validEventData);
      const savedEvent = await event.save();

      expect(savedEvent._id).toBeDefined();
      expect(savedEvent.title).toBe(validEventData.title);
      expect(savedEvent.description).toBe(validEventData.description);
      expect(savedEvent.slug).toBe('tech-conference-2024');
      expect(savedEvent.mode).toBe('hybrid');
      expect(savedEvent.createdAt).toBeInstanceOf(Date);
      expect(savedEvent.updatedAt).toBeInstanceOf(Date);
    });

    it('should create event with online mode', async () => {
      const event = new Event({ ...validEventData, mode: 'online' });
      const savedEvent = await event.save();

      expect(savedEvent.mode).toBe('online');
    });

    it('should create event with offline mode', async () => {
      const event = new Event({ ...validEventData, mode: 'offline' });
      const savedEvent = await event.save();

      expect(savedEvent.mode).toBe('offline');
    });

    it('should handle multiple agenda items', async () => {
      const multipleAgenda = [
        'Registration',
        'Opening Ceremony',
        'Session 1',
        'Lunch Break',
        'Session 2',
        'Closing Remarks',
      ];
      const event = new Event({ ...validEventData, agenda: multipleAgenda });
      const savedEvent = await event.save();

      expect(savedEvent.agenda).toEqual(multipleAgenda);
      expect(savedEvent.agenda).toHaveLength(6);
    });

    it('should handle multiple tags', async () => {
      const multipleTags = ['tech', 'ai', 'ml', 'cloud', 'devops'];
      const event = new Event({ ...validEventData, tags: multipleTags });
      const savedEvent = await event.save();

      expect(savedEvent.tags).toEqual(multipleTags);
      expect(savedEvent.tags).toHaveLength(5);
    });
  });

  describe('Validation - Required Fields', () => {
    it('should fail without title', async () => {
      const eventData = { ...validEventData };
      delete (eventData as any).title;
      const event = new Event(eventData);

      await expect(event.save()).rejects.toThrow();
    });

    it('should fail without description', async () => {
      const eventData = { ...validEventData };
      delete (eventData as any).description;
      const event = new Event(eventData);

      await expect(event.save()).rejects.toThrow();
    });

    it('should fail without overview', async () => {
      const eventData = { ...validEventData };
      delete (eventData as any).overview;
      const event = new Event(eventData);

      await expect(event.save()).rejects.toThrow();
    });

    it('should fail without image', async () => {
      const eventData = { ...validEventData };
      delete (eventData as any).image;
      const event = new Event(eventData);

      await expect(event.save()).rejects.toThrow();
    });

    it('should fail without venue', async () => {
      const eventData = { ...validEventData };
      delete (eventData as any).venue;
      const event = new Event(eventData);

      await expect(event.save()).rejects.toThrow();
    });

    it('should fail without location', async () => {
      const eventData = { ...validEventData };
      delete (eventData as any).location;
      const event = new Event(eventData);

      await expect(event.save()).rejects.toThrow();
    });

    it('should fail without date', async () => {
      const eventData = { ...validEventData };
      delete (eventData as any).date;
      const event = new Event(eventData);

      await expect(event.save()).rejects.toThrow();
    });

    it('should fail without time', async () => {
      const eventData = { ...validEventData };
      delete (eventData as any).time;
      const event = new Event(eventData);

      await expect(event.save()).rejects.toThrow();
    });

    it('should fail without mode', async () => {
      const eventData = { ...validEventData };
      delete (eventData as any).mode;
      const event = new Event(eventData);

      await expect(event.save()).rejects.toThrow();
    });

    it('should fail without audience', async () => {
      const eventData = { ...validEventData };
      delete (eventData as any).audience;
      const event = new Event(eventData);

      await expect(event.save()).rejects.toThrow();
    });

    it('should fail without agenda', async () => {
      const eventData = { ...validEventData };
      delete (eventData as any).agenda;
      const event = new Event(eventData);

      await expect(event.save()).rejects.toThrow();
    });

    it('should fail without organizer', async () => {
      const eventData = { ...validEventData };
      delete (eventData as any).organizer;
      const event = new Event(eventData);

      await expect(event.save()).rejects.toThrow();
    });

    it('should fail without tags', async () => {
      const eventData = { ...validEventData };
      delete (eventData as any).tags;
      const event = new Event(eventData);

      await expect(event.save()).rejects.toThrow();
    });
  });

  describe('Validation - Field Constraints', () => {
    it('should fail with title exceeding 100 characters', async () => {
      const longTitle = 'A'.repeat(101);
      const event = new Event({ ...validEventData, title: longTitle });

      await expect(event.save()).rejects.toThrow();
    });

    it('should succeed with title at exactly 100 characters', async () => {
      const maxTitle = 'A'.repeat(100);
      const event = new Event({ ...validEventData, title: maxTitle });
      const savedEvent = await event.save();

      expect(savedEvent.title).toHaveLength(100);
    });

    it('should fail with description exceeding 1000 characters', async () => {
      const longDescription = 'A'.repeat(1001);
      const event = new Event({ ...validEventData, description: longDescription });

      await expect(event.save()).rejects.toThrow();
    });

    it('should succeed with description at exactly 1000 characters', async () => {
      const maxDescription = 'A'.repeat(1000);
      const event = new Event({ ...validEventData, description: maxDescription });
      const savedEvent = await event.save();

      expect(savedEvent.description).toHaveLength(1000);
    });

    it('should fail with overview exceeding 500 characters', async () => {
      const longOverview = 'A'.repeat(501);
      const event = new Event({ ...validEventData, overview: longOverview });

      await expect(event.save()).rejects.toThrow();
    });

    it('should succeed with overview at exactly 500 characters', async () => {
      const maxOverview = 'A'.repeat(500);
      const event = new Event({ ...validEventData, overview: maxOverview });
      const savedEvent = await event.save();

      expect(savedEvent.overview).toHaveLength(500);
    });

    it('should fail with invalid mode', async () => {
      const event = new Event({ ...validEventData, mode: 'invalid-mode' });

      await expect(event.save()).rejects.toThrow(/Mode must be either online, offline, or hybrid/);
    });

    it('should fail with empty agenda array', async () => {
      const event = new Event({ ...validEventData, agenda: [] });

      await expect(event.save()).rejects.toThrow(/At least one agenda item is required/);
    });

    it('should fail with empty tags array', async () => {
      const event = new Event({ ...validEventData, tags: [] });

      await expect(event.save()).rejects.toThrow(/At least one tag is required/);
    });
  });

  describe('Validation - Trimming and Normalization', () => {
    it('should trim whitespace from title', async () => {
      const event = new Event({ ...validEventData, title: '  Trimmed Title  ' });
      const savedEvent = await event.save();

      expect(savedEvent.title).toBe('Trimmed Title');
    });

    it('should trim whitespace from description', async () => {
      const event = new Event({ ...validEventData, description: '  Trimmed Description  ' });
      const savedEvent = await event.save();

      expect(savedEvent.description).toBe('Trimmed Description');
    });

    it('should trim whitespace from overview', async () => {
      const event = new Event({ ...validEventData, overview: '  Trimmed Overview  ' });
      const savedEvent = await event.save();

      expect(savedEvent.overview).toBe('Trimmed Overview');
    });

    it('should trim whitespace from venue', async () => {
      const event = new Event({ ...validEventData, venue: '  Grand Hall  ' });
      const savedEvent = await event.save();

      expect(savedEvent.venue).toBe('Grand Hall');
    });

    it('should trim whitespace from location', async () => {
      const event = new Event({ ...validEventData, location: '  New York, NY  ' });
      const savedEvent = await event.save();

      expect(savedEvent.location).toBe('New York, NY');
    });

    it('should trim whitespace from organizer', async () => {
      const event = new Event({ ...validEventData, organizer: '  Event Org  ' });
      const savedEvent = await event.save();

      expect(savedEvent.organizer).toBe('Event Org');
    });

    it('should trim whitespace from audience', async () => {
      const event = new Event({ ...validEventData, audience: '  Students  ' });
      const savedEvent = await event.save();

      expect(savedEvent.audience).toBe('Students');
    });
  });

  describe('Slug Generation', () => {
    it('should generate slug from title automatically', async () => {
      const event = new Event({ ...validEventData, title: 'My Great Event' });
      const savedEvent = await event.save();

      expect(savedEvent.slug).toBe('my-great-event');
    });

    it('should convert uppercase to lowercase in slug', async () => {
      const event = new Event({ ...validEventData, title: 'UPPERCASE EVENT' });
      const savedEvent = await event.save();

      expect(savedEvent.slug).toBe('uppercase-event');
    });

    it('should replace spaces with hyphens in slug', async () => {
      const event = new Event({ ...validEventData, title: 'Event With Many Spaces' });
      const savedEvent = await event.save();

      expect(savedEvent.slug).toBe('event-with-many-spaces');
    });

    it('should remove special characters from slug', async () => {
      const event = new Event({ ...validEventData, title: 'Event @ #Special! Characters$' });
      const savedEvent = await event.save();

      expect(savedEvent.slug).toBe('event-special-characters');
    });

    it('should handle multiple consecutive spaces in slug', async () => {
      const event = new Event({ ...validEventData, title: 'Event    With    Spaces' });
      const savedEvent = await event.save();

      expect(savedEvent.slug).toBe('event-with-spaces');
    });

    it('should remove leading and trailing hyphens from slug', async () => {
      const event = new Event({ ...validEventData, title: '-Event Title-' });
      const savedEvent = await event.save();

      expect(savedEvent.slug).toBe('event-title');
    });

    it('should handle multiple consecutive hyphens in slug', async () => {
      const event = new Event({ ...validEventData, title: 'Event---Title' });
      const savedEvent = await event.save();

      expect(savedEvent.slug).toBe('event-title');
    });

    it('should update slug when title changes', async () => {
      const event = new Event({ ...validEventData, title: 'Original Title' });
      const savedEvent = await event.save();
      expect(savedEvent.slug).toBe('original-title');

      savedEvent.title = 'Updated Title';
      await savedEvent.save();
      expect(savedEvent.slug).toBe('updated-title');
    });

    it('should enforce unique slug constraint', async () => {
      const event1 = new Event({ ...validEventData, title: 'Unique Event' });
      await event1.save();

      const event2 = new Event({ ...validEventData, title: 'Unique Event' });
      await expect(event2.save()).rejects.toThrow();
    });
  });

  describe('Date Normalization', () => {
    it('should normalize date to ISO format (YYYY-MM-DD)', async () => {
      const event = new Event({ ...validEventData, date: '2024/12/25' });
      const savedEvent = await event.save();

      expect(savedEvent.date).toBe('2024-12-25');
    });

    it('should handle date string with time', async () => {
      const event = new Event({ ...validEventData, date: '2024-12-25T10:30:00Z' });
      const savedEvent = await event.save();

      expect(savedEvent.date).toBe('2024-12-25');
    });

    it('should fail with invalid date format', async () => {
      const event = new Event({ ...validEventData, date: 'not-a-date' });

      await expect(event.save()).rejects.toThrow(/Invalid date format/);
    });

    it('should handle various valid date formats', async () => {
      const event = new Event({ ...validEventData, date: 'December 25, 2024' });
      const savedEvent = await event.save();

      expect(savedEvent.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Time Normalization', () => {
    it('should normalize time to HH:MM format', async () => {
      const event = new Event({ ...validEventData, time: '9:30' });
      const savedEvent = await event.save();

      expect(savedEvent.time).toBe('09:30');
    });

    it('should convert 12-hour AM time to 24-hour format', async () => {
      const event = new Event({ ...validEventData, time: '9:30 AM' });
      const savedEvent = await event.save();

      expect(savedEvent.time).toBe('09:30');
    });

    it('should convert 12-hour PM time to 24-hour format', async () => {
      const event = new Event({ ...validEventData, time: '2:30 PM' });
      const savedEvent = await event.save();

      expect(savedEvent.time).toBe('14:30');
    });

    it('should handle 12:00 PM (noon) correctly', async () => {
      const event = new Event({ ...validEventData, time: '12:00 PM' });
      const savedEvent = await event.save();

      expect(savedEvent.time).toBe('12:00');
    });

    it('should handle 12:00 AM (midnight) correctly', async () => {
      const event = new Event({ ...validEventData, time: '12:00 AM' });
      const savedEvent = await event.save();

      expect(savedEvent.time).toBe('00:00');
    });

    it('should handle 11:59 PM correctly', async () => {
      const event = new Event({ ...validEventData, time: '11:59 PM' });
      const savedEvent = await event.save();

      expect(savedEvent.time).toBe('23:59');
    });

    it('should fail with invalid time format', async () => {
      const event = new Event({ ...validEventData, time: 'invalid-time' });

      await expect(event.save()).rejects.toThrow(/Invalid time format/);
    });

    it('should fail with time hours out of range', async () => {
      const event = new Event({ ...validEventData, time: '25:00' });

      await expect(event.save()).rejects.toThrow(/Invalid time values/);
    });

    it('should fail with time minutes out of range', async () => {
      const event = new Event({ ...validEventData, time: '12:60' });

      await expect(event.save()).rejects.toThrow(/Invalid time values/);
    });

    it('should handle single digit hours and pad with zero', async () => {
      const event = new Event({ ...validEventData, time: '5:45' });
      const savedEvent = await event.save();

      expect(savedEvent.time).toBe('05:45');
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt on creation', async () => {
      const event = new Event(validEventData);
      const savedEvent = await event.save();

      expect(savedEvent.createdAt).toBeInstanceOf(Date);
      expect(savedEvent.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should automatically set updatedAt on creation', async () => {
      const event = new Event(validEventData);
      const savedEvent = await event.save();

      expect(savedEvent.updatedAt).toBeInstanceOf(Date);
      expect(savedEvent.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should update updatedAt on document update', async () => {
      const event = new Event(validEventData);
      const savedEvent = await event.save();
      const originalUpdatedAt = savedEvent.updatedAt;

      // Wait a bit to ensure time difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      savedEvent.description = 'Updated description';
      await savedEvent.save();

      expect(savedEvent.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings after trimming', async () => {
      const event = new Event({ ...validEventData, title: '   ' });

      await expect(event.save()).rejects.toThrow();
    });

    it('should handle agenda with single item', async () => {
      const event = new Event({ ...validEventData, agenda: ['Single Item'] });
      const savedEvent = await event.save();

      expect(savedEvent.agenda).toEqual(['Single Item']);
    });

    it('should handle tags with single item', async () => {
      const event = new Event({ ...validEventData, tags: ['solo-tag'] });
      const savedEvent = await event.save();

      expect(savedEvent.tags).toEqual(['solo-tag']);
    });

    it('should handle special characters in title (allowed in content)', async () => {
      const event = new Event({ ...validEventData, title: 'Event: The Beginning (2024)' });
      const savedEvent = await event.save();

      expect(savedEvent.title).toBe('Event: The Beginning (2024)');
    });

    it('should handle URLs with special characters in image field', async () => {
      const complexUrl = 'https://example.com/images/event-2024.jpg?v=1&size=large';
      const event = new Event({ ...validEventData, image: complexUrl });
      const savedEvent = await event.save();

      expect(savedEvent.image).toBe(complexUrl);
    });
  });

  describe('Index Verification', () => {
    it('should have unique index on slug', async () => {
      const indexes = await Event.collection.getIndexes();
      
      expect(indexes).toHaveProperty('slug_1');
      expect(indexes.slug_1).toContainEqual(['slug', 1]);
    });

    it('should have compound index on date and mode', async () => {
      const indexes = await Event.collection.getIndexes();
      
      // Check if compound index exists
      const hasCompoundIndex = Object.keys(indexes).some(key => 
        key.includes('date') && key.includes('mode')
      );
      
      expect(hasCompoundIndex).toBe(true);
    });
  });
});