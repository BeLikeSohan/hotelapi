import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SearchHotelsDto } from '../dto/search-hotels.dto';
import { Hotel } from '../entities/hotel.entity';
import { RoomAvailableDate } from '../entities/room-available-date.entity';
import { Room } from '../entities/room.entity';
import { HotelsRepository } from './hotels.repository';

@Injectable()
export class TypeOrmHotelsRepository implements HotelsRepository {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotels: Repository<Hotel>,
    @InjectRepository(Room)
    private readonly rooms: Repository<Room>,
    @InjectRepository(RoomAvailableDate)
    private readonly roomAvailableDates: Repository<RoomAvailableDate>,
  ) {}

  async search(filters: SearchHotelsDto): Promise<Hotel[]> {
    const query = this.hotels
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.amenities', 'amenity')
      .leftJoinAndSelect('hotel.rooms', 'room')
      .orderBy('hotel.id', 'ASC')
      .addOrderBy('amenity.label', 'ASC')
      .addOrderBy('room.pricePerNight', 'ASC');

    if (filters.city) {
      query.andWhere('LOWER(hotel.addressCity) = LOWER(:city)', {
        city: filters.city,
      });
    }

    if (filters.star_rating !== undefined) {
      query.andWhere('hotel.starRating = :starRating', {
        starRating: filters.star_rating,
      });
    }

    if (filters.min_price !== undefined || filters.max_price !== undefined) {
      const priceQuery = query
        .subQuery()
        .select('1')
        .from(Room, 'price_room')
        .where('price_room.hotelId = hotel.id');

      if (filters.min_price !== undefined) {
        priceQuery.andWhere('price_room.pricePerNight >= :minPrice');
        query.setParameter('minPrice', filters.min_price);
      }

      if (filters.max_price !== undefined) {
        priceQuery.andWhere('price_room.pricePerNight <= :maxPrice');
        query.setParameter('maxPrice', filters.max_price);
      }

      query.andWhere(`EXISTS ${priceQuery.getQuery()}`);
    }

    return query.getMany();
  }

  async findById(id: string): Promise<Hotel | null> {
    return this.hotels.findOne({
      where: { id },
      relations: {
        amenities: true,
      },
      order: {
        amenities: {
          label: 'ASC',
        },
      },
    });
  }

  async exists(id: string): Promise<boolean> {
    return this.hotels.exists({ where: { id } });
  }

  async findAvailableRooms(
    hotelId: string,
    requestedDates: string[],
  ): Promise<Room[]> {
    if (requestedDates.length === 0) {
      return [];
    }

    const rows = await this.roomAvailableDates
      .createQueryBuilder('availableDate')
      .select('availableDate.roomId', 'roomId')
      .innerJoin('availableDate.room', 'room')
      .where('room.hotelId = :hotelId', { hotelId })
      .andWhere('availableDate.availableDate IN (:...requestedDates)', {
        requestedDates,
      })
      .groupBy('availableDate.roomId')
      .having('COUNT(DISTINCT availableDate.availableDate) = :nightCount', {
        nightCount: requestedDates.length,
      })
      .getRawMany<{ roomId: string }>();

    const roomIds = rows.map((row) => row.roomId);
    if (roomIds.length === 0) {
      return [];
    }

    return this.rooms.find({
      where: {
        id: In(roomIds),
      },
      relations: {
        amenities: true,
      },
      order: {
        pricePerNight: 'ASC',
        id: 'ASC',
        amenities: {
          label: 'ASC',
        },
      },
    });
  }
}
