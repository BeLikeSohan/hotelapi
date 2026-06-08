import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Amenity } from './entities/amenity.entity';
import { Hotel } from './entities/hotel.entity';
import { Room } from './entities/room.entity';
import { HotelsService } from './hotels.service';
import { HotelsRepository } from './repositories/hotels.repository';
import { beforeEach, describe } from 'node:test';

function makeAmenity(overrides: Partial<Amenity> = {}): Amenity {
  const amenity = new Amenity();
  amenity.id = 'amenity-01';
  amenity.code = 'free_wifi';
  amenity.label = 'free Wi-Fi';
  amenity.hotels = [];
  amenity.rooms = [];

  return Object.assign(amenity, overrides);
}

function makeHotel(overrides: Partial<Hotel> = {}): Hotel {
  const hotel = new Hotel();
  hotel.id = 'hotel-01';
  hotel.name = 'The Grand Luminary';
  hotel.description = 'A luxury hotel.';
  hotel.starRating = 5;
  hotel.overallRating = 4.8;
  hotel.reviewCount = 1240;
  hotel.addressStreet = '789 Skyline Blvd';
  hotel.addressCity = 'Chicago';
  hotel.addressState = 'IL';
  hotel.addressZipCode = '60611';
  hotel.addressCountry = 'USA';
  hotel.contactPhone = '+1-312-555-0199';
  hotel.contactEmail = 'stay@grandluminary.com';
  hotel.checkInTime = '15:00:00';
  hotel.checkOutTime = '11:00:00';
  hotel.cancellationPolicy = 'Free cancellation up to 24 hours before check-in';
  hotel.createdAt = new Date('2026-01-01T00:00:00.000Z');
  hotel.updatedAt = new Date('2026-01-01T00:00:00.000Z');
  hotel.rooms = [
    makeRoom({ id: 'room-01a', pricePerNight: 299 }),
    makeRoom({ id: 'room-01b', pricePerNight: 199 }),
  ];
  hotel.amenities = [makeAmenity()];

  return Object.assign(hotel, overrides);
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  const room = new Room();
  room.id = 'room-01a';
  room.hotelId = 'hotel-01';
  room.type = 'Deluxe King Room';
  room.bedType = 'King';
  room.bedCount = 1;
  room.maxOccupancy = 2;
  room.squareFootage = 450;
  room.pricePerNight = 299;
  room.createdAt = new Date('2026-01-01T00:00:00.000Z');
  room.updatedAt = new Date('2026-01-01T00:00:00.000Z');
  room.hotel = new Hotel();
  room.amenities = [
    makeAmenity({
      id: 'amenity-02',
      code: 'city_view',
      label: 'city_view',
    }),
  ];
  room.availableDates = [];

  return Object.assign(room, overrides);
}

describe('HotelsService', () => {
  let repository: jest.Mocked<HotelsRepository>;
  let service: HotelsService;

  beforeEach(() => {
    repository = {
      search: jest.fn(),
      findById: jest.fn(),
      exists: jest.fn(),
      findAvailableRooms: jest.fn(),
    };
    service = new HotelsService(repository);
  });

  it('returns serialized hotel summaries', async () => {
    repository.search.mockResolvedValue([makeHotel()]);

    await expect(service.searchHotels({})).resolves.toEqual([
      {
        id: 'hotel-01',
        name: 'The Grand Luminary',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        starRating: 5,
        overallRating: 4.8,
        reviewCount: 1240,
        lowestPricePerNight: 199,
        amenities: ['free Wi-Fi'],
      },
    ]);
    expect(repository.search.mock.calls).toEqual([[{}]]);
  });

  it('rejects a max price lower than min price', async () => {
    await expect(
      service.searchHotels({ min_price: 200, max_price: 100 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.search.mock.calls).toHaveLength(0);
  });

  it('returns hotel details by id', async () => {
    repository.findById.mockResolvedValue(makeHotel());

    await expect(service.getHotel('hotel-01')).resolves.toMatchObject({
      id: 'hotel-01',
      address: {
        city: 'Chicago',
      },
      contact: {
        email: 'stay@grandluminary.com',
      },
      policies: {
        checkInTime: '15:00',
        checkOutTime: '11:00',
      },
    });
  });

  it('throws not found for unknown hotel details', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.getHotel('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns rooms for valid stay dates', async () => {
    repository.exists.mockResolvedValue(true);
    repository.findAvailableRooms.mockResolvedValue([makeRoom()]);

    await expect(
      service.getAvailableRooms('hotel-01', {
        check_in: '2026-07-10',
        check_out: '2026-07-12',
      }),
    ).resolves.toEqual([
      {
        id: 'room-01a',
        hotelId: 'hotel-01',
        type: 'Deluxe King Room',
        bedType: 'King',
        bedCount: 1,
        maxOccupancy: 2,
        squareFootage: 450,
        pricePerNight: 299,
        totalPrice: 598,
        amenities: ['city_view'],
        availableDates: ['2026-07-10', '2026-07-11'],
      },
    ]);
    expect(repository.findAvailableRooms.mock.calls).toEqual([
      ['hotel-01', ['2026-07-10', '2026-07-11']],
    ]);
  });

  it('rejects reversed room dates', async () => {
    await expect(
      service.getAvailableRooms('hotel-01', {
        check_in: '2026-07-12',
        check_out: '2026-07-10',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.exists.mock.calls).toHaveLength(0);
  });

  it('rejects invalid calendar dates', async () => {
    await expect(
      service.getAvailableRooms('hotel-01', {
        check_in: '2026-02-31',
        check_out: '2026-03-02',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.exists.mock.calls).toHaveLength(0);
  });

  it('throws not found before room lookup for missing hotels', async () => {
    repository.exists.mockResolvedValue(false);

    await expect(
      service.getAvailableRooms('missing', {
        check_in: '2026-07-10',
        check_out: '2026-07-11',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.findAvailableRooms.mock.calls).toHaveLength(0);
  });
});
