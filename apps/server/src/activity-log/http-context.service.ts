import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Request } from 'express';
import { UserPayload } from 'src/auth/types/user-payload.type';

// We get this from req.user
type Actor =
  | UserPayload
  | { id: string; email: string; roles: { name: string }[] };

interface AppAsyncContext {
  actor: Actor;
}

@Injectable()
export class HttpContextService {
  private readonly storage = new AsyncLocalStorage<AppAsyncContext>();

  run<T>(actor: Actor | undefined, fn: () => T): T {
    const contextActor = actor || {
      id: 'system',
      email: 'system',
      roles: [{ name: 'SYSTEM' }],
    };
    return this.storage.run({ actor: contextActor }, fn);
  }

  getActor(): Actor | undefined {
    return this.storage.getStore()?.actor;
  }
  setActor(actor: Actor) {
    const store = this.storage.getStore();
    if (store) {
      store.actor = actor;
    }
  }
}
