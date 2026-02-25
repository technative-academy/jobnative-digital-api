module.exports = {
  transform: {
    '^.+\\.tsx?$': ['@swc/jest']
  },
  testEnvironment: 'node',
  setupFiles: ['dotenv/config']
};
