import { Controller, Get, Param, Query } from '@nestjs/common';
import { RoomAvailabilityQueryDto } from './dto/room-availability-query.dto';
import { SearchHotelsDto } from './dto/search-hotels.dto';
import { HotelsService } from './hotels.service';
import { HotelDetailResponse } from './serializers/hotel-detail.serializer';
import { HotelSummaryResponse } from './serializers/hotel-summary.serializer';
import { RoomAvailabilityResponse } from './serializers/room.serializer';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  searchHotels(
    @Query() query: SearchHotelsDto,
  ): Promise<HotelSummaryResponse[]> {
    return this.hotelsService.searchHotels(query);
  }

  @Get(':id')
  getHotel(@Param('id') id: string): Promise<HotelDetailResponse> {
    return this.hotelsService.getHotel(id);
  }

  @Get(':id/rooms')
  getAvailableRooms(
    @Param('id') id: string,
    @Query() query: RoomAvailabilityQueryDto,
  ): Promise<RoomAvailabilityResponse[]> {
    return this.hotelsService.getAvailableRooms(id, query);
  }
}
