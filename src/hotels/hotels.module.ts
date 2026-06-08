import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Amenity } from './entities/amenity.entity';
import { Hotel } from './entities/hotel.entity';
import { RoomAvailableDate } from './entities/room-available-date.entity';
import { Room } from './entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hotel, Room, Amenity, RoomAvailableDate]),
  ],
  exports: [TypeOrmModule],
})
export class HotelsModule {}
