import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHotelDiscoverySchema1760000000000 implements MigrationInterface {
  name = 'CreateHotelDiscoverySchema1760000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "hotels" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "description" text NOT NULL,
        "star_rating" smallint NOT NULL,
        "overall_rating" numeric(2,1) NOT NULL,
        "review_count" integer NOT NULL,
        "address_street" text NOT NULL,
        "address_city" text NOT NULL,
        "address_state" text NOT NULL,
        "address_zip_code" text NOT NULL,
        "address_country" text NOT NULL,
        "contact_phone" text NOT NULL,
        "contact_email" text NOT NULL,
        "check_in_time" time NOT NULL,
        "check_out_time" time NOT NULL,
        "cancellation_policy" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_hotels_star_rating_range" CHECK ("star_rating" BETWEEN 1 AND 5),
        CONSTRAINT "CHK_hotels_overall_rating_range" CHECK ("overall_rating" >= 0 AND "overall_rating" <= 5),
        CONSTRAINT "CHK_hotels_review_count_nonnegative" CHECK ("review_count" >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "rooms" (
        "id" text PRIMARY KEY,
        "hotel_id" text NOT NULL,
        "type" text NOT NULL,
        "bed_type" text NOT NULL,
        "bed_count" smallint NOT NULL,
        "max_occupancy" smallint NOT NULL,
        "square_footage" integer NOT NULL,
        "price_per_night" numeric(10,2) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_rooms_bed_count_positive" CHECK ("bed_count" > 0),
        CONSTRAINT "CHK_rooms_max_occupancy_positive" CHECK ("max_occupancy" > 0),
        CONSTRAINT "CHK_rooms_square_footage_positive" CHECK ("square_footage" > 0),
        CONSTRAINT "CHK_rooms_price_per_night_nonnegative" CHECK ("price_per_night" >= 0),
        CONSTRAINT "FK_rooms_hotel_id" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "amenities" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" text NOT NULL,
        "label" text NOT NULL,
        CONSTRAINT "UQ_amenities_code" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "hotel_amenities" (
        "hotel_id" text NOT NULL,
        "amenity_id" uuid NOT NULL,
        CONSTRAINT "PK_hotel_amenities" PRIMARY KEY ("hotel_id", "amenity_id"),
        CONSTRAINT "FK_hotel_amenities_hotel_id" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_hotel_amenities_amenity_id" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "room_amenities" (
        "room_id" text NOT NULL,
        "amenity_id" uuid NOT NULL,
        CONSTRAINT "PK_room_amenities" PRIMARY KEY ("room_id", "amenity_id"),
        CONSTRAINT "FK_room_amenities_room_id" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_room_amenities_amenity_id" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "room_available_dates" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "room_id" text NOT NULL,
        "available_date" date NOT NULL,
        CONSTRAINT "UQ_room_available_dates_room_date" UNIQUE ("room_id", "available_date"),
        CONSTRAINT "FK_room_available_dates_room_id" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_hotels_address_city" ON "hotels" ("address_city")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_hotels_star_rating" ON "hotels" ("star_rating")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_rooms_hotel_id" ON "rooms" ("hotel_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_rooms_price_per_night" ON "rooms" ("price_per_night")`,
    );
    await queryRunner.query(`
      CREATE INDEX "IDX_room_available_dates_room_date"
      ON "room_available_dates" ("room_id", "available_date")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_room_available_dates_room_date"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rooms_price_per_night"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rooms_hotel_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_hotels_star_rating"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_hotels_address_city"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "room_available_dates"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "room_amenities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hotel_amenities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "amenities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rooms"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hotels"`);
  }
}
