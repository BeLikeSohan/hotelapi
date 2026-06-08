import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Amenity } from './amenity.entity';
import { Hotel } from './hotel.entity';
import { numericColumnTransformer } from './numeric-column.transformer';
import { RoomAvailableDate } from './room-available-date.entity';

@Entity({ name: 'rooms' })
@Check('CHK_rooms_bed_count_positive', '"bed_count" > 0')
@Check('CHK_rooms_max_occupancy_positive', '"max_occupancy" > 0')
@Check('CHK_rooms_square_footage_positive', '"square_footage" > 0')
@Check('CHK_rooms_price_per_night_nonnegative', '"price_per_night" >= 0')
export class Room {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ name: 'hotel_id', type: 'text' })
  hotelId!: string;

  @Column({ type: 'text' })
  type!: string;

  @Column({ name: 'bed_type', type: 'text' })
  bedType!: string;

  @Column({ name: 'bed_count', type: 'smallint' })
  bedCount!: number;

  @Column({ name: 'max_occupancy', type: 'smallint' })
  maxOccupancy!: number;

  @Column({ name: 'square_footage', type: 'integer' })
  squareFootage!: number;

  @Column({
    name: 'price_per_night',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericColumnTransformer,
  })
  pricePerNight!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel!: Hotel;

  @ManyToMany(() => Amenity, (amenity) => amenity.rooms)
  @JoinTable({
    name: 'room_amenities',
    joinColumn: {
      name: 'room_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'amenity_id',
      referencedColumnName: 'id',
    },
  })
  amenities!: Amenity[];

  @OneToMany(() => RoomAvailableDate, (availableDate) => availableDate.room)
  availableDates!: RoomAvailableDate[];
}
