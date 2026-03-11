-- File overview: Inserts starter rows so the API has sample data on first run.

-- password_hash is bcrypt of 'password123' for all seed users
INSERT INTO users (name, email, password_hash, role)
VALUES
  ('Ada Lovelace', 'ada@example.com', '$2b$10$dummyHashForSeedDataOnly000000000000000000000000000000', 'admin'),
  ('Grace Hopper', 'grace@example.com', '$2b$10$dummyHashForSeedDataOnly000000000000000000000000000001', 'user'),
  ('Margaret Hamilton', 'margaret@example.com', '$2b$10$dummyHashForSeedDataOnly000000000000000000000000000002', 'user');

INSERT INTO companies (
  name,
  website,
  linkedin,
  industry,
  location,
  description,
  status,
  created_by_user_id,
  approved_by_user_id,
  approved_at
)
VALUES
  (
    'DabApps',
    'https://dabapps.com',
    'https://www.linkedin.com/company/dabapps/posts/?feedView=all',
    'Web and app agency',
    'Brighton',
    'Web and app agency.',
    'approved',
    1,
    2,
    NOW()
  ),
  (
    'StoryStream',
    'https://storystream.ai',
    'https://www.linkedin.com/company/storystream/about/',
    'Software Development',
    'London / Brighton',
    'Software development company.',
    'approved',
    1,
    2,
    NOW()
  ),
  (
    'Dapper Labs Limited',
    'https://wearechaperone.com',
    'https://www.linkedin.com/company/dapper-labs-ltd/',
    'Software Development',
    'Brighton',
    'Software development company.',
    'approved',
    2,
    1,
    NOW()
  );

INSERT INTO events (
  name,
  website,
  location,
  start_time,
  end_time,
  description,
  status,
  created_by_user_id,
  approved_by_user_id,
  approved_at
)
VALUES
  (
    'Brighton Tech Meetup',
    'https://brighton-tech-meetup.example.com',
    'Brighton',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days 2 hours',
    'Monthly meetup focused on modern web development and cloud infrastructure.',
    'approved',
    1,
    2,
    NOW()
  ),
  (
    'AI Product Showcase',
    'https://ai-product-showcase.example.com',
    'London',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '30 days 3 hours',
    'Demo day for AI-driven products and developer tooling.',
    'approved',
    2,
    1,
    NOW()
  ),
  (
    'Full Stack Hiring Sprint',
    'https://full-stack-hiring.example.com',
    'London / Brighton',
    NOW() + INTERVAL '45 days',
    NOW() + INTERVAL '45 days 4 hours',
    'Fast-paced hiring event with lightning talks from sponsoring companies.',
    'approved',
    3,
    2,
    NOW()
  );

INSERT INTO technologies (name, slug)
VALUES
  ('Python', 'python'),
  ('Django', 'django'),
  ('React', 'react'),
  ('AWS', 'aws'),
  ('Node.js', 'node.js'),
  ('TypeScript', 'typescript');

INSERT INTO company_technologies (company_id, technology_id)
VALUES
  (
    (SELECT id FROM companies WHERE name = 'DabApps'),
    (SELECT id FROM technologies WHERE slug = 'python')
  ),
  (
    (SELECT id FROM companies WHERE name = 'DabApps'),
    (SELECT id FROM technologies WHERE slug = 'django')
  ),
  (
    (SELECT id FROM companies WHERE name = 'DabApps'),
    (SELECT id FROM technologies WHERE slug = 'react')
  ),
  (
    (SELECT id FROM companies WHERE name = 'StoryStream'),
    (SELECT id FROM technologies WHERE slug = 'react')
  ),
  (
    (SELECT id FROM companies WHERE name = 'StoryStream'),
    (SELECT id FROM technologies WHERE slug = 'python')
  ),
  (
    (SELECT id FROM companies WHERE name = 'StoryStream'),
    (SELECT id FROM technologies WHERE slug = 'aws')
  ),
  (
    (SELECT id FROM companies WHERE name = 'Dapper Labs Limited'),
    (SELECT id FROM technologies WHERE slug = 'node.js')
  ),
  (
    (SELECT id FROM companies WHERE name = 'Dapper Labs Limited'),
    (SELECT id FROM technologies WHERE slug = 'typescript')
  );

INSERT INTO event_technologies (event_id, technology_id)
VALUES
  (
    (SELECT id FROM events WHERE name = 'Brighton Tech Meetup'),
    (SELECT id FROM technologies WHERE slug = 'react')
  ),
  (
    (SELECT id FROM events WHERE name = 'Brighton Tech Meetup'),
    (SELECT id FROM technologies WHERE slug = 'aws')
  ),
  (
    (SELECT id FROM events WHERE name = 'AI Product Showcase'),
    (SELECT id FROM technologies WHERE slug = 'python')
  ),
  (
    (SELECT id FROM events WHERE name = 'AI Product Showcase'),
    (SELECT id FROM technologies WHERE slug = 'django')
  ),
  (
    (SELECT id FROM events WHERE name = 'Full Stack Hiring Sprint'),
    (SELECT id FROM technologies WHERE slug = 'node.js')
  ),
  (
    (SELECT id FROM events WHERE name = 'Full Stack Hiring Sprint'),
    (SELECT id FROM technologies WHERE slug = 'typescript')
  );

INSERT INTO event_sponsors (event_id, company_id)
VALUES
  (
    (SELECT id FROM events WHERE name = 'Brighton Tech Meetup'),
    (SELECT id FROM companies WHERE name = 'DabApps')
  ),
  (
    (SELECT id FROM events WHERE name = 'AI Product Showcase'),
    (SELECT id FROM companies WHERE name = 'StoryStream')
  ),
  (
    (SELECT id FROM events WHERE name = 'Full Stack Hiring Sprint'),
    (SELECT id FROM companies WHERE name = 'Dapper Labs Limited')
  );

INSERT INTO job_roles (name, slug)
VALUES
  ('Software Engineer', 'software-engineer'),
  ('Frontend Developer', 'frontend-developer'),
  ('Backend Developer', 'backend-developer'),
  ('Data Engineer', 'data-engineer'),
  ('Full Stack Developer', 'full-stack-developer');

INSERT INTO company_job_roles (company_id, job_role_id)
VALUES
  (
    (SELECT id FROM companies WHERE name = 'DabApps'),
    (SELECT id FROM job_roles WHERE slug = 'software-engineer')
  ),
  (
    (SELECT id FROM companies WHERE name = 'DabApps'),
    (SELECT id FROM job_roles WHERE slug = 'frontend-developer')
  ),
  (
    (SELECT id FROM companies WHERE name = 'StoryStream'),
    (SELECT id FROM job_roles WHERE slug = 'backend-developer')
  ),
  (
    (SELECT id FROM companies WHERE name = 'StoryStream'),
    (SELECT id FROM job_roles WHERE slug = 'data-engineer')
  ),
  (
    (SELECT id FROM companies WHERE name = 'Dapper Labs Limited'),
    (SELECT id FROM job_roles WHERE slug = 'full-stack-developer')
  );

