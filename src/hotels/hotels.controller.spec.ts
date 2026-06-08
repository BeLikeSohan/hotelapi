import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { RoomAvailabilityQueryDto } from './dto/room-availability-query.dto';
import { SearchHotelsDto } from './dto/search-hotels.dto';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { HotelDetailResponse } from './serializers/hotel-detail.serializer';
import { HotelSummaryResponse } from './serializers/hotel-summary.serializer';
import { RoomAvailabilityResponse } from './serializers/room.serializer';

describe('HotelsController', () => {
  let controller: HotelsController;
  let service: jest.Mocked<HotelsService>;

  const hotelSummary: HotelSummaryResponse = {
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
  };

  const hotelDetail: HotelDetailResponse = {
    id: 'hotel-01',
    name: 'The Grand Luminary',
    description: 'A luxury hotel.',
    starRating: 5,
    overallRating: 4.8,
    reviewCount: 1240,
    address: {
      street: '789 Skyline Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60611',
      country: 'USA',
    },
    contact: {
      phone: '+1-312-555-0199',
      email: 'stay@grandluminary.com',
    },
    amenities: ['free Wi-Fi'],
    policies: {
      checkInTime: '15:00',
      checkOutTime: '11:00',
      cancellation: 'Free cancellation up to 24 hours before check-in',
    },
  };

  const availableRoom: RoomAvailabilityResponse = {
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
  };

  beforeEach(async () => {
    service = {
      searchHotels: jest.fn(),
      getHotel: jest.fn(),
      getAvailableRooms: jest.fn(),
    } as unknown as jest.Mocked<HotelsService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelsController],
      providers: [
        {
          provide: HotelsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get(HotelsController);
  });

  it('delegates hotel searches to the service', async () => {
    const query: SearchHotelsDto = {
      city: 'Chicago',
      star_rating: 5,
      min_price: 150,
      max_price: 300,
    };
    service.searchHotels.mockResolvedValue([hotelSummary]);

    await expect(controller.searchHotels(query)).resolves.toEqual([
      hotelSummary,
    ]);
    expect(service.searchHotels.mock.calls).toEqual([[query]]);
  });

  it('delegates hotel detail lookup by id', async () => {
    service.getHotel.mockResolvedValue(hotelDetail);

    await expect(controller.getHotel('hotel-01')).resolves.toEqual(hotelDetail);
    expect(service.getHotel.mock.calls).toEqual([['hotel-01']]);
  });

  it('delegates room availability lookup by id and query', async () => {
    const query: RoomAvailabilityQueryDto = {
      check_in: '2026-07-10',
      check_out: '2026-07-12',
    };
    service.getAvailableRooms.mockResolvedValue([availableRoom]);

    await expect(
      controller.getAvailableRooms('hotel-01', query),
    ).resolves.toEqual([availableRoom]);
    expect(service.getAvailableRooms.mock.calls).toEqual([['hotel-01', query]]);
  });
});
