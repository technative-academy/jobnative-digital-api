-- File overview: Creates the tables and constraints required by this starter API.

DROP TABLE IF EXISTS company_job_roles CASCADE;
DROP TABLE IF EXISTS company_technologies CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS job_roles CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS company_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL CHECK (btrim(name) <> ''),
  email TEXT UNIQUE
);

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL CHECK (btrim(name) <> ''),
  website TEXT NOT NULL UNIQUE CHECK (btrim(website) <> ''),
  linkedin TEXT UNIQUE CHECK (linkedin IS NULL OR btrim(linkedin) <> ''),
  industry TEXT,
  location TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ
);

CREATE TABLE technologies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (btrim(name) <> ''),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:[-.][a-z0-9]+)*$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE company_technologies (
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  technology_id INTEGER NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (company_id, technology_id)
);

CREATE TABLE job_roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (btrim(name) <> ''),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:[-.][a-z0-9]+)*$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE company_job_roles (
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_role_id INTEGER NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (company_id, job_role_id)
);

CREATE INDEX companies_status_idx ON companies (status);
CREATE INDEX companies_name_idx ON companies ((lower(name)));
CREATE INDEX companies_location_idx ON companies ((lower(location)));
CREATE INDEX company_technologies_technology_idx ON company_technologies (technology_id);
CREATE INDEX company_job_roles_role_idx ON company_job_roles (job_role_id);
