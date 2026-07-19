// E2E Test Configuration Example
// Copy this file to test-config.ts and update with your test credentials

export const testConfig = {
  // Admin credentials (from README.md demo admin)
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@cornia.co',
    password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!',
  },

  // Student credentials (create a test student account)
  student: {
    email: process.env.TEST_STUDENT_EMAIL || 'student@example.com',
    password: process.env.TEST_STUDENT_PASSWORD || 'password123',
  },

  // Base URL for tests
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',

  // Database configuration for test database
  database: {
    url:
      process.env.TEST_DATABASE_URL ||
      'postgres://user:password@localhost:5432/test_db',
  },

  // Better Auth secret for testing
  authSecret:
    process.env.TEST_AUTH_SECRET || 'test_secret_key_for_testing_purposes',
}
