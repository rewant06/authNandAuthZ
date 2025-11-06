import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpContextService } from './http-context.service';

@Injectable()
export class HttpContextInterceptor implements NestInterceptor {
  constructor(private readonly httpContext: HttpContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // 'request.user' is populated by our JwtStrategy
    // If it's not present (public route), we default to 'system'
    const actor = request.user;

    // Run the rest of the request inside the AsyncLocalStorage context
    return this.httpContext.run(actor, () => next.handle());
  }
}
