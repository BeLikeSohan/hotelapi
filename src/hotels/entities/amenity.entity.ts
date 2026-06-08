import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Hotel } from './hotel.entity';
import { Room } from './room.entity';

@Entity({ name: 'amenities' })
@Unique('UQ_amenities_code', ['code'])
export class Amenity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  code!: string;

  @Column({ type: 'text' })
  label!: string;

  @ManyToMany(() => Hotel, (hotel) => hotel.amenities)
  hotels!: Hotel[];

  @ManyToMany(() => Room, (room) => room.amenities)
  rooms!: Room[];
}
