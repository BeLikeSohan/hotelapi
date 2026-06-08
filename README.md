## Description

Hotel Discovery API built with NestJS, TypeScript, PostgreSQL, and TypeORM.

## Project setup

```bash
$ npm install
$ cp .env.example .env
```

## Docker setup

The Docker stack runs the NestJS API, PostgreSQL 18, and pgAdmin 4.

```bash
$ docker compose up --build
```

- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`

pgAdmin login:

- Email: `admin@hotelapi.local`
- Password: `admin_password`

Register the database server in pgAdmin with these values:

- Host: `postgres`
- Port: `5432`
- Database: `hotelapi`
- Username: `hotelapi`
- Password: `hotelapi_password`

## Database setup

TypeORM runs with `synchronize: false`, so the application does not create or update database tables on startup. Run migrations before starting the API against a fresh database.

For local development, start PostgreSQL first:

```bash
$ docker compose up -d postgres
```

Then apply the schema migration:

```bash
$ npm run migration:run
```

Load the mock hotel dataset:

```bash
$ npm run seed
```

The seed script is idempotent and can be rerun. It upserts hotels, rooms, amenities, join tables, and room availability dates.

To revert the most recent migration:

```bash
$ npm run migration:revert
```

## Compile and run the project

```bash
# first-time local database setup
$ docker compose up -d postgres
$ npm run migration:run
$ npm run seed

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# run specs serially, useful after adding or updating *.spec.ts files
$ npm test -- --runInBand

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```