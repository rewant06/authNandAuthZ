import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

// We get this from req.user
type Actor = {
  id: string;
  email: string;
  roles: { name: string }[];
};

@Injectable()
export class HttpContextService {
  private readonly storage = new AsyncLocalStorage<{ actor: Actor }>();

 run<T>(actor: Actor, fn: () => T): T {
    return this.storage.run({ actor }, fn);
  }

  getActor(): Actor | undefined {
    return this.storage.getStore()?.actor;
  }
}