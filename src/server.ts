// File overview: Application entry point that loads environment variables and starts the HTTP server.

// Load variables from .env before other modules read process.env values.
import 'dotenv/config';

import app from './app';
import { getPort } from './utils/getPort';

// Read the server port from PORT, defaulting to 3000 for local development.
const port = getPort(process.env.PORT, 3000);

// Start the HTTP server and listen for incoming requests.
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
