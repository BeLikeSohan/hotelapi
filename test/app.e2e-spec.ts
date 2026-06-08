import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HotelDetailResponse } from '../src/hotels/serializers/hotel-detail.serializer';
import { HotelSummaryResponse } from '../src/hotels/serializers/hotel-summary.serializer';
import { RoomAvailabilityResponse } from '../src/hotels/serializers/room.serializer';
import { closeTestDatabase, prepareTestDatabase } from './test-database';

describe('Hotel Discovery API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    await prepareTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    await closeTestDatabase();
  });

  it('GET /hotels returns hotel summaries', async () => {
    const response = await request(app.getHttpServer())
      .get('/hotels')
      .expect(200);
    const hotels = response.body as HotelSummaryResponse[];

    expect(hotels).toHaveLength(40);
    expect(hotels[0]).toMatchObject({
      id: 'hotel-01',
      name: 'The Grand Luminary',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      starRating: 5,
      lowestPricePerNight: 199,
    });
    expect(hotels[0]).not.toHaveProperty('address_city');
  });

  it('GET /hotels filters by city', async () => {
    const response = await request(app.getHttpServer())
      .get('/hotels')
      .query({ city: ' chicago ' })
      .expect(200);
    const hotels = response.body as HotelSummaryResponse[];

    expect(hotels.length).toBeGreaterThan(0);
    expect(
      hotels.every((hotel) => hotel.city.toLowerCase() === 'chicago'),
    ).toBe(true);
  });

  it('GET /hotels rejects malformed star ratings', async () => {
    await request(app.getHttpServer())
      .get('/hotels')
      .query({ star_rating: 'bad' })
      .expect(400);
  });

  it('GET /hotels/:id returns hotel details', async () => {
    const response = await request(app.getHttpServer())
      .get('/hotels/hotel-01')
      .expect(200);
    const hotel = response.body as HotelDetailResponse;

    expect(hotel).toMatchObject({
      id: 'hotel-01',
      name: 'The Grand Luminary',
      address: {
        city: 'Chicago',
        state: 'IL',
      },
      contact: {
        email: 'stay@grandluminary.com',
      },
      policies: {
        checkInTime: '15:00',
        checkOutTime: '11:00',
      },
    });
    expect(hotel).not.toHaveProperty('address_city');
  });

  it('GET /hotels/:missing_id returns 404', async () => {
    await request(app.getHttpServer()).get('/hotels/missing').expect(404);
  });

  it('GET /hotels/:id/rooms returns available room options', async () => {
    const response = await request(app.getHttpServer())
      .get('/hotels/hotel-01/rooms')
      .query({ check_in: '2026-07-10', check_out: '2026-07-12' })
      .expect(200);
    const rooms = response.body as RoomAvailabilityResponse[];

    expect(rooms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'room-01b',
          hotelId: 'hotel-01',
          pricePerNight: 199,
          totalPrice: 398,
          availableDates: ['2026-07-10', '2026-07-11'],
        }),
      ]),
    );
  });

  it('GET /hotels/:id/rooms rejects missing or reversed dates', async () => {
    await request(app.getHttpServer())
      .get('/hotels/hotel-01/rooms')
      .query({ check_in: '2026-07-10' })
      .expect(400);

    await request(app.getHttpServer())
      .get('/hotels/hotel-01/rooms')
      .query({ check_in: '2026-07-12', check_out: '2026-07-10' })
      .expect(400);
  });
});
