import dataSource from '../src/database/data-source';
import { Hotel } from '../src/hotels/entities/hotel.entity';
import { RoomAvailableDate } from '../src/hotels/entities/room-available-date.entity';
import { Room } from '../src/hotels/entities/room.entity';
import { TypeOrmHotelsRepository } from '../src/hotels/repositories/typeorm-hotels.repository';
import { closeTestDatabase, prepareTestDatabase } from './test-database';

describe('TypeOrmHotelsRepository (PostgreSQL)', () => {
  let repository: TypeOrmHotelsRepository;

  beforeAll(async () => {
    await prepareTestDatabase();
    repository = new TypeOrmHotelsRepository(
      dataSource.getRepository(Hotel),
      dataSource.getRepository(Room),
      dataSource.getRepository(RoomAvailableDate),
    );
  }, 30000);

  afterAll(async () => {
    await closeTestDatabase();
  });

  it('persists and reads seeded hotel data', async () => {
    const hotel = await repository.findById('hotel-01');

    expect(hotel).toMatchObject({
      id: 'hotel-01',
      name: 'The Grand Luminary',
      addressCity: 'Chicago',
    });
    expect(hotel?.amenities.map((amenity) => amenity.label)).toContain(
      'free Wi-Fi',
    );
  });

  it('applies city, star-rating, and price filters in SQL', async () => {
    const hotels = await repository.search({
      city: 'chicago',
      star_rating: 5,
      min_price: 199,
      max_price: 199,
    });

    expect(hotels.map((hotel) => hotel.id)).toContain('hotel-01');
    expect(
      hotels.every(
        (hotel) =>
          hotel.addressCity === 'Chicago' &&
          hotel.starRating === 5 &&
          hotel.rooms.some((room) => room.pricePerNight === 199),
      ),
    ).toBe(true);
  });

  it('loads amenities and rooms needed for serialized API responses', async () => {
    const [hotel] = await repository.search({ min_price: 199, max_price: 199 });

    expect(hotel).toBeDefined();
    expect(hotel.amenities.length).toBeGreaterThan(0);
    expect(hotel.rooms.length).toBeGreaterThan(0);
    expect(hotel.rooms[0]).toHaveProperty('pricePerNight');
    expect(hotel.rooms[0]).not.toHaveProperty('price_per_night');
  });

  it('finds rooms only when every requested room night is available', async () => {
    const rooms = await repository.findAvailableRooms('hotel-01', [
      '2026-07-10',
      '2026-07-11',
      '2026-07-12',
    ]);

    expect(rooms.map((room) => room.id)).toEqual(['room-01a']);
  });
});
