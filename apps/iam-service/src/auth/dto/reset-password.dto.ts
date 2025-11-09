import { IsJWT, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsJWT()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
