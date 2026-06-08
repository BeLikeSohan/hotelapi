import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RoomAvailabilityQueryDto } from './dto/room-availability-query.dto';
import { SearchHotelsDto } from './dto/search-hotels.dto';
import { HotelsService } from './hotels.service';
import { HotelDetailResponse } from './serializers/hotel-detail.serializer';
import { HotelSummaryResponse } from './serializers/hotel-summary.serializer';
import { RoomAvailabilityResponse } from './serializers/room.serializer';

@ApiTags('hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter hotels' })
  @ApiOkResponse({
    description: 'Hotels matching the requested filters.',
    schema: {
      example: [
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
          amenities: [
            'pool',
            'free Wi-Fi',
            'fitness_center',
            'spa',
            'valet_parking',
            'pet_friendly',
          ],
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameter.' })
  searchHotels(
    @Query() query: SearchHotelsDto,
  ): Promise<HotelSummaryResponse[]> {
    return this.hotelsService.searchHotels(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hotel details' })
  @ApiParam({
    name: 'id',
    example: 'hotel-01',
    description: 'Seeded hotel identifier.',
  })
  @ApiOkResponse({
    description: 'Full hotel details.',
    schema: {
      example: {
        id: 'hotel-01',
        name: 'The Grand Luminary',
        description:
          'A luxury oasis in the heart of downtown, featuring panoramic city views, world-class dining, and a serene rooftop escape.',
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
        amenities: [
          'pool',
          'free Wi-Fi',
          'fitness_center',
          'spa',
          'valet_parking',
          'pet_friendly',
        ],
        policies: {
          checkInTime: '15:00',
          checkOutTime: '11:00',
          cancellation: 'Free cancellation up to 24 hours before check-in',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Hotel not found.' })
  getHotel(@Param('id') id: string): Promise<HotelDetailResponse> {
    return this.hotelsService.getHotel(id);
  }

  @Get(':id/rooms')
  @ApiOperation({ summary: 'Get available rooms for a stay window' })
  @ApiParam({
    name: 'id',
    example: 'hotel-01',
    description: 'Seeded hotel identifier.',
  })
  @ApiOkResponse({
    description: 'Available room options with nightly and total pricing.',
    schema: {
      example: [
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
          amenities: ['city_view', 'mini_bar'],
          availableDates: ['2026-07-10', '2026-07-11'],
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Missing, invalid, or reversed dates.',
  })
  @ApiNotFoundResponse({ description: 'Hotel not found.' })
  getAvailableRooms(
    @Param('id') id: string,
    @Query() query: RoomAvailabilityQueryDto,
  ): Promise<RoomAvailabilityResponse[]> {
    return this.hotelsService.getAvailableRooms(id, query);
  }
}
