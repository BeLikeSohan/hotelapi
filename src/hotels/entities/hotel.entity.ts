import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Amenity } from './amenity.entity';
import { numericColumnTransformer } from './numeric-column.transformer';
import { Room } from './room.entity';

@Entity({ name: 'hotels' })
@Check('CHK_hotels_star_rating_range', '"star_rating" BETWEEN 1 AND 5')
@Check(
  'CHK_hotels_overall_rating_range',
  '"overall_rating" >= 0 AND "overall_rating" <= 5',
)
@Check('CHK_hotels_review_count_nonnegative', '"review_count" >= 0')
export class Hotel {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'star_rating', type: 'smallint' })
  starRating!: number;

  @Column({
    name: 'overall_rating',
    type: 'numeric',
    precision: 2,
    scale: 1,
    transformer: numericColumnTransformer,
  })
  overallRating!: number;

  @Column({ name: 'review_count', type: 'integer' })
  reviewCount!: number;

  @Column({ name: 'address_street', type: 'text' })
  addressStreet!: string;

  @Column({ name: 'address_city', type: 'text' })
  addressCity!: string;

  @Column({ name: 'address_state', type: 'text' })
  addressState!: string;

  @Column({ name: 'address_zip_code', type: 'text' })
  addressZipCode!: string;

  @Column({ name: 'address_country', type: 'text' })
  addressCountry!: string;

  @Column({ name: 'contact_phone', type: 'text' })
  contactPhone!: string;

  @Column({ name: 'contact_email', type: 'text' })
  contactEmail!: string;

  @Column({ name: 'check_in_time', type: 'time' })
  checkInTime!: string;

  @Column({ name: 'check_out_time', type: 'time' })
  checkOutTime!: string;

  @Column({ name: 'cancellation_policy', type: 'text' })
  cancellationPolicy!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Room, (room) => room.hotel)
  rooms!: Room[];

  @ManyToMany(() => Amenity, (amenity) => amenity.hotels)
  @JoinTable({
    name: 'hotel_amenities',
    joinColumn: {
      name: 'hotel_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'amenity_id',
      referencedColumnName: 'id',
    },
  })
  amenities!: Amenity[];
}
