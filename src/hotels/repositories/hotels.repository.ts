import { SearchHotelsDto } from '../dto/search-hotels.dto';
import { Hotel } from '../entities/hotel.entity';
import { Room } from '../entities/room.entity';

export abstract class HotelsRepository {
  abstract search(filters: SearchHotelsDto): Promise<Hotel[]>;
  abstract findById(id: string): Promise<Hotel | null>;
  abstract exists(id: string): Promise<boolean>;
  abstract findAvailableRooms(
    hotelId: string,
    requestedDates: string[],
  ): Promise<Room[]>;
}
