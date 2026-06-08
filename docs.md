# Assumptions and Tradeoffs

## Assumptions

- PostgreSQL is required for local development and database-backed tests.
- TypeORM migrations are the source of schema changes.
- Seed data is repeatable and uses stable hotel and room ids.
- Availability comes from seeded `available_dates` records.
- `check_out` is exclusive for room availability.
- Prices are stored as nightly values from the dataset.
- The dataset does not include currency, images, or latitude and longitude.
- The API does not include authentication, authorization, or user accounts.

## Tradeoffs

- `price_range` is split into `min_price` and `max_price` for clearer validation.
- Room availability checks date presence instead of inventory counts.
- Total room price is calculated from nightly price times requested nights.
- Pagination is omitted because the dataset is small and fixed.
- External supplier integration is omitted to keep responses deterministic.
- Booking and reservation holds are omitted because inventory mutation is out of scope.
- Response serializers hide database column names from API clients.
- Service tests use mocked repositories for fast business-rule coverage.

## 4xx Responses

- `400 Bad Request` is used for malformed query values.
- `400 Bad Request` is used when `max_price` is lower than `min_price`.
- `400 Bad Request` is used when `check_out` is not after `check_in`.
- `404 Not Found` is used when a hotel id does not exist.

## AI Tooling

- AI assistance was used to review the spec and support code and documentation edits.
- Generated output was reviewed, edited, and validated before submission.
