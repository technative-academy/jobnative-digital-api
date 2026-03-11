import { execSync } from 'child_process';

export default function globalSetup() {
  execSync('node scripts/dbSetup.js', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: 'postgres://sandyboy:postgres@localhost:5432/jobnative_digital_api_test',
    },
  });
}