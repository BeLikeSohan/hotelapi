## Description

Hotel Discovery API built with NestJS, TypeScript, PostgreSQL, and TypeORM.

## Prerequisites

- Node.js 20 or newer.
- npm.
- Docker and Docker Compose for the local PostgreSQL and pgAdmin stack.

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

- Email: `admin@example.com`
- Password: `admin_password`

Register the database server in pgAdmin with these values:

- Host: `postgres`
- Port: `5432`
- Database: `hotelapi`
- Username: `hotelapi`
- Password: `hotelapi_password`

## Database setup

> Warning: Run the database migration before starting the API for the first time.
> Using `synchronize: false`, so the application will not create tables automatically.

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

`npm run test:e2e` expects PostgreSQL to be running and reachable through the values in `.env`.

## Example API requests

```bash
# list all hotels
$ curl http://localhost:3000/hotels

# filter hotels
$ curl "http://localhost:3000/hotels?city=Chicago&star_rating=5&min_price=150&max_price=300"

# get full hotel details
$ curl http://localhost:3000/hotels/hotel-01

# get available rooms for a stay window
$ curl "http://localhost:3000/hotels/hotel-01/rooms?check_in=2026-07-10&check_out=2026-07-12"
```

Swagger documentation is available at `http://localhost:3000/docs` when the API is running.

## Architecture summary

The app keeps HTTP, business rules, and persistence separated:

- `HotelsController` exposes the public REST endpoints and delegates work to the service.
- `HotelsService` owns validation that spans multiple fields, not-found handling, availability window calculation, and response serialization.
- `HotelsRepository` hides TypeORM query details behind a small repository interface.
- TypeORM entities and checked-in migrations define the PostgreSQL schema.
- The seed script loads the stable mock dataset idempotently for local development and tests.

Global Nest validation strips unknown query fields, transforms primitive query values, and rejects malformed input with `400 Bad Request`.

## AI tooling disclosure

AI assistance was used to review the assignment, draft implementation and documentation changes, and support code generation. Generated output was reviewed, edited, and validated before submission.
