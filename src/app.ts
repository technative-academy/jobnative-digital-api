// File overview: Builds and configures the Express app (middleware, routes, and error pipeline).

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

import adminCompaniesRouter from './routes/adminCompanies';
import authRouter from './routes/auth';
import errorHandler from './middleware/errorHandler';
import notFound from './middleware/notFound';
import companiesRouter from './routes/companies';
import healthRouter from './routes/health';
import jobRolesRouter from './routes/jobRoles';
import technologiesRouter from './routes/technologies';
import userCompanyStatesRouter from './routes/userCompanyStates';
import usersRouter from './routes/users';
import commentsRouter from './routes/comments';

const app = express();

// Parse JSON request bodies so route handlers can read data from req.body.

// Without this middleware, req.body is undefined for JSON requests.
app.use(express.json());
// Enable CORS so browser clients on other origins can call this API.
app.use(cors());
// Add common HTTP security headers.
// Helmet applies safe defaults that reduce exposure to common web attacks.
// Now includes the Cross-Origin-Resource-Policy header with a value of "cross-origin" to allow resources to be loaded by any origin, which is necessary for our API to be accessible from different domains.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
// Log each request in development format to make local debugging easier.
app.use(morgan('dev'));

// Serve interactive API documentation powered by Swagger UI.
// Visit /api-docs in your browser to explore and test your endpoints.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Provide a simple root endpoint so visiting the API URL in a browser
// shows available routes instead of an immediate 404 response.
app.get('/', (_req, res) => {
  res.json({
    message: 'API is running',
    endpoints: {
      health: 'GET /health',
      users: 'GET /api/users',
      createUser: 'POST /api/users',
      getAllCompanies: 'GET /api/companies',
      filterCompanies: 'GET /api/companies?search=&location=&tech=&role=',
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
      getAllAdminCompanies: 'GET /api/admin/companies?status=',
      pendingCompanies: 'GET /api/admin/companies/pending',
      approveCompany: 'PATCH /api/admin/companies/:id/approve',
      rejectCompany: 'PATCH /api/admin/companies/:id/reject',
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      refresh: 'POST /auth/refresh',
      logout: 'POST /auth/logout',
      me: 'GET /auth/me',
      userCompanyStates: 'GET /api/user-company-states',
      userCompanyState: 'GET /api/user-company-states/:companyId',
      upsertUserCompanyState: 'PUT /api/user-company-states/:companyId',
      deleteUserCompanyState: 'DELETE /api/user-company-states/:companyId'
    },
  });
});

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/technologies', technologiesRouter);
app.use('/api/job-roles', jobRolesRouter);
app.use('/api/user-company-states', userCompanyStatesRouter);
app.use('/api/admin/companies', adminCompaniesRouter);
app.use('/api', commentsRouter);

app.use(notFound);
app.use(errorHandler);


export default app;
