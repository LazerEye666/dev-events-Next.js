import mongoose from 'mongoose';
import Event, { IEvent } from '../database/event.model';

describe('Event Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid event with all required fields', async () => {
      const eventData = {
        title: 'Tech Conference 2024',
        description: 'A comprehensive technology conference covering the latest trends in software development.',
        overview: 'Join us for a day of learning and networking with industry experts.',
        image: 'https://example.com/image.jpg',
        venue: 'Tech Center',
        location: 'San Francisco, CA',
        date: '2024-12-15',
        time: '09:00',
        mode: 'hybrid',
        audience: 'Developers and Tech Enthusiasts',
        agenda: ['Registration', 'Keynote', 'Lunch', 'Workshops', 'Closing'],
        organizer: 'Tech Events Inc.',
        tags: ['technology', 'conference', 'networking']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();

      expect(savedEvent._id).toBeDefined();
      expect(savedEvent.title).toBe(eventData.title);
      expect(savedEvent.description).toBe(eventData.description);
      expect(savedEvent.slug).toBeDefined();
      expect(savedEvent.createdAt).toBeDefined();
      expect(savedEvent.updatedAt).toBeDefined();
    });

    it('should fail validation when title is missing', async () => {
      const eventData = {
        description: 'Description here',
        overview: 'Overview here',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow();
    });

    it('should fail validation when description is missing', async () => {
      const eventData = {
        title: 'Event Title',
        overview: 'Overview here',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow();
    });

    it('should fail validation when overview is missing', async () => {
      const eventData = {
        title: 'Event Title',
        description: 'Description here',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow();
    });

    it('should fail validation when title exceeds 100 characters', async () => {
      const longTitle = 'A'.repeat(101);
      const eventData = {
        title: longTitle,
        description: 'Description here',
        overview: 'Overview here',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow();
    });

    it('should fail validation when description exceeds 1000 characters', async () => {
      const longDescription = 'A'.repeat(1001);
      const eventData = {
        title: 'Event Title',
        description: longDescription,
        overview: 'Overview here',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow();
    });

    it('should fail validation when overview exceeds 500 characters', async () => {
      const longOverview = 'A'.repeat(501);
      const eventData = {
        title: 'Event Title',
        description: 'Description here',
        overview: longOverview,
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow();
    });
  });

  describe('Mode Field Validation', () => {
    it('should accept "online" as a valid mode', async () => {
      const eventData = {
        title: 'Online Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Virtual',
        location: 'Online',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.mode).toBe('online');
    });

    it('should accept "offline" as a valid mode', async () => {
      const eventData = {
        title: 'Offline Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Conference Hall',
        location: 'New York',
        date: '2024-12-15',
        time: '09:00',
        mode: 'offline',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.mode).toBe('offline');
    });

    it('should accept "hybrid" as a valid mode', async () => {
      const eventData = {
        title: 'Hybrid Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Conference Center',
        location: 'Boston',
        date: '2024-12-15',
        time: '09:00',
        mode: 'hybrid',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.mode).toBe('hybrid');
    });

    it('should reject invalid mode values', async () => {
      const eventData = {
        title: 'Invalid Mode Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '09:00',
        mode: 'invalid-mode',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow();
    });
  });

  describe('Agenda Validation', () => {
    it('should accept an agenda with multiple items', async () => {
      const eventData = {
        title: 'Event with Agenda',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Registration', 'Welcome Speech', 'Panel Discussion', 'Q&A', 'Closing'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.agenda).toHaveLength(5);
      expect(savedEvent.agenda).toContain('Registration');
    });

    it('should fail validation when agenda is empty', async () => {
      const eventData = {
        title: 'Event with Empty Agenda',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: [],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow();
    });

    it('should fail validation when agenda is missing', async () => {
      const eventData = {
        title: 'Event without Agenda',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow();
    });
  });

  describe('Tags Validation', () => {
    it('should accept tags with multiple items', async () => {
      const eventData = {
        title: 'Event with Tags',
        description: 'Description',
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
        tags: ['technology', 'innovation', 'networking']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.tags).toHaveLength(3);
      expect(savedEvent.tags).toContain('technology');
    });

    it('should fail validation when tags array is empty', async () => {
      const eventData = {
        title: 'Event with Empty Tags',
        description: 'Description',
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
        tags: []
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow();
    });

    it('should fail validation when tags are missing', async () => {
      const eventData = {
        title: 'Event without Tags',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer'
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow();
    });
  });

  describe('Slug Generation', () => {
    it('should generate a slug from title on creation', async () => {
      const eventData = {
        title: 'Tech Conference 2024',
        description: 'Description',
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
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.slug).toBe('tech-conference-2024');
    });

    it('should remove special characters from slug', async () => {
      const eventData = {
        title: 'Tech @ Conference! 2024 #Special',
        description: 'Description',
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
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.slug).toBe('tech-conference-2024-special');
    });

    it('should handle multiple consecutive spaces in title', async () => {
      const eventData = {
        title: 'Tech    Conference   2024',
        description: 'Description',
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
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.slug).toBe('tech-conference-2024');
    });

    it('should trim leading and trailing spaces from title', async () => {
      const eventData = {
        title: '  Tech Conference 2024  ',
        description: 'Description',
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
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.slug).toBe('tech-conference-2024');
    });

    it('should convert uppercase letters to lowercase in slug', async () => {
      const eventData = {
        title: 'TECH CONFERENCE 2024',
        description: 'Description',
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
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.slug).toBe('tech-conference-2024');
    });

    it('should regenerate slug when title is modified', async () => {
      const eventData = {
        title: 'Original Title',
        description: 'Description',
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
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.slug).toBe('original-title');

      savedEvent.title = 'Updated Title';
      const updatedEvent = await savedEvent.save();
      expect(updatedEvent.slug).toBe('updated-title');
    });

    it('should enforce unique slug constraint', async () => {
      const eventData1 = {
        title: 'Tech Conference',
        description: 'Description',
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
        tags: ['tag1']
      };

      const eventData2 = {
        title: 'Tech Conference',
        description: 'Different Description',
        overview: 'Different Overview',
        image: 'https://example.com/image2.jpg',
        venue: 'Different Venue',
        location: 'Different Location',
        date: '2024-12-16',
        time: '10:00',
        mode: 'offline',
        audience: 'Different Audience',
        agenda: ['Item 2'],
        organizer: 'Different Organizer',
        tags: ['tag2']
      };

      const event1 = new Event(eventData1);
      await event1.save();

      const event2 = new Event(eventData2);
      await expect(event2.save()).rejects.toThrow();
    });
  });

  describe('Date Normalization', () => {
    it('should normalize date to ISO format (YYYY-MM-DD)', async () => {
      const eventData = {
        title: 'Date Test Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: 'December 15, 2024',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle various date string formats', async () => {
      const eventData = {
        title: 'Date Format Test',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15T10:30:00Z',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.date).toBe('2024-12-15');
    });

    it('should throw error for invalid date format', async () => {
      const eventData = {
        title: 'Invalid Date Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: 'invalid-date-string',
        time: '09:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow('Invalid date format');
    });
  });

  describe('Time Normalization', () => {
    it('should normalize time to HH:MM format (24-hour)', async () => {
      const eventData = {
        title: 'Time Test Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '9:30',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.time).toBe('09:30');
    });

    it('should convert 12-hour AM format to 24-hour format', async () => {
      const eventData = {
        title: 'AM Time Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '9:30 AM',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.time).toBe('09:30');
    });

    it('should convert 12-hour PM format to 24-hour format', async () => {
      const eventData = {
        title: 'PM Time Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '3:45 PM',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.time).toBe('15:45');
    });

    it('should handle 12:00 PM (noon) correctly', async () => {
      const eventData = {
        title: 'Noon Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '12:00 PM',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.time).toBe('12:00');
    });

    it('should handle 12:00 AM (midnight) correctly', async () => {
      const eventData = {
        title: 'Midnight Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '12:00 AM',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      expect(savedEvent.time).toBe('00:00');
    });

    it('should throw error for invalid time format', async () => {
      const eventData = {
        title: 'Invalid Time Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: 'invalid-time',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow('Invalid time format');
    });

    it('should throw error for hours out of range', async () => {
      const eventData = {
        title: 'Invalid Hours Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '25:00',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow('Invalid time values');
    });

    it('should throw error for minutes out of range', async () => {
      const eventData = {
        title: 'Invalid Minutes Event',
        description: 'Description',
        overview: 'Overview',
        image: 'https://example.com/image.jpg',
        venue: 'Venue',
        location: 'Location',
        date: '2024-12-15',
        time: '10:99',
        mode: 'online',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Organizer',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      await expect(event.save()).rejects.toThrow('Invalid time values');
    });
  });

  describe('Field Trimming', () => {
    it('should trim whitespace from string fields', async () => {
      const eventData = {
        title: '  Tech Conference  ',
        description: '  Description with spaces  ',
        overview: '  Overview with spaces  ',
        image: '  https://example.com/image.jpg  ',
        venue: '  Tech Center  ',
        location: '  San Francisco  ',
        date: '2024-12-15',
        time: '09:00',
        mode: 'online',
        audience: '  Developers  ',
        agenda: ['Item 1'],
        organizer: '  Tech Events Inc.  ',
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      
      expect(savedEvent.title).toBe('Tech Conference');
      expect(savedEvent.description).toBe('Description with spaces');
      expect(savedEvent.overview).toBe('Overview with spaces');
      expect(savedEvent.image).toBe('https://example.com/image.jpg');
      expect(savedEvent.venue).toBe('Tech Center');
      expect(savedEvent.location).toBe('San Francisco');
      expect(savedEvent.audience).toBe('Developers');
      expect(savedEvent.organizer).toBe('Tech Events Inc.');
    });
  });

  describe('Timestamps', () => {
    it('should automatically generate createdAt and updatedAt timestamps', async () => {
      const eventData = {
        title: 'Timestamp Test Event',
        description: 'Description',
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
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      
      expect(savedEvent.createdAt).toBeDefined();
      expect(savedEvent.updatedAt).toBeDefined();
      expect(savedEvent.createdAt).toBeInstanceOf(Date);
      expect(savedEvent.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt timestamp on modification', async () => {
      const eventData = {
        title: 'Update Test Event',
        description: 'Description',
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
        tags: ['tag1']
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();
      const originalUpdatedAt = savedEvent.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedEvent.description = 'Updated Description';
      const updatedEvent = await savedEvent.save();

      expect(updatedEvent.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Indexes', () => {
    it('should create an index on slug field', async () => {
      const indexes = await Event.collection.getIndexes();
      const slugIndex = Object.values(indexes).find((index: any) => 
        index && typeof index === 'object' && 'slug' in index && index.slug === 1
      );
      expect(slugIndex).toBeDefined();
    });

    it('should create a compound index on date and mode', async () => {
      const indexes = await Event.collection.getIndexes();
      const compoundIndex = Object.values(indexes).find((index: any) => 
        index && typeof index === 'object' && 'date' in index && 'mode' in index
      );
      expect(compoundIndex).toBeDefined();
    });
  });
});