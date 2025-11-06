import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer'; // <-- Make sure to run 'npm i class-transformer'

export class PaginationDto {
  @IsOptional()
  @Type(() => Number) // Transform query param string to number
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Don't let users request 1,000,000 items
  limit?: number = 20;
}
