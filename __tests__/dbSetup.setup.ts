import { execSync } from 'child_process';

beforeAll(() => {
  execSync('node scripts/dbSetup.js', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: 'postgres://sandyboy:postgres@localhost:5432/jobnative_digital_api_test',
    },
  });
});