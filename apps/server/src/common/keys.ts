import { readFileSync } from 'fs';
import path from 'path';

export function loadPrivateKey(): string {
  if (process.env.JWT_PRIVATE_KEY) return process.env.JWT_PRIVATE_KEY;
  const p = process.env.JWT_PRIVATE_KEY_PATH || './secrets/jwt-private.pem';
  return readFileSync(path.resolve(p), 'utf8');
}

export function loadPublicKey(): string {
  if (process.env.JWT_PUBLIC_KEY) return process.env.JWT_PUBLIC_KEY;
  const p = process.env.JWT_PUBLIC_KEY_PATH || './secrets/jwt-public.pem';
  return readFileSync(path.resolve(p), 'utf8');
}
