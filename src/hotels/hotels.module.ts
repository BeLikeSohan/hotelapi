import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Amenity } from './entities/amenity.entity';
import { Hotel } from './entities/hotel.entity';
import { RoomAvailableDate } from './entities/room-available-date.entity';
import { Room } from './entities/room.entity';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { HotelsRepository } from './repositories/hotels.repository';
import { TypeOrmHotelsRepository } from './repositories/typeorm-hotels.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hotel, Room, Amenity, RoomAvailableDate]),
  ],
  controllers: [HotelsController],
  providers: [
    HotelsService,
    {
      provide: HotelsRepository,
      useClass: TypeOrmHotelsRepository,
    },
  ],
  exports: [TypeOrmModule],
})
export class HotelsModule {}
