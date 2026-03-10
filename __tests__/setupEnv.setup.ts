process.env.NODE_ENV = 'test';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/jobnative_digital_api_test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/jobnative_digital_api_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';