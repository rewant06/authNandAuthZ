import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpContextService } from './http-context.service';
import { Request } from 'express';

@Injectable()
export class HttpContextInterceptor implements NestInterceptor {
  constructor(private readonly httpContext: HttpContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    return this.httpContext.run(request, () => next.handle());
  }
}
