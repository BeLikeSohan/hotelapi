import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoomAvailabilityQueryDto } from './dto/room-availability-query.dto';
import { SearchHotelsDto } from './dto/search-hotels.dto';
import { HotelsRepository } from './repositories/hotels.repository';
import {
  HotelDetailResponse,
  serializeHotelDetail,
} from './serializers/hotel-detail.serializer';
import {
  HotelSummaryResponse,
  serializeHotelSummary,
} from './serializers/hotel-summary.serializer';
import {
  RoomAvailabilityResponse,
  serializeAvailableRoom,
} from './serializers/room.serializer';

@Injectable()
export class HotelsService {
  constructor(private readonly hotelsRepository: HotelsRepository) {}

  async searchHotels(
    filters: SearchHotelsDto,
  ): Promise<HotelSummaryResponse[]> {
    if (
      filters.min_price !== undefined &&
      filters.max_price !== undefined &&
      filters.max_price < filters.min_price
    ) {
      throw new BadRequestException(
        'max_price must be greater than or equal to min_price',
      );
    }

    const hotels = await this.hotelsRepository.search(filters);

    return hotels.map(serializeHotelSummary);
  }

  async getHotel(id: string): Promise<HotelDetailResponse> {
    const hotel = await this.hotelsRepository.findById(id);
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    return serializeHotelDetail(hotel);
  }

  async getAvailableRooms(
    id: string,
    query: RoomAvailabilityQueryDto,
  ): Promise<RoomAvailabilityResponse[]> {
    if (!isValidIsoDate(query.check_in) || !isValidIsoDate(query.check_out)) {
      throw new BadRequestException(
        'check_in and check_out must be valid calendar dates',
      );
    }

    const requestedDates = datesForStay(query.check_in, query.check_out);
    if (requestedDates.length === 0) {
      throw new BadRequestException('check_out must be after check_in');
    }

    const hotelExists = await this.hotelsRepository.exists(id);
    if (!hotelExists) {
      throw new NotFoundException('Hotel not found');
    }

    const rooms = await this.hotelsRepository.findAvailableRooms(
      id,
      requestedDates,
    );

    return rooms.map((room) => serializeAvailableRoom(room, requestedDates));
  }
}

function datesForStay(checkIn: string, checkOut: string): string[] {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);
  const dates: string[] = [];

  for (
    let timestamp = start;
    timestamp < end;
    timestamp += 24 * 60 * 60 * 1000
  ) {
    dates.push(new Date(timestamp).toISOString().slice(0, 10));
  }

  return dates;
}

function parseDate(value: string): number {
  const [year, month, day] = value.split('-').map(Number);

  return Date.UTC(year, month - 1, day);
}

function isValidIsoDate(value: string): boolean {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.toISOString().slice(0, 10) === value;
}
