import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  isAnonymous: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  authorDisplayName?: string;
}
