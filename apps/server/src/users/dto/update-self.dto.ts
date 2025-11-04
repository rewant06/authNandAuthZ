import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSelfDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  name?: string;
}
