import { IsJWT, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @IsJWT()
  @IsNotEmpty()
  token: string;
}
