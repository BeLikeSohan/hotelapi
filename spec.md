# Hotel Discovery API Specification

## Purpose

Build a lightweight, production-ready REST API that lets clients search hotel properties, inspect detailed hotel information, and retrieve room availability with pricing for a requested stay window.

This project is a NestJS/TypeScript service. The implementation should prioritize clear module boundaries, explicit contracts, validation, deterministic behavior, and tests that prove the public API works as expected.

## Assignment Requirements

The service must support:

- `GET /hotels`: search and filter hotels.
- `GET /hotels/:id`: return full details for one hotel.
- `GET /hotels/:id/rooms`: return available room options and nightly pricing for check-in/check-out dates.

The API will use PostgreSQL as its backing store. The supplied mock dataset contains 40 hotels and should be imported through a seed script so development, tests, and reviewer setup are repeatable.

## Non-Goals

- No authentication or authorization.
- No booking, payment, reservation hold, cancellation, or inventory mutation.
- No external supplier integration.
- No complex rate shopping, tax calculation, currency conversion, or promotional pricing engine.

## Technology Choices

- Runtime: Node.js.
- Language: TypeScript.
- Framework: NestJS.
- Database: PostgreSQL.
- Data access: TypeORM with checked-in migrations and seed data.
- Test runner: Jest with Supertest for e2e/API behavior.
- Data source: PostgreSQL seeded from the supplied hotel dataset.

NestJS is a good fit because it supports production-friendly separation of controllers, services, DTOs, validation, and testing. TypeORM integrates cleanly with Nest through `@nestjs/typeorm`, keeps persistence close to the domain entities, and provides a repeatable migration and seed workflow for reviewers.

## API Design

### Common Response Rules

- All responses are JSON.
- Successful collection responses return arrays directly unless pagination metadata is introduced.
- Unknown resources return `404 Not Found`.
- Invalid query parameters return `400 Bad Request`.
- Dates use ISO `YYYY-MM-DD` format.
- Monetary values are represented as numbers. The supplied dataset does not include currency, so the API should not invent one.

### `GET /hotels`

Search hotels by basic filters.

#### Query Parameters

| Name | Type | Required | Rules |
| --- | --- | --- | --- |
| `city` | string | no | Case-insensitive exact match after trimming. |
| `star_rating` | number | no | Integer from 1 to 5. |
| `min_price` | number | no | Greater than or equal to 0. |
| `max_price` | number | no | Greater than or equal to `min_price` when both are provided. |

`price_range` from the assignment is implemented as `min_price` and `max_price` because separate numeric bounds are easier to validate, document, and compose.
Price filters match hotels by their seeded room prices. A hotel is included when at least one of its rooms falls inside the requested price range.

#### Success Response

Status: `200 OK`

```json
[
  {
    "id": "hotel-01",
    "name": "The Grand Luminary",
    "city": "Chicago",
    "state": "IL",
    "country": "USA",
    "starRating": 5,
    "overallRating": 4.8,
    "reviewCount": 1240,
    "lowestPricePerNight": 199,
    "amenities": ["pool", "free Wi-Fi", "fitness_center", "spa", "valet_parking", "pet_friendly"]
  }
]
```

#### Error Responses

- `400 Bad Request`: query parameter is malformed or outside accepted bounds.

### `GET /hotels/:id`

Return full hotel details by unique identifier.

#### Path Parameters

| Name | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | yes | Must match a seeded hotel identifier such as `hotel-01`. |

#### Success Response

Status: `200 OK`

```json
{
  "id": "hotel-01",
  "name": "The Grand Luminary",
  "description": "A luxury oasis in the heart of downtown, featuring panoramic city views, world-class dining, and a serene rooftop escape.",
  "starRating": 5,
  "overallRating": 4.8,
  "reviewCount": 1240,
  "address": {
    "street": "789 Skyline Blvd",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60611",
    "country": "USA"
  },
  "contact": {
    "phone": "+1-312-555-0199",
    "email": "stay@grandluminary.com"
  },
  "amenities": ["pool", "free Wi-Fi", "fitness_center", "spa", "valet_parking", "pet_friendly"],
  "policies": {
    "checkInTime": "15:00",
    "checkOutTime": "11:00",
    "cancellation": "Free cancellation up to 24 hours before check-in"
  }
}
```

#### Error Responses

- `404 Not Found`: no hotel exists for `id`.

### `GET /hotels/:id/rooms`

Return available room types and pricing for a hotel and stay dates.

#### Path Parameters

| Name | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | yes | Must match a seeded hotel identifier such as `hotel-01`. |

#### Query Parameters

| Name | Type | Required | Rules |
| --- | --- | --- | --- |
| `check_in` | string | yes | ISO date in `YYYY-MM-DD` format. |
| `check_out` | string | yes | ISO date in `YYYY-MM-DD` format and strictly after `check_in`. |

#### Availability Rules

- A room is available when the seeded `available_dates` include every room night in the requested stay.
- `check_out` is exclusive. A stay from `2026-07-01` to `2026-07-03` is two nights.
- Available dates are stored per room per date because the dataset provides date lists, not ranges.
- Pricing is returned per night. Total stay price may be included as a useful extension.

#### Success Response

Status: `200 OK`

```json
[
  {
    "id": "room-01a",
    "hotelId": "hotel-01",
    "type": "Deluxe King Room",
    "bedType": "King",
    "bedCount": 1,
    "maxOccupancy": 2,
    "squareFootage": 450,
    "pricePerNight": 299,
    "totalPrice": 598,
    "amenities": ["city_view", "mini_bar"],
    "availableDates": ["2026-07-10", "2026-07-11", "2026-07-12"]
  }
]
```

#### Error Responses

- `400 Bad Request`: missing or invalid date parameters.
- `404 Not Found`: no hotel exists for `id`.

## Data Model

### Hotel

```ts
type Hotel = {
  id: string;
  name: string;
  description: string;
  starRating: number;
  overallRating: number;
  reviewCount: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  amenities: string[];
  policies: {
    checkInTime: string;
    checkOutTime: string;
    cancellation: string;
  };
};
```

### Room

```ts
type Room = {
  id: string;
  hotelId: string;
  type: string;
  bedType: string;
  bedCount: number;
  maxOccupancy: number;
  squareFootage: number;
  pricePerNight: number;
  amenities: string[];
  availableDates: string[];
};
```

## Database Design

PostgreSQL is the source of truth for hotels, rooms, amenities, policies, contact details, and availability data. Migrations must be checked into the repository and applied before the application starts in a new environment.

### Tables

#### `hotels`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` | Primary key; preserves dataset values such as `hotel-01`. |
| `name` | `text` | Required. |
| `description` | `text` | Required. |
| `star_rating` | `smallint` | Required; constrained to 1 through 5. |
| `overall_rating` | `numeric(2,1)` | Required; constrained to 0 through 5. |
| `review_count` | `integer` | Required; must be greater than or equal to 0. |
| `address_street` | `text` | Required. |
| `address_city` | `text` | Required; indexed for search. |
| `address_state` | `text` | Required. |
| `address_zip_code` | `text` | Required. |
| `address_country` | `text` | Required. |
| `contact_phone` | `text` | Required. |
| `contact_email` | `text` | Required. |
| `check_in_time` | `time` | Required. |
| `check_out_time` | `time` | Required. |
| `cancellation_policy` | `text` | Required. |
| `created_at` | `timestamptz` | Required; default `now()`. |
| `updated_at` | `timestamptz` | Required; updated by application code. |

#### `rooms`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` | Primary key; preserves dataset values such as `room-01a`. |
| `hotel_id` | `text` | Required foreign key to `hotels.id`; indexed. |
| `type` | `text` | Required room type from the dataset. |
| `bed_type` | `text` | Required. |
| `bed_count` | `smallint` | Required; must be positive. |
| `max_occupancy` | `smallint` | Required; must be positive. |
| `square_footage` | `integer` | Required; must be positive. |
| `price_per_night` | `numeric(10,2)` | Required; must be greater than or equal to 0. |
| `created_at` | `timestamptz` | Required; default `now()`. |
| `updated_at` | `timestamptz` | Required; updated by application code. |

#### `amenities`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `code` | `text` | Required unique normalized value, for example `free_wifi`. |
| `label` | `text` | Required original dataset label, for example `free Wi-Fi`. |

#### `hotel_amenities`

| Column | Type | Notes |
| --- | --- | --- |
| `hotel_id` | `text` | Foreign key to `hotels.id`. |
| `amenity_id` | `uuid` | Foreign key to `amenities.id`. |

Primary key: `(hotel_id, amenity_id)`.

#### `room_amenities`

| Column | Type | Notes |
| --- | --- | --- |
| `room_id` | `text` | Foreign key to `rooms.id`. |
| `amenity_id` | `uuid` | Foreign key to `amenities.id`. |

Primary key: `(room_id, amenity_id)`.

#### `room_available_dates`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `room_id` | `text` | Required foreign key to `rooms.id`; indexed. |
| `available_date` | `date` | Required. |

Unique key: `(room_id, available_date)`.

Availability rows mirror the dataset's `available_dates` arrays. A production booking system would likely need per-night inventory counts, rate plans, blackout rules, and transactional reservation holds.

### Indexes

- `hotels(address_city)` for city filtering.
- `hotels(star_rating)` for star-rating filtering.
- `rooms(hotel_id)` for hotel room lookup.
- `rooms(price_per_night)` for price-range search.
- `room_available_dates(room_id, available_date)` for date-window lookup.

### Seed Data

The provided dataset should be transformed into seed records for:

- Hotels.
- Rooms.
- Amenities.
- Hotel/room amenity joins.
- Room available dates.

The seed command should be idempotent, using the dataset's stable hotel and room identifiers so reviewers can re-run setup without duplicate data. The PDF extraction includes repeated fragments around page breaks, so the checked-in seed data should be normalized into valid JSON/TypeScript and deduplicate by `hotel.id` and `room.room_id`.

## Project Structure

Recommended production-oriented layout:

```text
src/
  main.ts
  app.module.ts
  database/
    data-source.ts
    database.module.ts
    migrations/
    seeds/
  hotels/
    hotels.controller.ts
    hotels.module.ts
    hotels.service.ts
    dto/
      search-hotels.dto.ts
      room-availability-query.dto.ts
    entities/
      hotel.entity.ts
      room.entity.ts
      amenity.entity.ts
      room-available-date.entity.ts
    repositories/
      hotels.repository.ts
      typeorm-hotels.repository.ts
    serializers/
      hotel-detail.serializer.ts
      hotel-summary.serializer.ts
      room.serializer.ts
```

The repository abstraction keeps the controller and service independent of TypeORM query details. This allows API behavior and business rules to remain stable if the persistence implementation changes later.

## Configuration

Required environment variables:

| Name | Example | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/hotelapi` | PostgreSQL connection string used by TypeORM. |
| `PORT` | `3000` | HTTP port. |
| `NODE_ENV` | `development` | Runtime environment. |

Provide `.env.example` with safe local defaults, but do not commit real credentials.

TypeORM must run with `synchronize: false` in all environments. Schema changes should be made through migrations only.

## Validation

Enable Nest global validation in `main.ts`:

- Strip unknown query fields.
- Transform primitive query values into DTO types.
- Reject invalid values with `400 Bad Request`.

Validation should live in DTOs, not inside controller methods. Cross-field checks, such as `max_price >= min_price` and `check_out > check_in`, may be handled by custom validators or service-level guard clauses with clear exceptions.

## Error Handling

Use the minimum useful 4xx errors:

- `400 Bad Request` for invalid query input.
- `404 Not Found` for missing hotels.

Avoid leaking implementation details in error messages. Error messages should still be specific enough for a client developer to fix the request.

## Testing Strategy

### Unit Tests

Cover `HotelsService` behavior with mocked repository dependencies:

- Returns all hotels when no filters are provided.
- Filters by city case-insensitively.
- Filters by star rating.
- Filters by min and max price.
- Combines multiple filters.
- Returns hotel details by id.
- Throws not found for unknown hotel id.
- Returns rooms for valid stay dates.
- Rejects invalid stay windows.
- Propagates repository not-found results as `404` application errors.

### Repository Tests

Cover `TypeOrmHotelsRepository` against a test PostgreSQL database:

- Persists and reads seeded hotel data.
- Applies city, star-rating, and price filters in SQL.
- Joins amenities and rooms without leaking internal database column names.
- Finds available rooms only when every night in the inclusive check-in and exclusive check-out range exists in `room_available_dates`.

### E2E Tests

Cover API behavior through HTTP against a seeded test PostgreSQL database:

- `GET /hotels` returns `200 OK` with an array.
- `GET /hotels?city=...` filters results.
- `GET /hotels?star_rating=bad` returns `400`.
- `GET /hotels/:id` returns detailed hotel data.
- `GET /hotels/:missing_id` returns `404`.
- `GET /hotels/:id/rooms?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD` returns room options.
- Missing or reversed room dates return `400`.

## Documentation Deliverables

`README.md` should include:

- Project description.
- Prerequisites.
- Install command.
- Run commands for development and production.
- Test commands.
- Example API requests.
- Architecture summary.
- PostgreSQL setup instructions.
- TypeORM migration and seed commands.
- AI tooling disclosure.

A separate assumptions/tradeoffs file should include:

- PostgreSQL is required for local development and tests.
- Availability and pricing are deterministic and based on seeded database fields.
- No authentication, pagination, or external supplier integration is included.
- Room availability is simplified to date presence because the dataset provides `available_dates` but no inventory counts.
- The dataset does not include currency, images, or latitude/longitude.
- Any additional 4xx responses beyond the assignment are documented with rationale.

## AI Tooling Disclosure

The assignment explicitly asks for transparency around AI usage. The final documentation should state that AI assistance was used to review the assignment, draft the implementation specification, and support code/documentation generation. Any generated output must be reviewed, edited, and validated by the developer before submission.

## Production Readiness Checklist

- API contracts are documented and stable.
- DTO validation is enabled globally.
- Database schema and migrations are checked in.
- Seed data can be loaded repeatably.
- Controllers remain thin and delegate business logic to services.
- Data access is hidden behind a repository interface.
- Response shapes are serialized intentionally rather than exposing raw internal data by accident.
- Tests cover service behavior, repository behavior, and public HTTP behavior.
- README and assumptions/tradeoffs documentation are complete.
- Lint, unit tests, and e2e tests pass before submission.
