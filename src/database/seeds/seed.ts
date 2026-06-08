import { EntityManager } from 'typeorm';
import dataSource from '../data-source';
import { seedHotels } from './hotel-seed-data';

type AmenityRecord = {
  id: string;
  code: string;
};

function normalizeAmenityCode(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/wi-fi/g, 'wifi')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function parameterList(rows: unknown[][], columnCount: number): string {
  return rows
    .map((_, rowIndex) => {
      const placeholders = Array.from(
        { length: columnCount },
        (__, columnIndex) => `$${rowIndex * columnCount + columnIndex + 1}`,
      );

      return `(${placeholders.join(', ')})`;
    })
    .join(', ');
}

async function queryRows<T>(
  manager: EntityManager,
  query: string,
  parameters: unknown[],
): Promise<T[]> {
  const result: unknown = await manager.query(query, parameters);

  return result as T[];
}

async function seed(): Promise<void> {
  await dataSource.initialize();

  await dataSource.transaction(async (manager) => {
    const hotelIds = seedHotels.map((hotel) => hotel.id);
    const roomIds = seedHotels.flatMap((hotel) =>
      hotel.rooms.map((room) => room.id),
    );
    const amenityLabels = [
      ...new Set(
        seedHotels.flatMap((hotel) => [
          ...hotel.amenities,
          ...hotel.rooms.flatMap((room) => room.amenities),
        ]),
      ),
    ].sort();

    const amenityRows = amenityLabels.map((label) => [
      normalizeAmenityCode(label),
      label,
    ]);
    const insertedAmenities = await queryRows<AmenityRecord>(
      manager,
      `
        INSERT INTO amenities (code, label)
        VALUES ${parameterList(amenityRows, 2)}
        ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label
        RETURNING id, code
      `,
      amenityRows.flat(),
    );
    const amenitiesByCode = new Map(
      insertedAmenities.map((amenity) => [amenity.code, amenity.id]),
    );

    for (const hotel of seedHotels) {
      await manager.query(
        `
          INSERT INTO hotels (
            id,
            name,
            description,
            star_rating,
            overall_rating,
            review_count,
            address_street,
            address_city,
            address_state,
            address_zip_code,
            address_country,
            contact_phone,
            contact_email,
            check_in_time,
            check_out_time,
            cancellation_policy
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15, $16
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            star_rating = EXCLUDED.star_rating,
            overall_rating = EXCLUDED.overall_rating,
            review_count = EXCLUDED.review_count,
            address_street = EXCLUDED.address_street,
            address_city = EXCLUDED.address_city,
            address_state = EXCLUDED.address_state,
            address_zip_code = EXCLUDED.address_zip_code,
            address_country = EXCLUDED.address_country,
            contact_phone = EXCLUDED.contact_phone,
            contact_email = EXCLUDED.contact_email,
            check_in_time = EXCLUDED.check_in_time,
            check_out_time = EXCLUDED.check_out_time,
            cancellation_policy = EXCLUDED.cancellation_policy,
            updated_at = now()
        `,
        [
          hotel.id,
          hotel.name,
          hotel.description,
          hotel.starRating,
          hotel.overallRating,
          hotel.reviewCount,
          hotel.address.street,
          hotel.address.city,
          hotel.address.state,
          hotel.address.zipCode,
          hotel.address.country,
          hotel.contact.phone,
          hotel.contact.email,
          hotel.policies.checkInTime,
          hotel.policies.checkOutTime,
          hotel.policies.cancellation,
        ],
      );

      for (const room of hotel.rooms) {
        await manager.query(
          `
            INSERT INTO rooms (
              id,
              hotel_id,
              type,
              bed_type,
              bed_count,
              max_occupancy,
              square_footage,
              price_per_night
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
              hotel_id = EXCLUDED.hotel_id,
              type = EXCLUDED.type,
              bed_type = EXCLUDED.bed_type,
              bed_count = EXCLUDED.bed_count,
              max_occupancy = EXCLUDED.max_occupancy,
              square_footage = EXCLUDED.square_footage,
              price_per_night = EXCLUDED.price_per_night,
              updated_at = now()
          `,
          [
            room.id,
            hotel.id,
            room.type,
            room.bedType,
            room.bedCount,
            room.maxOccupancy,
            room.squareFootage,
            room.pricePerNight,
          ],
        );
      }
    }

    await manager.query(
      `DELETE FROM hotel_amenities WHERE hotel_id = ANY($1)`,
      [hotelIds],
    );
    await manager.query(`DELETE FROM room_amenities WHERE room_id = ANY($1)`, [
      roomIds,
    ]);
    await manager.query(
      `DELETE FROM room_available_dates WHERE room_id = ANY($1)`,
      [roomIds],
    );

    const hotelAmenityRows = seedHotels.flatMap((hotel) =>
      hotel.amenities.map((amenity) => [
        hotel.id,
        amenitiesByCode.get(normalizeAmenityCode(amenity)),
      ]),
    );
    if (hotelAmenityRows.length > 0) {
      await manager.query(
        `
          INSERT INTO hotel_amenities (hotel_id, amenity_id)
          VALUES ${parameterList(hotelAmenityRows, 2)}
          ON CONFLICT DO NOTHING
        `,
        hotelAmenityRows.flat(),
      );
    }

    const roomAmenityRows = seedHotels.flatMap((hotel) =>
      hotel.rooms.flatMap((room) =>
        room.amenities.map((amenity) => [
          room.id,
          amenitiesByCode.get(normalizeAmenityCode(amenity)),
        ]),
      ),
    );
    if (roomAmenityRows.length > 0) {
      await manager.query(
        `
          INSERT INTO room_amenities (room_id, amenity_id)
          VALUES ${parameterList(roomAmenityRows, 2)}
          ON CONFLICT DO NOTHING
        `,
        roomAmenityRows.flat(),
      );
    }

    const availabilityRows = seedHotels.flatMap((hotel) =>
      hotel.rooms.flatMap((room) =>
        room.availableDates.map((availableDate) => [room.id, availableDate]),
      ),
    );
    if (availabilityRows.length > 0) {
      await manager.query(
        `
          INSERT INTO room_available_dates (room_id, available_date)
          VALUES ${parameterList(availabilityRows, 2)}
          ON CONFLICT (room_id, available_date) DO NOTHING
        `,
        availabilityRows.flat(),
      );
    }
  });
}

void seed()
  .then(() => {
    const roomCount = seedHotels.reduce(
      (count, hotel) => count + hotel.rooms.length,
      0,
    );

    console.log(
      `Seeded ${seedHotels.length} hotels and ${roomCount} rooms successfully.`,
    );
  })
  .catch((error: unknown) => {
    console.error('Seed failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
