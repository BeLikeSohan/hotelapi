import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Room } from './room.entity';

@Entity({ name: 'room_available_dates' })
@Unique('UQ_room_available_dates_room_date', ['roomId', 'availableDate'])
export class RoomAvailableDate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'room_id', type: 'text' })
  roomId!: string;

  @Column({ name: 'available_date', type: 'date' })
  availableDate!: string;

  @ManyToOne(() => Room, (room) => room.availableDates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room!: Room;
}
