import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Request } from 'express';
import { UserPayload } from 'src/auth/types/user-payload.type';

// We get this from req.user
type Actor =
  | UserPayload
  | { id: string; email: string; roles: { name: string }[] };

interface AppAsyncContext {
  req: Request;
}

@Injectable()
export class HttpContextService {
  private readonly storage = new AsyncLocalStorage<AppAsyncContext>();

  run<T>(req: Request, fn: () => T): T {
    return this.storage.run({ req }, fn);
  }

  getActor(): Actor | undefined {
    const req = this.storage.getStore()?.req;

    return (
      (req?.user as Actor) || {
        id: 'system',
        email: 'system',
        roles: [{ name: 'SYSTEM' }],
      }
    );
  }
  setActor(actor: Actor) {
    const store = this.storage.getStore();
    if (store && store.req) {
      store.req.user = actor;
    }
  }

  // Get the ip and User-Agent

  getRequest(): Request | undefined {
    return this.storage.getStore()?.req;
  }
}
