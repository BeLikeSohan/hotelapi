import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class SearchHotelsDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive exact city match after trimming.',
    example: 'Chicago',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  city?: string;

  @ApiPropertyOptional({
    description: 'Hotel star rating from 1 to 5.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  star_rating?: number;

  @ApiPropertyOptional({
    description: 'Minimum room price per night.',
    example: 150,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({
    description: 'Maximum room price per night. Must be >= min_price.',
    example: 300,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  max_price?: number;
}
