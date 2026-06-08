import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export class RoomAvailabilityQueryDto {
  @ApiProperty({
    description: 'Inclusive check-in date in YYYY-MM-DD format.',
    example: '2026-07-10',
  })
  @Matches(isoDatePattern, {
    message: 'check_in must be an ISO date in YYYY-MM-DD format',
  })
  check_in!: string;

  @ApiProperty({
    description: 'Exclusive check-out date in YYYY-MM-DD format.',
    example: '2026-07-12',
  })
  @Matches(isoDatePattern, {
    message: 'check_out must be an ISO date in YYYY-MM-DD format',
  })
  check_out!: string;
}
