// File overview: Builds and configures the Express app (middleware, routes, and error pipeline).

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import adminCompaniesRouter from './routes/adminCompanies';
import errorHandler from './middleware/errorHandler';
import notFound from './middleware/notFound';
import companiesRouter from './routes/companies';
import healthRouter from './routes/health';
import jobRolesRouter from './routes/jobRoles';
import technologiesRouter from './routes/technologies';
import usersRouter from './routes/users';

const app = express();

// Parse JSON request bodies so route handlers can read data from req.body.
// Without this middleware, req.body is undefined for JSON requests.
app.use(express.json());
// Enable CORS so browser clients on other origins can call this API.
app.use(cors());
// Add common HTTP security headers.
// Helmet applies safe defaults that reduce exposure to common web attacks.
app.use(helmet());
// Log each request in development format to make local debugging easier.
app.use(morgan('dev'));

// Provide a simple root endpoint so visiting the API URL in a browser
// shows available routes instead of an immediate 404 response.
app.get('/', (_req, res) => {
  res.json({
    message: 'API is running',
    endpoints: {
      health: 'GET /health',
      users: 'GET /api/users',
      createUser: 'POST /api/users',
      companies: 'GET /api/companies?search=&location=&tech=&role=',
      companyById: 'GET /api/companies/:id',
      submitCompany: 'POST /api/companies',
      updateCompany: 'PATCH /api/companies/:id',
      deleteCompany: 'DELETE /api/companies/:id',
      technologies: 'GET /api/technologies',
      updateTechnology: 'PATCH /api/technologies/:id',
      deleteTechnology: 'DELETE /api/technologies/:id',
      jobRoles: 'GET /api/job-roles',
      updateJobRole: 'PATCH /api/job-roles/:id',
      deleteJobRole: 'DELETE /api/job-roles/:id',
      pendingCompanies: 'GET /api/admin/companies/pending',
      approveCompany: 'PATCH /api/admin/companies/:id/approve',
      rejectCompany: 'PATCH /api/admin/companies/:id/reject'
    }
  });
});

app.use('/health', healthRouter);
app.use('/api/users', usersRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/technologies', technologiesRouter);
app.use('/api/job-roles', jobRolesRouter);
app.use('/api/admin/companies', adminCompaniesRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
