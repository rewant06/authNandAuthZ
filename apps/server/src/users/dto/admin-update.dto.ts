import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  name?: string;

  // We allow an admin to set roles by their name
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[]; // e.g., ["USER"] or ["USER", "MODERATOR"]
}
