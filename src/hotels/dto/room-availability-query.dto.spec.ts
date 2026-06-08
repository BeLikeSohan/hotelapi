import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RoomAvailabilityQueryDto } from './room-availability-query.dto';

describe('RoomAvailabilityQueryDto', () => {
  it('accepts YYYY-MM-DD check-in and check-out dates', async () => {
    const dto = plainToInstance(RoomAvailabilityQueryDto, {
      check_in: '2026-07-10',
      check_out: '2026-07-12',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects dates that are not in YYYY-MM-DD format', async () => {
    const dto = plainToInstance(RoomAvailabilityQueryDto, {
      check_in: '07/10/2026',
      check_out: '2026-7-12',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property).sort()).toEqual([
      'check_in',
      'check_out',
    ]);
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('requires both date fields', async () => {
    const dto = plainToInstance(RoomAvailabilityQueryDto, {});

    const errors = await validate(dto);

    expect(errors.map((error) => error.property).sort()).toEqual([
      'check_in',
      'check_out',
    ]);
  });
});
