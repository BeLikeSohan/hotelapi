import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SearchHotelsDto } from './search-hotels.dto';

describe('SearchHotelsDto', () => {
  it('trims city and converts numeric query params', async () => {
    const dto = plainToInstance(SearchHotelsDto, {
      city: '  Chicago  ',
      star_rating: '5',
      min_price: '150.50',
      max_price: '300',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto).toMatchObject({
      city: 'Chicago',
      star_rating: 5,
      min_price: 150.5,
      max_price: 300,
    });
  });

  it('allows an empty query object', async () => {
    const dto = plainToInstance(SearchHotelsDto, {});

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects star ratings outside the supported range', async () => {
    const dto = plainToInstance(SearchHotelsDto, {
      star_rating: '6',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('star_rating');
    expect(errors[0].constraints).toHaveProperty('max');
  });

  it('rejects fractional star ratings', async () => {
    const dto = plainToInstance(SearchHotelsDto, {
      star_rating: '4.5',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('star_rating');
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('rejects negative prices and non-numeric price values', async () => {
    const dto = plainToInstance(SearchHotelsDto, {
      min_price: '-1',
      max_price: 'not-a-number',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property).sort()).toEqual([
      'max_price',
      'min_price',
    ]);
  });
});
