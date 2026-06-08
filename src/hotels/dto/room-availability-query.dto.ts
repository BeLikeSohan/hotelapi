import { Matches } from 'class-validator';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export class RoomAvailabilityQueryDto {
  @Matches(isoDatePattern, {
    message: 'check_in must be an ISO date in YYYY-MM-DD format',
  })
  check_in!: string;

  @Matches(isoDatePattern, {
    message: 'check_out must be an ISO date in YYYY-MM-DD format',
  })
  check_out!: string;
}
