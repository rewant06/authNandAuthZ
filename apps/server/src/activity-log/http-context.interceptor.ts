import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpContextService } from './http-context.service';
import { Request } from 'express';
import { UserPayload } from 'src/auth/types/user-payload.type';

@Injectable()
export class HttpContextInterceptor implements NestInterceptor {
  constructor(private readonly httpContext: HttpContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    const actor = request.user as UserPayload | undefined;

    return this.httpContext.run(actor, () => next.handle());
  }
}
