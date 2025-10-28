# Test Suite for Database Models and MongoDB Connection

This directory contains comprehensive unit tests for the database models and MongoDB connection utility.

## Test Files

- `setup.ts` - Test environment setup with MongoDB Memory Server
- `event.model.test.ts` - Tests for Event model (validation, slug generation, date/time normalization)
- `booking.model.test.ts` - Tests for Booking model (validation, email validation, unique constraints)
- `mongodb.test.ts` - Tests for MongoDB connection utility (caching, error handling)
- `database.index.test.ts` - Tests for database index exports

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test event.model.test.ts
```

## Test Coverage

The test suite covers:
- ✅ Schema validation (required fields, field types, constraints)
- ✅ Custom validators (email format, enum values, array length)
- ✅ Pre-save hooks (slug generation, date/time normalization, event existence)
- ✅ Field transformations (trimming, lowercase conversion)
- ✅ Unique constraints and indexes
- ✅ Timestamps (createdAt, updatedAt)
- ✅ References and population
- ✅ Edge cases and error conditions
- ✅ Connection caching and error recovery
- ✅ Environment variable validation

## Dependencies

- **jest** - Testing framework
- **ts-jest** - TypeScript support for Jest
- **mongodb-memory-server** - In-memory MongoDB for isolated testing
- **@types/jest** - TypeScript definitions for Jest

These dependencies allow for:
- Fast, isolated tests without external database dependencies
- Proper TypeScript type checking in tests
- Easy CI/CD integration
- Parallel test execution