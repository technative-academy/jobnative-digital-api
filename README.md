# jobnative-digital-api


## Selected options

- Language: TypeScript
- Dev watcher: tsx watch
- Architecture: MVC
- Database: Postgres (psql)


## Folder structure

```
.
├── src
│   ├── app.ts
│   ├── server.ts
│   ├── routes
│   │   ├── health.ts
│   │   └── users.ts
│   ├── controllers
│   │   └── usersController.ts
│   ├── services
│   │   └── usersService.ts
│   ├── repositories
│   │   └── usersRepository.ts
│   ├── db
│   │   └── pool.ts
│   ├── errors
│   │   └── AppError.ts
│   ├── utils
│   │   └── getPort.ts
│   └── middleware
│       ├── errorHandler.ts
│       └── notFound.ts
├── __tests__
│   └── app.test.ts
├── db
│   ├── schema.sql
│   └── seed.sql
├── scripts
│   ├── dbCreate.js
│   ├── dbSetup.js
│   ├── dbSeed.js
│   └── dbReset.js
├── .env.example
├── .gitignore
├── .eslintrc.cjs
├── package.json
├── tsconfig.json
├── tsconfig.eslint.json
└── jest.config.js
```


## Prerequisites

This project uses a local PostgreSQL database. Follow the steps for your OS below.

### 1. Install PostgreSQL

**macOS** (using [Homebrew](https://brew.sh)):

```sh
brew install postgresql@17
brew services start postgresql@17
```

**Ubuntu / Debian**:

```sh
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql && sudo systemctl enable postgresql
```

**Windows**: Download the installer from https://www.postgresql.org/download/windows/ and follow the prompts. Remember the password you set — you'll need it in step 2.

### 2. Set up your database role

Your `.env` file connects as `alex` with password `postgres`. You need a matching PostgreSQL role.

**Linux** (run once):

```sh
sudo -u postgres createuser --createdb "$USER"
sudo -u postgres psql -c "ALTER USER \"$USER\" WITH PASSWORD 'postgres';"
```

**macOS**: Homebrew already created a role for you. Run the commands above only if you get an auth error.

**Windows**: The installer created a `postgres` role. Edit `DATABASE_URL` in your `.env` to use it:

```
DATABASE_URL=postgres://postgres:YOUR_INSTALL_PASSWORD@localhost:5432/jobnative_digital_api_dev
```

### 3. Verify

```sh
pg_isready
```

You should see `accepting connections`.



## Run the app

```sh
npm install
cp .env.example .env
npm run db:create
npm run db:setup
npm run db:seed
npm run dev
```

Run `npm run lint` to check the code with ESLint.

## Add a new route

1. Add a router in `src/routes`.
2. Call controller functions from that route.
3. Put business rules in `src/services`.
4. Put data access code in `src/repositories`.
5. Register the route in `src/app.ts`.

## Where business logic goes

Use `src/services` for business logic. Controllers translate HTTP requests/responses, and repositories handle persistence.

## How errors work

- `src/middleware/notFound.ts` handles unknown routes with a 404 JSON response.
- `src/middleware/errorHandler.ts` returns `{ status, message }` and includes `stack` only in development.


## Database commands

| Command | What it does |
| --- | --- |
| `npm run db:create` | Creates the database (safe to re-run) |
| `npm run db:setup` | Applies the schema (creates tables) |
| `npm run db:seed` | Inserts sample data |
| `npm run db:reset` | Drops and re-creates tables + sample data |

## Troubleshooting

**"connection refused"** — PostgreSQL isn't running.

```sh
# Linux
sudo systemctl start postgresql
# macOS
brew services start postgresql@17
```

**"role does not exist"** — Create a Postgres role for your OS user:

```sh
sudo -u postgres createuser --createdb "$USER"
sudo -u postgres psql -c "ALTER USER \"$USER\" WITH PASSWORD 'postgres';"
```

**"password authentication failed" / "client password must be a string"** — The credentials in `DATABASE_URL` are wrong or missing. Run the role setup commands in [Prerequisites](#prerequisites) and make sure `DATABASE_URL` in `.env` matches.

**"database does not exist"** — Run `npm run db:create`.

