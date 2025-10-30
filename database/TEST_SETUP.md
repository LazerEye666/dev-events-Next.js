# Database Model Unit Tests

## Setup Instructions

### 1. Install Testing Dependencies

```bash
npm install --save-dev jest ts-jest @types/jest @jest/globals mongoose
```

### 2. Configure Test Database

Create a `.env.test` file or set environment variable:

```bash
MONGODB_TEST_URI=mongodb://localhost:27017/test_db
```

**Important:** Use a separate test database, not your production database!

### 3. Update package.json Scripts

Add the following test scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The test suite covers:

### Booking Model
- ✅ Email format validation (valid/invalid emails)
- ✅ Email normalization (lowercase, trimming)
- ✅ Event ID validation (non-existent, valid, invalid format)

### Event Model
- ✅ Slug generation from various title formats
- ✅ Slug regeneration on title update
- ✅ Date normalization to ISO format (YYYY-MM-DD)
- ✅ Invalid date handling
- ✅ Time normalization to HH:MM format (24-hour)
- ✅ 12-hour to 24-hour time conversion
- ✅ Invalid time handling

## Optional: MongoDB Memory Server

For faster tests without external MongoDB dependency:

```bash
npm install --save-dev mongodb-memory-server
```

Update test setup in `models.test.ts`:

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await connect(mongoUri);
});

afterAll(async () => {
  await connection.dropDatabase();
  await connection.close();
  await mongoServer.stop();
});
```

## Notes

- Tests use separate database to avoid affecting production data
- Each test clears collections to ensure isolation
- Timeout set to 30 seconds for database operations
- All async operations properly awaited
