import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import argon2d from 'argon2';
import { AuditService } from 'src/audit/audit.service';
import { LoginDto } from './dto/loginUser.dto';

const failedLoginAttempts = new Map<string, number>();
const MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private auditService: AuditService,
  ) {}

  async validateLocalUser(dto: LoginDto) {
    const timestamp = new Date().toISOString();
    const inputEmail = dto.email.trim().toLowerCase();

    //check for failed attempts

    const attempts = failedLoginAttempts.get(inputEmail) || 0;
    if (attempts >= MAX_ATTEMPTS) {
      await this.auditService.log({
        email: inputEmail,
        action: 'AUTH_LOGIN_LOCKED',
        success: false,
        reason: 'Account locked due to too many failed attempts',
        timestamp: new Date(),
      });
      throw new UnauthorizedException(
        'Account locked due to too many failed attempts',
      );
    }
    // Implement timing locked time of 15 mins
    // here we can use boolean like isLocked and a timestamp: lockedUntil to manage lock state

    const user =
      await this.usersService.findUserByEmailWithPassword(inputEmail);

    if (!user || !user.hashedPassword) {
      failedLoginAttempts.set(inputEmail, attempts + 1);
      await this.auditService.log({
        email: inputEmail,
        action: 'AUTH_LOGIN_FAILED',
        success: false,
        reason: 'Invalid email or password',
        timestamp: new Date(),
      });
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await argon2d.verify(user.hashedPassword, dto.password);

    if (!isValid) {
      failedLoginAttempts.set(inputEmail, attempts + 1);
      await this.auditService.log({
        email: inputEmail,
        action: 'AUTH_LOGIN_FAILED',
        success: false,
        reason: 'Incorrect password',
        timestamp: new Date(),
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attemps on sucessful login
    failedLoginAttempts.delete(inputEmail);

    await this.auditService.log({
      email: inputEmail,
      action: 'AUTH_LOGIN_SUCCESS',
      success: true,
      timestamp: new Date(),
    });

    const { hashedPassword: _hp, ...safeUser } = user as any;
    return safeUser;
  }
}
